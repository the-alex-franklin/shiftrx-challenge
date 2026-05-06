import OpenAI from "openai";
import { runScenario } from "./harness.ts";
import { SCENARIOS } from "./scenarios.ts";
import { env_vars } from "../env.ts";

const apiKey = env_vars.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Error: OPENAI_API_KEY is not set");
  Deno.exit(1);
}

const openai = new OpenAI({ apiKey });

const filter = Deno.args[0];
const scenarios = filter
  ? SCENARIOS.filter((s) => s.name.includes(filter))
  : SCENARIOS;

if (scenarios.length === 0) {
  console.error(`No scenarios match filter: "${filter}"`);
  Deno.exit(1);
}

console.log(`Running ${scenarios.length} eval scenario(s)...\n`);

const results = await Promise.all(scenarios.map((s) => runScenario(openai, s)));

let passed = 0;
for (const r of results) {
  const icon = r.passed ? "✓" : "✗";
  console.log(`${icon}  ${r.scenario}`);
  if (!r.passed) {
    console.log(`expected tool: ${r.expectedTool}`);
    console.log(`got tool: ${r.toolSelected}`);
    if (r.error) console.log(`error: ${r.error}`);
    if (r.response) {
      console.log(`response: ${r.response.slice(0, 300)}`);
    }
  }
  if (r.passed) passed++;
}

const total = results.length;
console.log(`\n${passed}/${total} passed`);
if (passed < total) Deno.exit(1);
