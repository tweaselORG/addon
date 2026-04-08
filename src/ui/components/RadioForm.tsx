import { useMemo, useState } from 'preact/hooks';
import { type MergeExclusive } from 'type-fest';
import type i18nDefinitionsEn from '../../_locales/en/messages.json';
import { Text, t } from '../util/i18n';

export type RadioFormProps<ValueT extends string> = {
    question?: keyof typeof i18nDefinitionsEn;
    questionSubstitutions?: string[];
    options: ({
        value: ValueT;

        labelSubstitutions?: string[];
        disabled?: boolean;
        explanation?: {
            title: keyof typeof i18nDefinitionsEn;
            titleSubstitutions?: string[];
            text: keyof typeof i18nDefinitionsEn;
            textSubstitutions?: string[];
        };
    } & MergeExclusive<{ label: keyof typeof i18nDefinitionsEn }, { labelLiteral: string }>)[];
    onSubmit?: (value: ValueT) => void;
    value?: ValueT;
    outerClass?: string;
};

export const RadioForm = <ValueT extends string>(props: RadioFormProps<ValueT>) => {
    const name = useMemo(() => Math.random().toString(36), []);
    const [selectedValue, setSelectedValue] = useState<ValueT | undefined>(props.value);

    return (
        <>
            {props.question && (
                <p>
                    <Text id={props.question} substitutions={props.questionSubstitutions} />
                </p>
            )}

            <div class={props.outerClass || 'col66 col100-mobile'}>
                <div class="radio-group radio-group-vertical radio-group-padded">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();

                            if (selectedValue !== undefined) props.onSubmit?.(selectedValue);
                        }}>
                        {props.options.map((option) => {
                            const radio = (
                                <div
                                    class="radio-wrapper"
                                    // The `click` event is also triggered by change events for radio buttons
                                    // (https://www.w3.org/TR/2012/WD-html5-20121025/content-models.html#interactive-content).
                                    // Because of that, we use `mouseup` here, to specifically only check for actual clicks.
                                    onMouseUp={() => props.onSubmit?.(option.value)}>
                                    <input
                                        id={`${name}-radio-${option.value}`}
                                        type="radio"
                                        name={name}
                                        class="form-element"
                                        value={option.value}
                                        checked={selectedValue === option.value}
                                        onChange={(event) => setSelectedValue(event.currentTarget.value as ValueT)}
                                        required
                                        disabled={option.disabled}
                                    />
                                    <label
                                        class={'radio-label' + (option.disabled ? ' disabled' : '')}
                                        for={`${name}-radio-${option.value}`}>
                                        {option.label ? (
                                            <Text id={option.label} substitutions={option.labelSubstitutions} />
                                        ) : (
                                            option.labelLiteral
                                        )}
                                    </label>
                                </div>
                            );

                            return option.explanation ? (
                                <div class="button-with-addon-group">
                                    {radio}

                                    <details class="footnote">
                                        <summary
                                            class="button button-secondary button-addon icon-question-mark"
                                            title={t(option.explanation.title, option.explanation.titleSubstitutions)}
                                        />
                                        <div class="footnote-content">
                                            <Text
                                                id={option.explanation.text}
                                                substitutions={option.explanation.textSubstitutions}
                                            />
                                        </div>
                                    </details>
                                </div>
                            ) : (
                                radio
                            );
                        })}

                        <button type="submit" class="sr-only" disabled={!selectedValue}>
                            <Text id="common.continue" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};
