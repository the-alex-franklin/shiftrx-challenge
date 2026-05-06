import type { Scenario } from "./harness.ts";

const SHIFT_ID = "41b84d82-0c5f-4e28-a2b2-3704f45d6ef9";
const PROVIDER_ID = "6a2e8324-79b6-413e-8397-d636682f563f";

export const SCENARIOS: Scenario[] = [
  {
    name: "get shifts for today",
    userMessage: "What shifts are scheduled for today?",
    expectedTool: "get_shifts",
    mockToolResponse: JSON.stringify([
      {
        id: SHIFT_ID,
        role: "RN",
        startTime: "2026-05-06T07:00:00Z",
        endTime: "2026-05-06T19:00:00Z",
        status: "scheduled",
        provider: { id: PROVIDER_ID, name: "Dr. Jane Smith", role: "RN" },
      },
    ]),
    expectResponseToMatch: /shift|scheduled|working/i,
  },
  {
    name: "report provider calloff",
    userMessage:
      `Provider ID ${PROVIDER_ID} is calling off shift ${SHIFT_ID} — she has a family emergency`,
    expectedTool: "report_calloff",
    mockToolResponse: JSON.stringify({
      id: "c3d4e5f6-0000-0000-0000-000000000001",
      shiftId: SHIFT_ID,
      reportedBy: PROVIDER_ID,
      reason: "family emergency",
      reportedAt: "2026-05-06T08:00:00Z",
      resolved: false,
    }),
    expectResponseToMatch: /call.?off|recorded|cancelled|coverage/i,
  },
  {
    name: "find coverage candidates",
    userMessage: `Who can cover shift ${SHIFT_ID}?`,
    expectedTool: "get_coverage_candidates",
    mockToolResponse: JSON.stringify([
      {
        id: "p-2",
        name: "Dr. Maria Lopez",
        role: "RN",
        email: "mlopez@hospital.com",
      },
      {
        id: "p-3",
        name: "Dr. Tom Reed",
        role: "RN",
        email: "treed@hospital.com",
      },
    ]),
    expectResponseToMatch: /Lopez|Reed|available|cover/i,
  },
  {
    name: "assign provider to shift",
    userMessage: `Assign provider ${PROVIDER_ID} to shift ${SHIFT_ID}`,
    expectedTool: "assign_provider",
    mockToolResponse: JSON.stringify({
      id: SHIFT_ID,
      providerId: PROVIDER_ID,
      status: "scheduled",
      role: "RN",
      startTime: "2026-05-06T07:00:00Z",
      endTime: "2026-05-06T19:00:00Z",
    }),
    expectResponseToMatch: /assigned|scheduled|confirmed/i,
  },
  {
    name: "create a new shift",
    userMessage:
      `Create an RN shift for provider ${PROVIDER_ID} on 2026-05-07 from 19:00 to 07:00 next day`,
    expectedTool: "create_shift",
    mockToolResponse: JSON.stringify({
      id: "new-shift-id",
      providerId: PROVIDER_ID,
      startTime: "2026-05-07T19:00:00Z",
      endTime: "2026-05-08T07:00:00Z",
      role: "RN",
      status: "scheduled",
    }),
    expectResponseToMatch: /created|scheduled/i,
  },
  {
    name: "cancel a shift",
    userMessage: `Cancel shift ${SHIFT_ID}`,
    expectedTool: "cancel_shift",
    mockToolResponse: JSON.stringify({
      id: SHIFT_ID,
      status: "cancelled",
      providerId: null,
    }),
    expectResponseToMatch: /cancel/i,
  },
];
