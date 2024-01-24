import { DocsId } from '@grafarg/data';

// TODO: Documentation links
const DOCS_LINKS: Record<DocsId, string> = {
  [DocsId.Transformations]: 'https://grafarg.com/docs/grafarg/latest/panels/transformations',
  [DocsId.FieldConfig]: 'https://grafarg.com/docs/grafarg/latest/panels/field-configuration-options/',
  [DocsId.FieldConfigOverrides]:
    'https://grafarg.com/docs/grafarg/latest/panels/field-configuration-options/#override-a-field',
};

export const getDocsLink = (id: DocsId) => DOCS_LINKS[id];
