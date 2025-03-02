import { useEffect, useState } from 'preact/hooks';
import { navigate } from 'wouter-preact/use-hash-location';
import { sendBackgroundMessage } from '../../util/message';
import { getProceeding, updateProceeding } from '../../util/proceedings';
import { type ProceedingMeta } from '../../util/types';
import { createBlobUrl } from '../util/file';
import { Text, t } from '../util/i18n';

export type SendNoticeProps = {
    reference: string;
};

export const SendNotice = (props: SendNoticeProps) => {
    const [proceedingMeta, setProceedingMeta] = useState<ProceedingMeta>();
    const [noticeBlobUrl, setNoticeBlobUrl] = useState<string>();
    const [reportBlobUrl, setReportBlobUrl] = useState<string>();
    const [harBlobUrl, setHarBlobUrl] = useState<string>();
    const [harInteractionBlobUrl, setHarInteractionBlobUrl] = useState<string>();

    useEffect(() => {
        getProceeding(props.reference, { includeResults: true }).then((res) => setProceedingMeta(res));
    }, []);

    useEffect(() => {
        if (!proceedingMeta) return;

        sendBackgroundMessage('reportHarGenerate', {
            options: {
                type: 'notice',
                analysisSource: 'web',
                // TODO
                language: 'en',

                har: proceedingMeta.initialNoInteractionResult!.har,
                trackHarResult: proceedingMeta.initialNoInteractionResult!.trackHarResult,

                harInteraction: proceedingMeta.initialInteractionResult!.har,
                trackHarResultInteraction: proceedingMeta.initialInteractionResult!.trackHarResult,
            },
        })
            .then((r) => r.result)
            .then((pdf) => createBlobUrl(pdf, 'application/pdf'))
            .then((url) => setNoticeBlobUrl(url))
            // TODO: It should of course be possible to do these in parallel, but there is some bug that I'm just not
            // seeing right now.
            .then(() =>
                sendBackgroundMessage('reportHarGenerate', {
                    options: {
                        type: 'report',
                        analysisSource: 'web',
                        // TODO
                        language: 'en',

                        har: proceedingMeta.initialNoInteractionResult!.har,
                        trackHarResult: proceedingMeta.initialNoInteractionResult!.trackHarResult,

                        harInteraction: proceedingMeta.initialInteractionResult!.har,
                        trackHarResultInteraction: proceedingMeta.initialInteractionResult!.trackHarResult,
                    },
                }),
            )
            .then((r) => r.result)
            .then((pdf) => createBlobUrl(pdf, 'application/pdf'))
            .then((url) => setReportBlobUrl(url));

        setHarBlobUrl(
            createBlobUrl(JSON.stringify(proceedingMeta.initialNoInteractionResult?.har), 'application/har+json'),
        );
        setHarInteractionBlobUrl(
            createBlobUrl(JSON.stringify(proceedingMeta.initialInteractionResult?.har), 'application/har+json'),
        );
    }, [proceedingMeta]);

    console.log({ reportBlobUrl, noticeBlobUrl, harBlobUrl, harInteractionBlobUrl });

    if (!proceedingMeta) return <Text id="common.loading" />;
    if (!reportBlobUrl || !noticeBlobUrl || !harBlobUrl || !harInteractionBlobUrl)
        return <Text id="send-notice.generating" />;

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
                        <a href={noticeBlobUrl} target="_blank">
                            <Text id="send-notice.notice" />
                        </a>
                    </li>
                    <li>
                        <a href={reportBlobUrl} target="_blank">
                            <Text id="send-notice.technical-report" />
                        </a>
                    </li>
                    <li>
                        <a
                            href={harBlobUrl}
                            download={`${proceedingMeta.reference}-traffic-recording-no-interaction.har`}>
                            <Text id="send-notice.traffic-recording" />
                        </a>
                    </li>
                    <li>
                        <a
                            href={harInteractionBlobUrl}
                            download={`${proceedingMeta.reference}-traffic-recording-interaction.har`}>
                            <Text id="send-notice.traffic-recording-interaction" />
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
