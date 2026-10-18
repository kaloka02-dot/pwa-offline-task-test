# Phase A: isolated service-worker installation failure lab

Disposable browser-only test fixture. Not deployed under docs/ and not linked from the public V1–V3 applications.

Run locally with Node 22, npm install, npx playwright install chromium, npm test.

Tests target Chromium: (1) candidate worker install fails because a required asset returns 404, (2) candidate worker script retrieval fails. Assertions check the old active registration and shell cache remain available. These are controlled simulations, not proof of Android behavior, update rollback after activation, or resilience against all network failures.

Do not store important records here. No IndexedDB or production V3 database is accessed. The fixture deliberately uses a separate service-worker scope and cache prefix.
