# Scaffold independent framework audit

Date: 2026-09-13

## Scope

The repository was searched for WIDA, ACCESS, Can Do, proficiency-level descriptor language, ELD standards, named proficiency bands, framework citations, and related source names across application code, API specifications, prompts, data, documentation, and attached prompt history. Curriculum PDFs were treated as immutable source material and were not changed.

## References discovered and disposition

### Product code and runtime content

- `artifacts/api-server/src/content/canonical-guides.ts` contained WIDA-named source paths, WIDA planning rules, WIDA band ranges, and level-specific scaffold guidance. This was derivative-risk material because it presented external framework language as canonical planning context. Replaced with Scaffold-authored planning rules and six Language Support Levels.
- `artifacts/api-server/src/content/canonical-unit-profiles.ts` contained WIDA framework, language-chart, webinar, and band references. Replaced with a Scaffold-only curriculum context adapter.
- `artifacts/api-server/src/services/prompts.ts` described generated plans as WIDA-aligned and passed WIDA band/level language to the model. Replaced with original Scaffold framework instructions and an explicit prohibition on external-framework citation or reproduction.
- `artifacts/speak-your-lesson/src/pages/Home.tsx` and `ClassroomCopilot.tsx` exposed WIDA selector labels and ranges. Replaced with Language Support Level 1–6 labels and original descriptions.
- Demo lesson and Copilot data contained WIDA-specific titles, differentiation notes, and source names. Rewritten using Scaffold level terminology and Scaffold source labels.
- The About/legal page contained WIDA affiliation and trademark language. Replaced with independent-tool and instructional-use language because the product no longer presents itself as WIDA-informed.

### Internal compatibility reference retained

- `src/lib/shared-plan.ts` still recognizes the legacy stored `widaBand` key when opening old shared links. This is a migration-only compatibility check; it is not displayed, sent to the API, or used as the active framework. New shared plans use `languageSupportLevel`.

### Archived or non-runtime content

- Three attached security-request text files use the generic phrase “access code”; this refers to authentication and is unrelated to the named assessment framework.
- Two attached historical build-request text files mention WIDA bands/levels. They are user-provided project history, not shipped application content, and were left unchanged for provenance.
- `curriculum/` contains the user-supplied source library and review artifacts. Original PDFs were preserved as required. No application runtime imports those PDFs as external framework instructions.

## Independent Language Support Levels

1. **Intensive language support** — make the task visible and participatory through modeling, visuals, gestures, translated or bilingual resources when available, and supported response choices.
2. **High language support** — combine clear models, selected vocabulary, chunked directions, partner rehearsal, and short response frames.
3. **Moderate language support** — provide a model and a few reusable language tools while students explain, discuss, read, or write more of the response themselves.
4. **Targeted language support** — identify the specific language move blocking access and offer a focused prompt, example, organizer, or revision cue.
5. **Light language support** — keep a small reference such as a word bank, checklist, or discussion stem available while students manage most of the task independently.
6. **Independent access** — invite students to select, adapt, and monitor the language resources they need, with optional teacher feedback.

These are task-specific instructional support choices. They are not student diagnoses, formal proficiency scores, placement recommendations, or certification levels. Teachers should consider listening, speaking, reading, and writing separately and adjust support using observable classroom evidence.

## Remaining review note

The curriculum PDFs remain source documents supplied by the user. Any future extraction from those documents should continue to be reviewed for close reproduction of third-party language before it is added to teacher-facing generation.
