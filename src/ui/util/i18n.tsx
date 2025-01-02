import type i18nDefinitionsEn from '../../_locales/en/messages.json';

export const t = (id: keyof typeof i18nDefinitionsEn, substitutions?: string[]) =>
    browser.i18n.getMessage(id, substitutions);

// The `key` prop has special meaning in JSX, so we need to rename it to `id` here.
export const Text = (props: { id: keyof typeof i18nDefinitionsEn; substitutions?: string[] }) =>
    t(props.id, props.substitutions);

// adapted from https://github.com/synacor/preact-i18n/blob/c1ee3e95c341b10f676a48413e92367453e4ce8d/src/components/markup-text.js
export const MarkupText = (props: { id: keyof typeof i18nDefinitionsEn; substitutions?: string[] }) => (
    <span dangerouslySetInnerHTML={{ __html: t(props.id, props.substitutions) }} />
);
