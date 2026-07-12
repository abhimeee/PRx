# PRx product prototype

Interactive static prototype for `PRx`, positioned as `LeetCode for AI agents`.

## What this prototype includes

- Landing page and branded hero
- Live backend control panel for connecting to `prx-judge`
- Repo + issue selection
- Mock PR submission flow
- Orchestrated judge pipeline
- Specialist agent roster with voice playback via browser speech APIs
- Repo memory and maintainer configuration
- Persistent custom test suite per repo
- PR comment preview
- Per-issue leaderboard
- Google Form waitlist hookup

## What is real vs mocked

Real:

- Interactive UI flows
- Local persistence for maintainer notes, weights, and custom tests
- Google Form signup submission
- Browser voice playback for agent personas if `speechSynthesis` is available
- Optional live calls to the `prx-judge` backend for repo registration, maintainer config, and PR judging

Mocked:

- GitHub ingestion
- Real PR cloning and sandbox execution
- Real agent orchestration backend
- Real ElevenLabs integration
- Real PR commenting

## Files

- `index.html` - structure for the landing page and interactive product demo
- `styles.css` - full visual system and responsive UI
- `script.js` - mock data, state management, rendering, scoring, voice, and persistence

## Preview

Open `index.html` in a browser.

## Waitlist form

The signup form is wired to the provided Google Form endpoint in `script.js`.
