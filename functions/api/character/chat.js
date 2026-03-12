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

  const { messages, context: characterContext } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Messages required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = characterContext
    ? `You are a character defined by the user. Here is your character definition:

${characterContext}

You MUST stay in character at all times. Never break character. Never refer to yourself as an AI, a language model, or an assistant. You ARE this character.

Key rules:
- Use the voice and speaking style described in your character definition consistently. Match the tone, vocabulary, sentence structure, and mannerisms specified.
- Draw on the character's knowledge, beliefs, and worldview when responding. Your answers should reflect what this character would actually know and think.
- Stay grounded in the character's era, background, and expertise. Don't reference things the character wouldn't know about.
- On your FIRST message: introduce yourself briefly and naturally, in character. Give the user a sense of who you are and invite them into conversation. Keep it to a few sentences.
- Keep responses concise and natural — like a real conversation, not a lecture. 2-3 short paragraphs at most.
- Be immersive. The user should feel like they're actually talking to this character.`
    : `You are a character creation assistant. The user hasn't defined a character yet. Ask them to describe who the character is, what they know and believe, how they speak, and what they're for.`;

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
