# DESIGN.md — AI Harness Behavioral Specification

> **This document defines WHAT the system must do, in observable terms.** It is the
> arbiter of feature-vs-bug: if the running system matches a behavior below, it is
> correct; if it deviates, it is a bug; if a behavior is not described here, it is
> *undefined* — decide it, then document it here before building. The Builder and QA
> agents read this file to understand intent. Do not describe implementation here
> (that lives in `docs/ARCHITECTURE.md`).
>
> Format: each entry is a named Feature or Behavior with Given / When / Then criteria.

---

## Purpose

A public, always-working, shareable demonstration of a multi-agent AI software factory.
A visitor watches agents **plan → build → QA → open a PR** in real time. It turns the
abstract claim "I run an AI dev system" into something you can watch.

---

## Non-Goals (intentional boundaries — NOT missing features)

These are deliberate. An agent must not "fix" their absence:

- **No user accounts / auth for visitors.** Anyone can watch; nobody logs in.
- **No database in v1.** Recordings are static JSON files committed to the repo.
- **No arbitrary public code execution.** Public visitors can only *replay* recordings.
  Live execution is owner-only and never reachable by public input. (See "Mode safety".)
- **No multi-tenant / per-user state.** The app is stateless across requests.

---

## Feature: Landing page

```
GIVEN a visitor opens the site
THEN they see a hero explaining what the AI factory is
 AND a control to choose a demo request (from the available recordings)
 AND a primary button to start a run ("Run the factory")
 AND an empty agent console ready to receive events.
```

## Feature: Run a recorded factory pass (replay — the public default)

```
GIVEN a visitor on the landing page
WHEN they select a demo request and click "Run the factory"
THEN the agent console begins streaming events in real time
 AND events appear in order, grouped/attributable to four agents
     (Planner, Builder, QA, System)
 AND the run ends with a "PR opened" event that shows a clickable link
 AND the button returns to an idle state when the run completes.
```

## Behavior: Event ordering

```
GIVEN a run is streaming
THEN events arrive in non-decreasing timestamp order
 AND for any given agent, a "started" event precedes that agent's "done" event
 AND no "done" event for an agent appears before that agent's "started" event.
```

## Behavior: Replay timing feels live

```
GIVEN a recording whose events carry timestamps
WHEN it is replayed
THEN the delay between consecutive events approximates the original spacing
 AND any single gap is capped (≤ 2 seconds) so the demo never appears to stall
 AND the whole run completes in under ~60 seconds.
```

## Feature: Agent console rendering

```
GIVEN events are streaming into the console
THEN each event is shown with its agent, a human-readable label, and a timestamp
 AND Planner task-decomposition events render as a list of tasks
 AND Builder file events indicate which file was written/changed
 AND a QA "screenshot" event renders the referenced image inline
 AND a QA "result" event clearly shows PASS or FAIL
 AND the System "PR opened" event renders a clickable PR link.
```

## Behavior: Mode safety (security boundary — this IS a feature)

```
GIVEN a request to run the factory
WHEN the request does NOT carry a valid owner key (HARNESS_KEY)
THEN the system serves a REPLAY, regardless of any requested mode
 AND no real agents are spawned
 AND no code is executed on the host as a result of the request.

GIVEN a request that DOES carry a valid owner key
WHEN live mode is requested
THEN the system MAY produce a real run (owner-only path).
```

## Behavior: Unknown / missing recording

```
GIVEN a visitor requests a recording that does not exist
THEN the system responds with a clear "not found" state
 AND does not crash or hang the console
 AND the visitor can pick a different recording and run it.
```

## Behavior: Resilient stream

```
GIVEN a run is streaming
WHEN the connection drops or the stream ends unexpectedly
THEN the console stops gracefully (no infinite spinner)
 AND already-received events remain visible
 AND the visitor can start a new run.
```

## Feature: Accessibility & quality baseline

```
GIVEN any page of the app
THEN there is exactly one <h1>
 AND all images have alt text
 AND there are zero console errors on load
 AND there are zero failed (4xx/5xx) network requests on load.
```
(These are verified by the `qa-evidence` Playwright pass on every deploy.)

---

## The live → replay flywheel (behavioral intent)

```
GIVEN the owner triggers a real (live) run
THEN that run's event log is persisted as a new recording
 AND that recording becomes available for public replay.
```
Consequence: the public demo shows *genuine* runs — just pre-recorded — not fabricated data.
