import { Har } from 'har-format';
import { useEffect, useState } from 'preact/hooks';
import { type ExtensionMessageParams } from '../../util/message';

export type AnalysisPageProps = {
    reference: string;
};

export const Analysis = (props: AnalysisPageProps) => {
    const [noInteractionHar, setNoInteractionHar] = useState<Har>();
    const [interactionHar, setInteractionHar] = useState<Har>();

    useEffect(() => {
        browser.runtime.onMessage.addListener(
            (message: ExtensionMessageParams[keyof ExtensionMessageParams], sender) => {
                if (sender.id !== browser.runtime.id) return false;

                if (message.type === 'analysisEvent' && message.reference === props.reference) {
                    if (message.event.type === 'no-interaction-completed') {
                        setNoInteractionHar(message.event.har);

                        return Promise.resolve();
                    } else if (message.event.type === 'interaction-completed') {
                        setInteractionHar(message.event.har);

                        return Promise.resolve();
                    }
                }

                return false;
            },
        );
    });

    return (
        <>
            Analysis
            <pre>{JSON.stringify(noInteractionHar, null, 2)}</pre>
            <hr />
            <pre>{JSON.stringify(interactionHar, null, 2)}</pre>
        </>
    );
};
