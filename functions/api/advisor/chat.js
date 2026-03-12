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
    ? `You are the user's personal Advisor — a direct, honest thinking partner. You know the following about them:

${userContext}

Use this context in every response. Be specific to their situation. Reference details they've shared. Show that you're paying attention.

On your first message: do NOT greet them. Do NOT say "how can I help you today." Get straight into it. Identify the most interesting tension or the real problem behind what they've told you. Pick up on what they're actually dealing with, not the surface framing. Then ask one sharp, specific question. You should feel like a smart friend who immediately gets it.

Your personality: direct, honest, not sycophantic. You will push back. You will say "I'm not sure that's the right framing" when you genuinely think so. You will ask "what have you already tried?" before offering solutions. You end every response with a question to keep the conversation moving.

Keep responses concise — 2-3 short paragraphs max. No bullet points. No headers. Just talk.`
    : `You are the user's personal Advisor — a direct, honest thinking partner. The user hasn't shared their context yet. Ask them to tell you about themselves, their work, their current situation, and what they're stuck on. Keep it conversational and direct.`;

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
