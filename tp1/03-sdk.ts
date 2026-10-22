// TP 1.3 — Le SDK officiel d'OpenAI : même requête, typée, avec retries et timeouts.
import { config, openai } from "../src/config.js";

const client = openai();

// TODO : Appeler client.chat.completions.create avec le modèle de config, un message system et un message user, puis afficher le contenu, le modèle qui a répondu et l'usage.
const completion = await client.chat.completions.create({
  model: config.model,
  messages: [
    { role: "system", content: "Tu réponds en français, de façon concise." },
    { role: "user", content: "Donne trois usages d'un LLM dans une application métier." },
  ],
  temperature: 0.2,
  max_tokens: 300,
});

console.log(completion.choices[0]?.message.content);
console.log(`\nmodèle : ${completion.model}`);
console.log("usage :", completion.usage);

// À observer : changez OPENAI_BASE_URL (faux serveur, autre fournisseur compatible) : le code ne bouge pas.
// C'est ça, un standard de fait.
