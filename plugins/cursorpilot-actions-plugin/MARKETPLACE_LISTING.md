# Logitech Marketplace Listing — CursorPilot OS

Ready-to-paste copy for the **Describe** step at <https://marketplace.logi.com/contribute>.
Keep this file in sync with `package/metadata/LoupedeckPackage.yaml` (name, version, author).

---

## Core fields

| Field | Value |
|-------|-------|
| **Plugin name** (internal) | `CursorPilot` |
| **Display name** | CursorPilot OS |
| **Author** | Manoj Mallick |
| **Version** | 1.0 |
| **Category** | Developer Tools / Productivity |
| **Supported devices** | Logitech MX Creative Console, Loupedeck CT / Live / Live S |
| **Platforms** | Windows, macOS |
| **License (source)** | MIT |
| **EULA** | See `EULA.md` (required at submission) |

---

## Short description (one line, ~120 chars)

> AI that fixes your broken code at the turn of a dial — every patch is test-gated and verified before it's applied.

## Tagline alternatives (pick one)

- Fix, explain, and re-verify code failures from your Logitech dial.
- Test-gated AI code repair, controlled from your desk.
- Press to fix. Rotate to choose how. Nothing ships unless tests pass.

---

## Long description (listing body)

**CursorPilot OS turns your Logitech device into a hands-on AI repair console for your codebase.**

When your tests or linter break, you don't need to context-switch into a chat window. Press a button on your MX Creative Console (or Loupedeck) and CursorPilot runs a full, evidence-backed repair pipeline: it detects the failures, asks an AI model for a fix, validates the patch, applies it, and **re-runs your tests to prove it actually works**. No fix is ever applied without a passing re-run.

Rotate the dial to choose *how* it fixes — Safe, Performance, Security, or Refactor — and the active mode shows right on the dial. Press a second button to ask the AI to simply explain what's wrong, without touching your code.

**What you can do:**

- **Fix & Verify** — run the complete AI patch pipeline: detect → generate fix → validate → apply → re-test. Test-gated end to end.
- **Explain Issue** — get a plain-language explanation of the current test/lint failures, no changes made.
- **Mode Selector** — rotate the dial to cycle repair strategies: Safe · Performance · Security · Refactor.

**Why it's different:**

- ⛔ **Test-gated by design** — a patch only lands if the re-run passes. You get evidence, not guesses.
- 🖥️ **Local-first** — the plugin talks to a CursorPilot Engine on your own machine over `localhost`; your code stays on your device.
- 🎛️ **Built for muscle memory** — map fix/explain/mode to physical controls and stay in flow.

**Requirements:** CursorPilot OS desktop app/engine running locally (free). The plugin connects to it at `http://localhost:8787`.

---

## "What's new" (v1.0)

- Initial release: Fix & Verify, Explain Issue, and Mode Selector actions.
- Optimized for Logitech MX Creative Console and Loupedeck CT/Live families.

---

## Tags / keywords

`developer tools` · `coding` · `AI` · `automation` · `testing` · `code review` · `productivity` · `git`

---

## Support & links (must be valid, public URLs — broken links are a rejection reason)

| Link | URL |
|------|-----|
| Homepage / repo | _add public GitHub or product URL_ |
| Setup guide | _link to repo README "Getting Started"_ |
| Support / contact | _email or issues URL_ |
| Privacy policy | _required only if you collect personal data — CursorPilot does not_ |

---

## Screenshots & media checklist

Logitech listings are visual — prepare these before submitting. Aim for clean, high-resolution
captures with no personal data on screen.

### Required / strongly recommended

- [ ] **Plugin icon** — 256×256 PNG (already in `package/metadata/`; replace the placeholder with final art).
- [ ] **Hero shot** — the physical MX Creative Console / Loupedeck with CursorPilot actions assigned to buttons + dial. (If no hardware, use the Virtual Console from the desktop app.)
- [ ] **Actions in Logi Options+** — screenshot of the three actions (Fix & Verify, Explain Issue, Mode Selector) listed under the CursorPilot group, ready to drag onto controls.

### Recommended (tell the story)

- [ ] **Before/after fix** — a failing test run, then the same test passing after a dial-triggered fix, with the evidence panel visible.
- [ ] **Mode on the dial** — dial showing the active mode (e.g. "SECURITY") to demonstrate the adjustment.
- [ ] **Explain output** — the AI explanation panel for a failure.
- [ ] **Short demo GIF/video (15–30s)** — press button → pipeline runs → tests go green. This is the single most persuasive asset.

### Media specs to confirm in the portal

- [ ] Use the dimensions/aspect ratios the contribute form specifies (capture at 2x where possible, then downscale).
- [ ] No real PII, secrets, or API keys visible in any frame.
- [ ] Consistent theme (all light or all dark) across shots.

---

## Pre-submission gate (don't upload until all true)

- [ ] `.lplug4` built on a machine with LogiPluginService and **`logiplugintool verify` passes**.
- [ ] Tested on at least one supported device (or documented as Virtual-Console-tested).
- [ ] Final icon replaces the placeholder.
- [ ] Marketplace Developer Agreement accepted; EULA attached.
- [ ] All external links resolve publicly.
- [ ] `version` in `LoupedeckPackage.yaml` matches the version in this listing.
