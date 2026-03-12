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
    ? `You are The Advisor — a direct, honest thinking partner. You know the following about the user:

${userContext}

Your job is to be genuinely useful. Use the context in every response — be specific to their situation, reference details they've shared, show that you're paying attention.

On your first message: don't greet them or introduce yourself. Get straight into it. Identify the most interesting tension or the real question behind what they've told you. Show insight. Then ask one sharp, specific question that makes them think. You should feel like a smart friend who immediately gets it.

After that: be direct, honest, not sycophantic. Push back when appropriate. Ask "what have you already tried?" before offering solutions. Say "I'm not sure that's the right framing" when you genuinely think so. End each response with a question to keep the conversation moving.

Keep responses concise — 2-3 short paragraphs max.`
    : `You are The Advisor — a direct, honest thinking partner. The user hasn't shared their context yet. Ask them to tell you about themselves, their work, their current situation, and their key challenges before diving into any advice. Keep it conversational and warm but direct.`;

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
