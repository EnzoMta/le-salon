// TP 1.2 — Le même appel avec fetch, sans SDK : tout ce qu'un SDK fait pour vous.
import { config, requireKey } from "../src/config.js";

const question = process.argv.slice(2).join(" ") || "Donne trois usages d'un LLM dans une application métier.";

const t0 = performance.now();
// TODO : Envoyer la requête POST vers ${config.baseURL}/chat/completions : en-têtes Authorization et Content-Type, corps JSON avec model, messages (un system + un user), temperature et max_tokens.
const res: Response = await fetch(`${config.baseURL}/chat/completions`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${requireKey()}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: config.model,
    messages: [
      { role: "system", content: "Tu réponds en français, de façon concise." },
      { role: "user", content: question },
    ],
    temperature: 0.2,
    max_tokens: 300,
  }),
});

// TODO : Si la réponse n'est pas OK (res.ok), afficher le code HTTP et le corps d'erreur, puis quitter.
if (!res.ok) {
  console.error(`Erreur HTTP ${res.status} : ${await res.text()}`);
  process.exit(1);
}

const data = (await res.json()) as {
  model: string;
  choices: { message: { content: string }; finish_reason: string }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};
const ms = Math.round(performance.now() - t0);

// TODO : Afficher le texte de la réponse, le modèle exact (data.model : la version datée derrière l'alias), la raison d'arrêt (finish_reason), l'usage en tokens, la latence et les requêtes restantes (en-tête x-ratelimit-remaining-requests).
const [choice] = data.choices;
console.log(choice?.message.content);
console.log(`\nmodèle : ${data.model} · arrêt : ${choice?.finish_reason}`);
console.log(
  `tokens : ${data.usage.prompt_tokens} entrée + ${data.usage.completion_tokens} sortie = ${data.usage.total_tokens}`,
);
console.log(
  `latence : ${ms} ms · requêtes restantes : ${res.headers.get("x-ratelimit-remaining-requests") ?? "?"}`,
);
