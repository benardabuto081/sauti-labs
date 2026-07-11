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
