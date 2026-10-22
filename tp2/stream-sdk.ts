// TP 2.3 — Le même flux avec le SDK : il fait le parsing SSE pour vous.
import { config, openai } from "../src/config.js";

const client = openai();
const t0 = performance.now();
let first: number | null = null;

// TODO : Appeler client.chat.completions.create avec stream: true, itérer sur les morceaux (chunk.choices[0].delta.content) et afficher le texte au fil de l'eau. Mesurer le TTFT. Demandez l'usage avec stream_options : il arrive dans un dernier morceau sans choices.
const stream = await client.chat.completions.create({
  model: config.model,
  stream: true,
  stream_options: { include_usage: true },
  messages: [{ role: "user", content: process.argv.slice(2).join(" ") || "Explique le streaming HTTP en cinq phrases." }],
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) {
    first ??= performance.now() - t0;
    process.stdout.write(delta);
  }
  if (chunk.usage) console.log(`\n\nusage : ${chunk.usage.prompt_tokens} + ${chunk.usage.completion_tokens} tokens`);
}
console.log(`TTFT ${Math.round(first ?? 0)} ms · total ${Math.round(performance.now() - t0)} ms`);
