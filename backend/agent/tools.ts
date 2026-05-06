import OpenAI from "openai";

export const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_shifts",
      description:
        "Get scheduled shifts within a date range, including the assigned provider for each. Use this for any question about who is working or what shifts exist.",
      parameters: {
        type: "object",
        properties: {
          start: { type: "string", description: "ISO 8601 start datetime" },
          end: { type: "string", description: "ISO 8601 end datetime" },
        },
        required: ["start", "end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_coverage_candidates",
      description:
        "Get providers who could cover an uncovered shift — same role, different provider",
      parameters: {
        type: "object",
        properties: {
          shift_id: {
            type: "string",
            description: "UUID of the shift needing coverage",
          },
        },
        required: ["shift_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "assign_provider",
      description: "Assign a provider to cover a shift, marking it as filled",
      parameters: {
        type: "object",
        properties: {
          shift_id: { type: "string", description: "UUID of the shift" },
          provider_id: {
            type: "string",
            description: "UUID of the provider to assign",
          },
        },
        required: ["shift_id", "provider_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "report_calloff",
      description:
        "Report that a provider is calling off a shift, marking it as uncovered",
      parameters: {
        type: "object",
        properties: {
          shift_id: { type: "string", description: "UUID of the shift" },
          provider_id: {
            type: "string",
            description: "UUID of the provider calling off",
          },
          reason: { type: "string", description: "Reason for the calloff" },
        },
        required: ["shift_id", "provider_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_shift",
      description: "Create a new scheduled shift for a provider",
      parameters: {
        type: "object",
        properties: {
          provider_id: { type: "string", description: "UUID of the provider" },
          start_time: {
            type: "string",
            description: "ISO 8601 start datetime",
          },
          end_time: { type: "string", description: "ISO 8601 end datetime" },
          role: {
            type: "string",
            description: "Role for the shift e.g. Nurse, Physician, Tech",
          },
          notes: { type: "string", description: "Optional notes" },
        },
        required: ["provider_id", "start_time", "end_time", "role"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_shift",
      description:
        "Cancel a shift, removing the provider assignment and marking it as cancelled",
      parameters: {
        type: "object",
        properties: {
          shift_id: {
            type: "string",
            description: "UUID of the shift to cancel",
          },
        },
        required: ["shift_id"],
      },
    },
  },
];
