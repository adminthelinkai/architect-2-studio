import { z } from "zod";
const uniqueIds = (items: { id: string }[]) =>
  new Set(items.map((item) => item.id)).size === items.length;
const text = z.string().max(100000),
  short = z.string().max(300),
  id = z
    .string()
    .min(1)
    .max(150)
    .regex(/^[a-zA-Z0-9_-]+$/);
const agent = z.object({
  id,
  name: short,
  role: text,
  framework: short,
  model: short,
  instructions: text,
  tools: z.array(short).max(50),
  approval: z.boolean(),
  budget: z.number().finite().min(0.01).max(1000),
});
export const projectSchema = z.object({
  id,
  name: short,
  description: text,
  kind: short,
  status: short,
  framework: short,
  brief: text,
  title: short,
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  agents: z.array(agent).max(100).refine(uniqueIds, "Duplicate agent IDs"),
  blueprint: text,
  messages: z.array(z.object({ role: short, text })).max(500),
  history: z
    .array(
      z.object({ id, label: short, date: short, title: short, brief: text }),
    )
    .max(500),
  repo: text,
  branch: short,
  tests: z.array(z.object({ name: text, status: short })).max(200),
  deployments: z
    .array(
      z.object({
        id,
        environment: short,
        date: short,
        version: short,
        status: short,
      }),
    )
    .max(500),
  records: z
    .array(z.object({ id, name: short, email: short, role: short }))
    .max(1000),
  auth: z.boolean(),
  notes: z.array(text).max(500),
  code: text,
});
export const workspaceInput = z.object({
  revision: z
    .number()
    .int()
    .nonnegative()
    .max(Number.MAX_SAFE_INTEGER - 1),
  state: z.object({
    projects: z
      .array(projectSchema)
      .max(60)
      .refine(uniqueIds, "Duplicate project IDs"),
    connections: z
      .array(
        z.object({
          name: short,
          category: short,
          description: text,
          connected: z.boolean(),
          scope: text,
        }),
      )
      .max(100),
    knowledge: z
      .array(
        z.object({ id, name: short, type: short, size: short, status: short }),
      )
      .max(500),
    members: z
      .array(z.object({ name: short, email: short, role: short }))
      .max(200),
    approvals: z
      .array(z.object({ id, title: text, detail: text, status: short }))
      .max(500),
    settings: z.object({
      name: short,
      budget: z.number().finite().min(1).max(10000),
      notifications: z.boolean(),
      theme: short,
      knowledge: text,
    }),
  }),
});
