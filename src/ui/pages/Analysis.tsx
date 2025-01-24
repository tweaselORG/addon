import { useEffect, useState } from 'preact/hooks';
import { addBackgroundMessageListener, sendBackgroundMessage } from '../../util/message';
import { ProceedingMeta } from '../../util/types';
import { TransmittedData } from '../components/TransmittedData';
import { Text } from '../util/i18n';

export type AnalysisPageProps = {
    reference: string;
};

export const Analysis = (props: AnalysisPageProps) => {
    const [proceedingMeta, setProceedingMeta] = useState<ProceedingMeta>();

    useEffect(() => {
        browser.storage.local
            .get('proceeding-meta-' + props.reference)
            .then((result) => setProceedingMeta(result['proceeding-meta-' + props.reference]));

        const cleanup = addBackgroundMessageListener((message) => {
            {
                if (message.type === 'analysisEvent' && message.reference === props.reference) {
                    if (message.event.type === 'no-interaction-completed') {
                        setProceedingMeta((prev) => ({ ...prev!, noInteractionResult: message.event }));

                        return Promise.resolve();
                    } else if (message.event.type === 'interaction-completed') {
                        setProceedingMeta((prev) => ({ ...prev!, interactionResult: message.event }));

                        return Promise.resolve();
                    }
                }

                return false;
            }
        });

        return cleanup;
    }, []);

    return (
        <>
            {!proceedingMeta ? (
                <Text id="common.loading" />
            ) : (
                <>
                    <h1>
                        <Text id="analysis.title" substitutions={[proceedingMeta.siteUrl]} />
                    </h1>

                    {!proceedingMeta.noInteractionResult ? (
                        <>
                            <Text id="analysis.first-step" />
                        </>
                    ) : !proceedingMeta.interactionResult ? (
                        <>
                            <Text id="analysis.second-step" />

                            <button
                                onClick={() =>
                                    sendBackgroundMessage('endInteractionAnalysis', {
                                        reference: proceedingMeta.reference,
                                    })
                                }>
                                <Text id="analysis.finished-interacting" />
                            </button>
                        </>
                    ) : (
                        <>
                            <TransmittedData trackHarResult={proceedingMeta.noInteractionResult.trackHarResult} />
                            <hr />
                            <TransmittedData trackHarResult={proceedingMeta.interactionResult.trackHarResult} />
                        </>
                    )}
                </>
            )}
        </>
    );
};
