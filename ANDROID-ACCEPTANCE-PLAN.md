# Android PWA acceptance plan (not yet executed)

## Current evidence
- GitHub Actions manual workflow #1 completed successfully (user-provided screenshot).
- Playwright desktop Chromium tests cover add/delete, localStorage reload, and offline reload.
- No Android Chrome installation or Android offline test has been performed.
- This repository is public, but no hosting or deployment is authorized by this plan.

## Prerequisites before Android testing
1. Select an explicitly approved temporary HTTPS test origin; do not assume GitHub Pages commercial-use eligibility.
2. Add and verify PNG icons (192x192 and 512x512) and manifest references. The PNGs were generated locally but are not yet committed.
3. Review public exposure, hosting limits, account permissions, and shutdown/removal procedure.
4. Obtain explicit approval for the selected publication/deployment method.

## Android acceptance checklist
- Open HTTPS URL in Android Chrome; inspect whether Install/Add to Home screen is offered.
- Install or add shortcut and launch from home screen.
- Add task, close/reopen, verify persistence; delete task.
- With app loaded and service worker active, enable airplane mode; reopen and verify shell and stored tasks.
- Restore network; verify normal operation.
- Record Android/Chrome versions, installation type, screenshots and any failure.
- Remove temporary public hosting when testing is complete, subject to user approval.

## Limitations
A successful desktop Chromium test is not an Android installation test. Installation prompts vary by browser and platform. Avoid assuming a site is fully installable solely because its manifest validates.
