import { useEffect, useState } from 'preact/hooks';
import { Link } from 'wouter-preact';
import { navigate } from 'wouter-preact/use-hash-location';
import { addBackgroundMessageListener, sendBackgroundMessage } from '../../util/message';
import { updateProceeding as _updateProceeding, getProceeding, resetSecondAnalysis } from '../../util/proceedings';
import { ProceedingMeta } from '../../util/types';
import { formatDate, trackHarResultIsEmpty } from '../../util/util';
import { RadioForm } from '../components/RadioForm';
import { TransmittedData } from '../components/TransmittedData';
import { MarkupText, Text } from '../util/i18n';

export type AnalysisPageProps = {
    reference: string;
};

export const Analysis = (props: AnalysisPageProps) => {
    const [proceedingMeta, setProceedingMeta] = useState<ProceedingMeta>();

    const updateProceeding = (update: Partial<ProceedingMeta>) =>
        _updateProceeding(props.reference, update).then(() =>
            setProceedingMeta((prev) => ({ ...prev, ...(update as ProceedingMeta) })),
        );

    useEffect(() => {
        getProceeding(props.reference, { includeResults: true }).then((res) => setProceedingMeta(res));

        const cleanup = addBackgroundMessageListener((message) => {
            {
                if (message.type === 'analysisEvent' && message.reference === props.reference) {
                    if (message.event.type === 'no-interaction-completed') {
                        setProceedingMeta((prev) => ({
                            ...prev!,
                            [message.event.analysisType + 'NoInteractionResult']: message.event,
                        }));

                        return Promise.resolve();
                    } else if (message.event.type === 'interaction-completed') {
                        setProceedingMeta((prev) => ({
                            ...prev!,
                            [message.event.analysisType + 'InteractionResult']: message.event,
                        }));

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

                    {!proceedingMeta.initialNoInteractionResult ? (
                        <p>
                            <Text id="analysis.initial-first-step" />
                        </p>
                    ) : !proceedingMeta.initialInteractionResult ? (
                        <>
                            <p>
                                <Text id="analysis.initial-second-step" />
                            </p>

                            <button
                                class="button button-primary"
                                onClick={() =>
                                    sendBackgroundMessage('endInteractionAnalysis', {
                                        reference: proceedingMeta.reference,
                                    })
                                }>
                                <Text id="analysis.finished-interacting" />
                            </button>
                        </>
                    ) : trackHarResultIsEmpty(proceedingMeta.initialNoInteractionResult.trackHarResult) &&
                      trackHarResultIsEmpty(proceedingMeta.initialInteractionResult.trackHarResult) ? (
                        <>
                            <p>
                                <MarkupText id="analysis.initial-analysis-found-nothing" />
                            </p>

                            <h2>
                                <Text id="analysis.initial-analysis-found-nothing-what-heading" />
                            </h2>

                            <p>
                                <MarkupText id="analysis.initial-analysis-found-nothing-what-explanation" />
                            </p>
                        </>
                    ) : !proceedingMeta.initialInteractionConsent ? (
                        <RadioForm
                            question="analysis.consent-question"
                            options={[
                                { label: 'analysis.consent-question-not-asked', value: 'not-asked' },
                                { label: 'analysis.consent-question-given', value: 'given' },
                                { label: 'analysis.consent-question-ignored', value: 'ignored' },
                                { label: 'analysis.consent-question-refused', value: 'refused' },
                                { label: 'analysis.consent-question-not-sure', value: 'not-sure' },
                            ]}
                            onSubmit={(v) => updateProceeding({ initialInteractionConsent: v })}
                        />
                    ) : !proceedingMeta.controllerResponse ? (
                        trackHarResultIsEmpty(proceedingMeta.initialNoInteractionResult.trackHarResult) &&
                        !trackHarResultIsEmpty(proceedingMeta.initialInteractionResult.trackHarResult) &&
                        (proceedingMeta.initialInteractionConsent === 'given' ||
                            proceedingMeta.initialInteractionConsent === 'not-sure') ? (
                            <>
                                <MarkupText id="analysis.second-step-consented-explanation" />

                                <button
                                    class="button button-secondary"
                                    onClick={() =>
                                        sendBackgroundMessage('startAnalysis', {
                                            siteUrl: proceedingMeta.siteUrl,
                                            analysisType: 'initial',
                                        }).then(({ reference }) => {
                                            navigate(`/analysis/${reference}`);
                                            window.location.reload();
                                        })
                                    }>
                                    <Text id="analysis.second-step-consented-restart" />
                                </button>

                                <h2>
                                    <Text id="analysis.interaction-transmissions" />
                                </h2>

                                <TransmittedData
                                    trackHarResult={proceedingMeta.initialInteractionResult.trackHarResult}
                                    headingLevel={3}
                                />
                            </>
                        ) : (
                            <>
                                {!proceedingMeta.noticeSent ? (
                                    <>
                                        <MarkupText id="analysis.awaiting-controller-notice" />

                                        <Link
                                            href={`/send-notice/${props.reference}`}
                                            class="button button-primary"
                                            style="margin-bottom: 2em;">
                                            <Text id="analysis.send-notice" />
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <MarkupText
                                            id="analysis.awaiting-controller-response"
                                            substitutions={[formatDate(proceedingMeta.controllerResponseDeadline)]}
                                        />

                                        <Link
                                            href={`/evaluate-response/${props.reference}`}
                                            class="button button-primary"
                                            style="margin-bottom: 2em;">
                                            <Text id="analysis.continue-with-process" />
                                        </Link>
                                    </>
                                )}

                                <h2>
                                    <Text id="analysis.no-interaction-transmissions" />
                                </h2>

                                <TransmittedData
                                    trackHarResult={proceedingMeta.initialNoInteractionResult.trackHarResult}
                                    headingLevel={3}
                                />

                                <h2>
                                    <Text id="analysis.interaction-transmissions" />
                                </h2>

                                <TransmittedData
                                    trackHarResult={proceedingMeta.initialInteractionResult.trackHarResult}
                                    headingLevel={3}
                                />
                            </>
                        )
                    ) : !proceedingMeta.secondNoInteractionResult ? (
                        <p>
                            <Text id="analysis.second-first-step" />
                        </p>
                    ) : !proceedingMeta.secondInteractionResult ? (
                        <>
                            <p>
                                <Text id="analysis.second-second-step" />
                            </p>

                            <button
                                class="button button-primary"
                                onClick={() =>
                                    sendBackgroundMessage('endInteractionAnalysis', {
                                        reference: proceedingMeta.reference,
                                    })
                                }>
                                <Text id="analysis.finished-interacting" />
                            </button>
                        </>
                    ) : trackHarResultIsEmpty(proceedingMeta.secondNoInteractionResult.trackHarResult) &&
                      trackHarResultIsEmpty(proceedingMeta.secondInteractionResult.trackHarResult) ? (
                        <>
                            <p>
                                <MarkupText id="analysis.second-analysis-found-nothing" />
                            </p>
                        </>
                    ) : !proceedingMeta.secondInteractionConsent ? (
                        <RadioForm
                            question="analysis.consent-question"
                            options={[
                                { label: 'analysis.consent-question-not-asked', value: 'not-asked' },
                                { label: 'analysis.consent-question-given', value: 'given' },
                                { label: 'analysis.consent-question-ignored', value: 'ignored' },
                                { label: 'analysis.consent-question-refused', value: 'refused' },
                                { label: 'analysis.consent-question-not-sure', value: 'not-sure' },
                            ]}
                            onSubmit={(v) => updateProceeding({ secondInteractionConsent: v })}
                        />
                    ) : trackHarResultIsEmpty(proceedingMeta.secondNoInteractionResult.trackHarResult) &&
                      !trackHarResultIsEmpty(proceedingMeta.secondInteractionResult.trackHarResult) &&
                      (proceedingMeta.secondInteractionConsent === 'given' ||
                          proceedingMeta.secondInteractionConsent === 'not-sure') ? (
                        <>
                            <MarkupText id="analysis.second-step-consented-explanation" />

                            <button
                                class="button button-secondary"
                                onClick={() =>
                                    resetSecondAnalysis(props.reference)
                                        .then(() =>
                                            sendBackgroundMessage('startAnalysis', {
                                                reference: proceedingMeta.reference,
                                                analysisType: 'second',
                                            }),
                                        )
                                        .then(() => window.location.reload())
                                }>
                                <Text id="analysis.second-step-consented-restart" />
                            </button>

                            <h2>
                                <Text id="analysis.interaction-transmissions" />
                            </h2>

                            <TransmittedData
                                trackHarResult={proceedingMeta.secondInteractionResult.trackHarResult}
                                headingLevel={3}
                            />
                        </>
                    ) : !proceedingMeta.complaintSent ? (
                        <>
                            <MarkupText id="analysis.awaiting-complaint" />

                            <Link
                                href={`/complain/${props.reference}`}
                                class="button button-primary"
                                style="margin-bottom: 2em;">
                                <Text id="analysis.contact-dpa" />
                            </Link>

                            <h2>
                                <Text id="analysis.no-interaction-transmissions" />
                            </h2>

                            <TransmittedData
                                trackHarResult={proceedingMeta.secondNoInteractionResult.trackHarResult}
                                headingLevel={3}
                            />

                            <h2>
                                <Text id="analysis.interaction-transmissions" />
                            </h2>

                            <TransmittedData
                                trackHarResult={proceedingMeta.secondInteractionResult.trackHarResult}
                                headingLevel={3}
                            />
                        </>
                    ) : (
                        <MarkupText id={`analysis.complaint-sent-${proceedingMeta.complaintType!}`} />
                    )}
                </>
            )}
        </>
    );
};
