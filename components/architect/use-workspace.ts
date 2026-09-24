"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { seedWorkspace, type Workspace } from "./model";
import { z } from "zod";
import { workspaceInput } from "@/db/validation";

const loadResponse = z.object({
  state: workspaceInput.shape.state.nullable(),
  revision: workspaceInput.shape.revision,
});
const acknowledgement = z.object({ revision: workspaceInput.shape.revision });
const errorMessage = (data: unknown, fallback: string) =>
  z.object({ error: z.string() }).safeParse(data).data?.error || fallback;

/** Serializes saves, preserves failed edits, and never treats a failed load as a new workspace. */
export function useWorkspace(demo = false) {
  const [ws, setWs] = useState<Workspace>(seedWorkspace);
  const [loaded, setLoaded] = useState(demo);
  const [saveStatus, setSaveStatus] = useState(
    demo ? "Demo · session only" : "Loading workspace",
  );
  const [saveError, setSaveError] = useState("");
  const [saveConflict, setSaveConflict] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const revision = useRef(0);
  const latest = useRef<Workspace | null>(null);
  const saved = useRef("");
  const blocked = useRef(false);
  const chain = useRef(Promise.resolve());
  useEffect(() => {
    latest.current = ws;
  }, [ws]);
  useEffect(() => {
    if (demo) return;
    const controller = new AbortController();
    fetch("/api/workspace", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const raw: unknown = await response.json();
        if (!response.ok)
          throw new Error(errorMessage(raw, "Unable to load your workspace"));
        const data = loadResponse.parse(raw);
        if (!Number.isSafeInteger(data.revision) || data.revision < 0)
          throw new Error("Invalid workspace response. Please retry loading.");
        const state =
          data.state === null
            ? seedWorkspace()
            : workspaceInput.parse(data).state;
        if (controller.signal.aborted) return;
        saved.current = data.state === null ? "" : JSON.stringify(state);
        revision.current = data.revision;
        latest.current = state;
        setWs(state);
        setLoaded(true);
        setSaveError("");
        setSaveStatus("All changes saved");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setSaveError(
          error instanceof Error
            ? error.message
            : "Unable to load your workspace",
        );
        setSaveStatus("Not loaded");
      });
    return () => controller.abort();
  }, [loadAttempt, demo]);
  useEffect(() => {
    if (demo || !loaded || blocked.current) return;
    const snapshot = JSON.stringify(ws);
    if (snapshot === saved.current) return;
    setSaveStatus("Saving changes");
    const timer = setTimeout(() => {
      chain.current = chain.current.then(async () => {
        if (blocked.current || latest.current !== ws) return;
        try {
          const response = await fetch("/api/workspace", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: ws, revision: revision.current }),
          });
          const raw: unknown = await response.json();
          if (!response.ok) {
            if (response.status === 409) {
              blocked.current = true;
              setSaveConflict(true);
            }
            throw new Error(errorMessage(raw, "Could not save your changes"));
          }
          const data = acknowledgement.parse(raw);
          if (
            !Number.isSafeInteger(data.revision) ||
            data.revision !== revision.current + 1
          )
            throw new Error(
              "Save acknowledgement was invalid. Export your changes before reloading.",
            );
          revision.current = data.revision;
          saved.current = snapshot;
          setSaveError("");
          // An older response cannot certify a newer, unsaved edit.
          if (latest.current === ws) setSaveStatus("All changes saved");
        } catch (error) {
          setSaveStatus("Not saved");
          setSaveError(
            error instanceof Error
              ? error.message
              : "Could not save your changes",
          );
        }
      });
    }, 650);
    return () => clearTimeout(timer);
  }, [ws, loaded, saveAttempt, demo]);
  useEffect(() => {
    if (demo) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (
        loaded &&
        latest.current &&
        JSON.stringify(latest.current) !== saved.current
      ) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [loaded, demo]);
  const retryLoad = useCallback(() => {
    setSaveError("");
    setSaveStatus("Loading workspace");
    setLoadAttempt((n) => n + 1);
  }, []);
  const retrySave = useCallback(() => setSaveAttempt((n) => n + 1), []);
  return {
    ws,
    setWs,
    loaded,
    saveStatus,
    saveError,
    saveConflict,
    retryLoad,
    retrySave,
  };
}
