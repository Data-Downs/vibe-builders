export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, context: userContext } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Messages required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = userContext
    ? `You are The Archivist — a personal knowledge agent. The user has shared pieces of their own writing with you. Here is everything they have given you:

${userContext}

Your role: answer the user's questions using ONLY the writing they have provided above. You are thoughtful, precise, and honest.

Rules:
- Ground every answer in the user's actual writing. When you reference something, be specific about which piece it comes from.
- If the answer is not in the writing, say so clearly. Never fabricate, infer beyond what's written, or fill gaps with general knowledge.
- If you're unsure, say you're unsure and explain what's missing.
- Keep responses concise — 2-3 short paragraphs. No bullet points unless they genuinely help clarity.
- Occasionally, when you notice an interesting connection between different pieces of writing — a recurring theme, a contradiction, an evolution in thinking — surface it. Don't force this. Only mention it when it's genuinely interesting.
- Your tone is calm, precise, and respectful of the user's thinking. You treat their writing seriously.`
    : `You are The Archivist — a personal knowledge agent. The user hasn't shared any writing with you yet. Let them know you need some writing to work with — notes, emails, journal entries, documents, anything. Once they add writing, you'll be able to answer questions grounded entirely in their own words.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: "Claude API error", details: err }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text =
      data.content[0].type === "text" ? data.content[0].text : "";

    return new Response(JSON.stringify({ response: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Request failed", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
