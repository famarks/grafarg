#!/bin/bash
set -e

ERROR_COUNT="$(yarn run tsc --project tsconfig.json --noEmit --strict true | grep -oP 'Found \K(\d+)')"
DIRECTIVES="$(grep -r -o  directive public/app/ | wc -l)"
CONTROLLERS="$(grep -r -oP 'class .*Ctrl' public/app/ | wc -l)"
STORIES_COUNT="$(find ./packages/grafarg-ui/src/components -name "*.story.tsx" | wc -l)"
MDX_COUNT="$(find ./packages/grafarg-ui/src/components -name "*.mdx" | wc -l)"
LEGACY_FORMS="$(grep -r -oP 'LegacyForms;' public/app | wc -l)"

STRICT_LINT_RESULTS="$(yarn run eslint --rule '@typescript-eslint/no-explicit-any: ["error"]' --format unix ./public/ || true)"
STRICT_LINT_EXPLICIT_ANY="$(echo "${STRICT_LINT_RESULTS}" | grep -o "no-explicit-any" | wc -l)"

echo -e "Typescript errors: $ERROR_COUNT"
echo -e "Directives: $DIRECTIVES"
echo -e "Controllers: $CONTROLLERS"
echo -e "Stories: $STORIES_COUNT"
echo -e "Documented stories: $MDX_COUNT"
echo -e "Legacy forms: $LEGACY_FORMS"
echo -e "TS Explicit any: $STRICT_LINT_EXPLICIT_ANY"

echo "Metrics: {
  \"grafarg.ci-code.strictErrors\": \"${ERROR_COUNT}\",
  \"grafarg.ci-code.directives\": \"${DIRECTIVES}\",
  \"grafarg.ci-code.controllers\": \"${CONTROLLERS}\",
  \"grafarg.ci-code.grafarg-ui.stories\": \"${STORIES_COUNT}\",
  \"grafarg.ci-code.grafarg-ui.mdx\": \"${MDX_COUNT}\",
  \"grafarg.ci-code.legacyForms\": \"${LEGACY_FORMS}\",
  \"grafarg.ci-code.strictLint.noExplicitAny\": \"${STRICT_LINT_EXPLICIT_ANY}\"
}"
