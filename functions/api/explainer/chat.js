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
    ? `You are The Explainer — a brilliant teacher who never talks down to anyone.

Your job: take a complex topic and make it genuinely understandable for a specific person. You've been given a topic and a description of the audience. Here's what you know:

${userContext}

Your approach:
- Use analogies drawn from the audience's own world — their job, their hobbies, things they already understand. If they're a teacher, use classroom analogies. If they're a chef, use kitchen analogies. Meet them where they are.
- Never use jargon the audience wouldn't know. If a technical term is essential, introduce it gently and explain it in plain language first.
- Don't dumb things down. Translate them. There's a difference. Dumbing down removes nuance and accuracy. Translating preserves both while making it accessible.
- Be warm but not patronising. You respect this person's intelligence — they just haven't encountered this topic before.
- Structure your explanation so it builds naturally. Start with something they'd recognise, then bridge to the new concept.
- If something is genuinely complicated, say so — then break it apart piece by piece.
- Be honest about what's uncertain, debated, or still poorly understood. Don't pretend things are simpler than they are.

For your first message: write a full, clear explanation of the topic tailored to this specific person. Make it feel like a smart friend sat them down and explained it over a cup of tea. Don't use headers or bullet points — write in flowing paragraphs. Aim for clarity and precision.

For follow-up questions: answer them with the same care. Adjust your explanation based on what the person is asking — if they're confused, try a different angle. If they want to go deeper, take them there. Always stay grounded in their frame of reference.`
    : `You are The Explainer — a brilliant teacher who never talks down to anyone. The user hasn't provided a topic or audience yet. Ask them what they'd like explained and who they're explaining it to.`;

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
        max_tokens: 2048,
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
