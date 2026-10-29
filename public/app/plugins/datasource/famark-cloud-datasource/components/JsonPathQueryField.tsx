import { BracesPlugin, QueryField, SlatePrism, TypeaheadInput } from '@grafarg/ui';
import React from 'react';
import { onSuggest } from '../suggestions';

interface Props {
  query: string;
  onBlur: () => void;
  onChange: (v: string) => void;
  onData: () => Promise<any>;
  disabled?: boolean;
}

/**
 * JsonPathQueryField is an editor for JSON Path.
 */
export const JsonPathQueryField: React.FC<Props> = ({ query, onBlur, onChange, onData, disabled }) => {
  /**
   * The QueryField supports Slate plugins, so let's add a few useful ones.
   */
  const plugins = [
    BracesPlugin(),
    SlatePrism({
      onlyIn: (node: any) => node.type === 'code_block',
      getSyntax: () => 'js',
    }),
  ];

  // This is important if you don't want punctuation to interfere with your suggestions.
  const cleanText = (s: string) => s.replace(/[{}[\]="(),!~+\-*/^%\|\$@\.]/g, '').trim();

  const onTypeahead = (input: TypeaheadInput) => onSuggest(input, onData);

  return (
    <QueryField
      disabled={disabled}
      additionalPlugins={plugins}
      query={query}
      cleanText={cleanText}
      onTypeahead={onTypeahead}
      onRunQuery={onBlur}
      onChange={onChange}
      portalOrigin="jsonapi"
      placeholder="$.items[*].name"
    />
  );
};
