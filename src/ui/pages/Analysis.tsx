import { Har } from 'har-format';
import { useEffect, useState } from 'preact/hooks';
import { addBackgroundMessageListener } from '../../util/message';

export type AnalysisPageProps = {
    reference: string;
};

export const Analysis = (props: AnalysisPageProps) => {
    const [noInteractionHar, setNoInteractionHar] = useState<Har>();
    const [interactionHar, setInteractionHar] = useState<Har>();

    useEffect(() => {
        const cleanup = addBackgroundMessageListener((message) => {
            {
                if (message.type === 'analysisEvent' && message.reference === props.reference) {
                    if (message.event.type === 'no-interaction-completed') {
                        setNoInteractionHar(message.event.trackHarResult);

                        return Promise.resolve();
                    } else if (message.event.type === 'interaction-completed') {
                        setInteractionHar(message.event.trackHarResult);

                        return Promise.resolve();
                    }
                }

                return false;
            }
        });

        return cleanup;
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
