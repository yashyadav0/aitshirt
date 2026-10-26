# Gemini-style AI Workspace

Frontend (src/pages/AIWorkspace.jsx + components/workspace):
- DesignModePill.jsx   - "Design" pill with Product + Generation Mode dropdowns
- StyleChips.jsx       - Graphic / Text / Aesthetic / Minimal (multi-select) - config/styleChips.js
- PromptComposer.jsx   - pill input: + (reference images), text, mic, send
- ResultToolbar.jsx    - Refine (pencil), Regenerate, Start over

Backend:
- config/designPreferences.js: STYLE_DIRECTIVES, parseStyles, applyStylesToPrompt (whitelisted)
- routes/generation.js: POST /generation/create accepts `styles` (JSON array); directives are
  appended to the prompt before the Gemini prompt enhancer + gemini-2.5-flash-image run.

Refine: the current artwork is attached as the reference image and the next prompt describes the change
(uses the existing reference-image path; consumes one prompt of quota like any generation).

Keep chip ids in sync between frontend/src/config/styleChips.js and backend STYLE_DIRECTIVES.
