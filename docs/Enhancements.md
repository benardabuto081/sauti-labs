# Future Enhancements Backlog

This document tracks improvement ideas identified during implementation
that are explicitly out of scope for the milestone they were discovered
in. Recording them here prevents both silent loss and uncontrolled
scope creep — per SPOS, technical debt must be intentional, documented,
and temporary, not invisible.

Items here are candidates for future milestones, not commitments.

## From M2.13 (Real Corpus Acquisition Pipeline)

- **Real quality scoring**: `quality_score` currently reads `0` for
  both Dholuo and Kiswahili datasets. This is honest, not a bug — no
  annotation or review process has run yet. Once `annotation-framework`
  is exercised with real work, quality scores should be computed and
  these entries updated.
- **GitHub API authentication reliability**: three fine-grained PAT
  attempts all returned `401 Bad credentials` despite correct format
  and active status on GitHub's side. Root cause was not conclusively
  identified (workaround: unauthenticated requests worked fine for
  this milestone's data volume). Worth revisiting if a future language
  addition needs more than ~60 GitHub API requests in an hour.
- **Corpus source coverage**: only the African Storybook Project has
  been used so far. Both language `known_challenges` fields note
  limited resources — additional properly-licensed sources (e.g.
  Wikipedia dumps under CC BY-SA, government publications) should be
  evaluated for future corpus expansion.
- **Bible source resolution**: `dholuo-bible-translation-v1` remains
  at `unknown_pending_review`. Actually contacting the Bible Society
  of Kenya to resolve licensing is a real, actionable next step, not
  addressed in M2.13 per explicit scope instruction.
- **Automated CC-BY-NC detection in CI**: the license-filtering logic
  in `filter-corpus-by-license.js` currently runs manually. Consider
  wiring a check into CI that flags any future corpus addition
  containing unreviewed CC-BY-NC content before it reaches the
  dataset registry.


  ## From M2.14 (Speech Infrastructure)

- **Real speech source/recording identified, pending acquisition**:
  "Common Voice Scripted Speech 26.0 - Swahili" on Mozilla's Data
  Collective (mozilladatacollective.com), license CC0-1.0, locale
  `sw`, 20.88GB total. Confirmed via account login and direct
  browsing 2026-07-12. Deferred acquisition until WiFi access is
  available (too large for mobile data). When resumed: extract one
  small real clip, register it in `speech-registry` (source +
  recording entries), decide whether a corresponding anonymous
  speaker entry is warranted given Common Voice's anonymized,
  self-reported demographic model.
- **Rejected alternative**: "Read Speech in Kenyan Swahili" (CLEAR
  Global, 6 hours, single anonymous male speaker) was also found and
  considered, but rejected due to CC-BY-NC-4.0 licensing — consistent
  with the CC-BY-NC exclusion precedent set in M2.13 for Kiswahili
  text sources.
- **Confirmed dead end**: `global-asp/gsn-audio` (GlobalStorybooks.net
  narrated audio) documents a Swahili reader (named individual, Sophia
  Turunesh Mufuruki) but the actual `sw` audio folder does not yet
  exist in the repository. No Dholuo (`luo`) audio exists in this
  source at all. Not usable currently for either active language.

  - **Additional confirmed dead ends (2026-07-12)**: `global-asp/global-asp.github.io/audio` folder checked directly
  (languages present: ar, asp, eo, es, fa, gu, nn, no, sv, tl, zh) —
  no `luo` or `sw` folder. Hugging Face's `datasets-server` API for
  both `fsicoli/common_voice_17_0` and `mozilla-foundation/common_voice_17_0`
  returned errors — the official Mozilla namespace is gated/empty via
  API (requires dataset-terms acceptance through the website, not
  freely queryable). Confirms: real audio resources for Dholuo and
  Kiswahili are genuinely much scarcer than text resources were.
- **Decision (2026-07-12)**: Paused end-to-end speech validation
  until WiFi access is available (founder is on mobile data for
  approximately one month). When resumed, two viable paths identified:
  (1) download the already-confirmed 20.88GB Common Voice Swahili
  archive from Mozilla Data Collective and extract one real clip, or
  (2) record a short, genuinely consented sample of the founder's own
  voice as an even stronger test case (exercises real consent capture,
  needs no download at all). Framework itself (`speech-registry`,
  `speaker-registry`) is already fully built, schema-validated, and
  CI-verified — only the real-file walkthrough remains.
