import { auth, defineMcp } from "@lovable.dev/mcp-js";

import listEventsTool from "./tools/list-events";
import verifyCertificateTool from "./tools/verify-certificate";
import listMyCertificatesTool from "./tools/list-my-certificates";
import listMyTasksTool from "./tools/list-my-tasks";
import createEventTool from "./tools/create-event";

// The OAuth issuer MUST be the direct Supabase host. On publish, SUPABASE_URL is
// rewritten to a proxy that mcp-js rejects, and process.env.VITE_* is undefined
// on the Workers runtime. Read the project ref via import.meta.env — Vite inlines
// it as a literal at build time. The fallback keeps the issuer well-formed during
// the throwaway manifest-extract eval; the published build inlines the real ref.
const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "interactup-os-mcp",
  title: "InteractUp OS",
  version: "0.1.0",
  instructions:
    "Tools for the InteractUp community OS. Read events and certificates, verify certificate codes, list your assigned tasks, and (as staff) create new events. All actions run as the signed-in InteractUp user, so what you can see and change matches your role.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listEventsTool,
    verifyCertificateTool,
    listMyCertificatesTool,
    listMyTasksTool,
    createEventTool,
  ],
});
