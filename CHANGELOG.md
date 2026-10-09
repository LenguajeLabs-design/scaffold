# Changelog

All notable changes to Scaffold are documented here. The project follows the structure of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] — Version 2.1 release candidate

Planned release: October 2026

### Added

- Added a Scaffold-specific landing-page preview at `/landing-preview`.
- Added a guided planning path showing the relationship between lesson material, the classroom need, planning defaults, and plan generation.
- Added an optional paste-text workflow for existing lesson goals, task directions, success criteria, and planning notes.
- Added live completion summaries, character counts, persistent helper text, and explicit required/optional labels.
- Added a clearly labeled PDF-upload concept describing the safeguards required before file extraction is enabled.
- Added direct entry from the landing preview to `/?start=materials` with the relevant panel expanded and positioned in view.

### Changed

- Updated the footer to Version 2.1 and October 2026.
- Collapsed output-language details behind an editable summary to reduce page length.
- Renamed generic actions so they describe their outcomes, including “Describe classroom need” and “Create support plan.”
- Clarified how quick starts populate the classroom-need field.
- Moved the primary planning task ahead of saved-plan history on narrow layouts.
- Strengthened the resting, hover, and focus states of the two main writing fields.
- Extended the lesson-generation contract with an optional `sourceMaterial` field limited to 8,000 characters.
- Separated teacher-provided lesson material from classroom evidence and canonical curriculum context in the generation prompt.

### Security and privacy

- Treats pasted lesson material as untrusted classroom content rather than executable instructions.
- Tells the model to ignore requests or directions embedded in pasted material.
- Prevents teacher-provided material from being presented as an approved curriculum source or listed in `sourcesUsed`.
- Enforces source-material length limits in the browser, generated API schemas, and server route.
- Reminds teachers not to paste student records or identifiable student work.

### Not included in Version 2.1

- PDF upload and extraction.
- OCR for scanned documents.
- Persistent storage of uploaded or pasted source material.

These capabilities require separate validation, extraction, retention, review, and privacy decisions before implementation.

## [2.0.0] — September 2026

### Included

- Intent-first lesson-planning experience.
- Classroom Copilot for immediate instructional support.
- Original Scaffold language-support framework.
- Generated lesson editing, local saves, sharing, and printing.
  - Bounded public generation and optional verified Google accounts.
  - Render API and GitHub Pages frontend deployment.
