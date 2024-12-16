import type i18nDefinitionsEn from '../../_locales/en/messages.json';

export const t = (id: keyof typeof i18nDefinitionsEn, substitutions?: string[]) =>
    browser.i18n.getMessage(id, substitutions);

// The `key` prop has special meaning in JSX, so we need to rename it to `id` here.
export const Text = (props: { id: keyof typeof i18nDefinitionsEn; substitutions?: string[] }) =>
    t(props.id, props.substitutions);
