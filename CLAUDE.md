# Vibe Builders

A how-to guide for non-developers to build AI agents using Claude Code.

## Project overview

- **What**: A single-page public website teaching complete beginners how to build AI agents
- **Audience**: Curious non-technical people (Mac users only)
- **Stack taught**: Claude Code → Terminal → GitHub → Cloudflare Pages
- **Hosting**: Cloudflare Pages
- **Format**: Single `index.html` file (self-contained HTML/CSS/JS)

## Design system

- **Fonts**: Playfair Display (headings), DM Mono (code), DM Sans (body)
- **Colors**: cream (#F5F0E8), ink (#1A1612), rust (#C4501A), stone (#8A8278)
- **Tone**: Direct, encouraging, zero jargon. Written for people who've never used a terminal.
- **Mac only**: All instructions assume macOS

## Key conventions

- Keep it as a single HTML file — no build step, no framework
- Terminal examples should use the `.terminal` class with `code` blocks
- Warning boxes use `.warning-box` class
- All instructions should be step-by-step, assuming zero prior knowledge
- Don't add personal narrative or story — keep it practical and instructional
