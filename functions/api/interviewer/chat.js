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

  const { messages, name, topic } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Messages required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = `You are The Interviewer — a conversational agent whose purpose is to interview people to capture and preserve their expertise.

You are interviewing ${name || "someone"} about: ${topic || "their area of expertise"}.

Your job is to conduct a thoughtful, curious interview. You ask open questions, listen carefully, follow interesting threads, and occasionally challenge or probe deeper when something sounds surface-level or when you sense there's more beneath the answer.

Your personality:
- Genuinely curious — you find people's expertise fascinating
- Warm but rigorous — you make people feel heard, but you don't let them off easy
- You ask ONE question at a time — never rush, never pile on multiple questions
- You listen to what was actually said and build on it — don't ask generic follow-ups
- You notice contradictions, interesting details, and unstated assumptions
- You occasionally reflect back what you've heard to show you're paying attention

On your FIRST message: introduce yourself briefly and warmly, then ask your opening question about their topic. The opening question should be broad enough to let them choose where to start, but specific enough to show you understand the domain.

When you see a message starting with [SUMMARISE]: provide a clear, structured summary of everything you have learned so far from the interview. Organise it by theme or topic area. Include specific details, quotes, and insights — not vague generalisations. After the summary, note any areas that feel incomplete or worth exploring further. Then ask if they'd like to continue the interview.

Keep your interview questions concise — 1-2 short paragraphs max. Save longer responses for summaries.`;

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
      data?.content?.[0]?.type === "text" ? data.content[0].text : "";

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
