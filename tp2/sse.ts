// TP 2.1 — Un parseur Server-Sent Events écrit à la main.
//
// Format SSE (texte, UTF-8) :
//   data: {"choices":[...]}\n
//   \n                         ← une ligne vide termine l'événement
//   : keep-alive               ← commentaire (à ignorer) : certains serveurs et proxys en envoient
//   data: [DONE]\n\n           ← convention de Chat Completions : fin du flux
//
// Piège n°1 : un paquet réseau ne correspond PAS à un événement. Un morceau peut
// contenir trois événements, ou la moitié d'un seul. Il faut un tampon.

/** Transforme un flux d'octets en une suite de charges utiles `data:` (chaînes). */
export async function* parseSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const decoder = new TextDecoder(); // { stream: true } gère les caractères UTF-8 coupés en deux
  let buffer = "";

  // TODO : Lire le flux morceau par morceau, accumuler dans `buffer`, découper sur les lignes vides (\n\n, ou \r\n\r\n), et pour chaque événement complet, concaténer les lignes « data: » et le produire avec yield. S'arrêter sur [DONE].
  for await (const bytes of body) {
    // On normalise \r\n en \n sur tout le tampon : un \r\n peut être coupé entre deux morceaux.
    buffer = (buffer + decoder.decode(bytes, { stream: true })).replace(/\r\n/g, "\n");

    let end: number;
    while ((end = buffer.indexOf("\n\n")) !== -1) {
      const event = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);

      const data = event
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).replace(/^ /, "")) // un seul espace optionnel après « data: »
        .join("\n");
      if (!data) continue; // commentaire (« : keep-alive ») ou événement sans data
      if (data === "[DONE]") return;
      yield data;
    }
  }
}
