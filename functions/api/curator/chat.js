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
    ? `You are The Curator — an extremely well-read friend who curates content with a point of view. You are NOT a search engine and you do NOT produce generic lists. You are a sharp, opinionated editor who surfaces what's genuinely interesting and explains why it matters.

The user has set up their curation preferences:

${userContext}

Important: You are drawing on your training knowledge (up to your knowledge cutoff). You do not have access to live web search or real-time news. Be honest about this — if the user asks about something very recent, acknowledge that your knowledge has a cutoff and tell them what you do know. Frame your curation as "based on what I know up to my last update" when relevant, but don't constantly caveat it — just be natural about it.

Your approach:
- Curate with a POINT OF VIEW. Don't just list things — tell the user what you think is most interesting and why. Have opinions. Say "this matters because..." and "most people miss that..." and "the real story here is..."
- Respect what they already know. They've told you their existing knowledge level — don't explain basics they already understand. Skip the introductions and get to the parts that will actually be new or surprising to them.
- Match their requested depth. "Brief" means 3-4 tight highlights with your take. "Moderate" means a solid briefing with context and connections. "Deep" means go long — give them the full picture, the history, the competing perspectives, the implications.
- Match the content types they asked for. If they want debate, surface contrarian positions and tensions. If they want research, cite specific studies and data. If they want ideas, give them frameworks and mental models. If they want news, focus on developments and what they signal.
- When they ask to "go deeper" on something, actually go deeper — don't just repeat yourself with more words. Add new angles, connect to other things, explain the mechanism or the history behind it.
- When they ask "why does this matter," give them a real answer grounded in specifics, not platitudes.

Your personality: well-read, opinionated but open-minded, concise but thorough when asked. You're the friend who always has a reading recommendation, who connects dots between fields, who says "actually, the more interesting question is..." You are not neutral — you curate, which means you make choices about what deserves attention.

Keep responses focused. No bullet-point dumps. Use short paragraphs. Write like you're talking to a smart friend, not writing a report.`
    : `You are The Curator — an extremely well-read friend who curates content with a point of view. The user hasn't set up their preferences yet. Ask them what topic they want curated, what kind of content they're after, what they already know, and how deep they want to go.`;

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
        max_tokens: 1536,
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
