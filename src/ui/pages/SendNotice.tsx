import { useEffect, useState } from 'preact/hooks';
import { navigate } from 'wouter-preact/use-hash-location';
import { sendBackgroundMessage } from '../../util/message';
import { getProceeding, updateProceeding } from '../../util/proceedings';
import { type ProceedingMeta } from '../../util/types';
import { Text, t } from '../util/i18n';

export type SendNoticeProps = {
    reference: string;
};

export const SendNotice = (props: SendNoticeProps) => {
    const [proceedingMeta, setProceedingMeta] = useState<ProceedingMeta>();

    useEffect(() => {
        getProceeding(props.reference, { includeResults: true }).then((res) => setProceedingMeta(res));
    }, []);

    if (!proceedingMeta) return <Text id="common.loading" />;

    if (!proceedingMeta.initialNoInteractionResult || !proceedingMeta.initialInteractionResult)
        return <Text id="send-notice.not-yet" />;

    return (
        <>
            <h1>
                <Text id="send-notice.title" />
            </h1>

            <p>
                <Text id="send-notice.explanation" />
            </p>

            <div className="box box-warning">
                <Text id="send-notice.attachment-note" />
            </div>

            <div class="form-group">
                <strong>
                    <label for="subject-input">
                        <Text id="send-notice.subject" />
                    </label>
                </strong>
                <input
                    type="text"
                    id="subject-input"
                    class="form-element"
                    readonly
                    value={t('send-notice.template-subject', [proceedingMeta.siteUrl, proceedingMeta.reference])}
                />
                <br />

                <strong>
                    <Text id="send-notice.attachments" />
                </strong>
                <ul>
                    <li>
                        <a
                            onClick={async () => {
                                console.log('asasdas');
                                const pdf = await sendBackgroundMessage('reportHarGenerate', {
                                    options: {
                                        type: 'report',
                                        analysisSource: 'web',
                                        language: 'en',

                                        har: proceedingMeta.initialNoInteractionResult!.har,
                                        trackHarResult: proceedingMeta.initialNoInteractionResult!.trackHarResult,

                                        harInteraction: proceedingMeta.initialInteractionResult!.har,
                                        trackHarResultInteraction:
                                            proceedingMeta.initialInteractionResult!.trackHarResult,
                                    },
                                }).then((r) => r.result);
                                console.log({ pdf });

                                const blob = new Blob([pdf], { type: 'application/pdf' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'report.pdf';
                                a.click();
                            }}>
                            <Text id="send-notice.notice" />
                        </a>
                    </li>
                    <li>
                        <a href="TODO">
                            <Text id="send-notice.technical-report" />
                        </a>
                    </li>
                    <li>
                        <a href="TODO">
                            <Text id="send-notice.traffic-recording" />
                        </a>
                    </li>
                </ul>

                <strong>
                    <label for="body-input">
                        <Text id="send-notice.text" />
                    </label>
                </strong>
                <textarea
                    id="body-input"
                    class="form-element"
                    rows={11}
                    readOnly
                    value={t('send-notice.template-text', [proceedingMeta.siteUrl])}
                />

                <button
                    class="button button-primary"
                    onClick={() =>
                        updateProceeding(props.reference, { noticeSent: new Date() }).then(() =>
                            navigate(`/analysis/${props.reference}`),
                        )
                    }>
                    <Text id="send-notice.sent-message" />
                </button>
            </div>
        </>
    );
};
