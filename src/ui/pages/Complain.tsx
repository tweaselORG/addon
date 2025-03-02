import { useEffect, useState } from 'preact/hooks';
import { navigate } from 'wouter-preact/use-hash-location';
import { dpas } from '../../util/dpas';
import { sendBackgroundMessage } from '../../util/message';
import { updateProceeding as _updateProceeding, getProceeding } from '../../util/proceedings';
import { type ProceedingMeta } from '../../util/types';
import { trackHarResultIsEmpty } from '../../util/util';
import { RadioForm } from '../components/RadioForm';
import { createBlobUrl, openPdf } from '../util/file';
import { MarkupText, Text, t } from '../util/i18n';

export type ComplainProps = {
    reference: string;
};

export const Complain = (props: ComplainProps) => {
    const [proceedingMeta, setProceedingMeta] = useState<ProceedingMeta>();
    const dpa = proceedingMeta?.complaintAuthority && dpas[proceedingMeta.complaintAuthority];

    const [controllerName, setControllerName] = useState<string>();
    const [controllerAddress, setControllerAddress] = useState<string>();
    const [controllerDetailsSourceUrl, setControllerDetailsSourceUrl] = useState<string>();

    const [complainantAddress, setComplainantAddress] = useState<string>();
    const [complainantContactDetails, setComplainantContactDetails] = useState<string>();
    const [complainantAgreesToUnencryptedCommunication, setComplainantAgreesToUnencryptedCommunication] =
        useState<boolean>();

    const [reportBlobUrl, setReportBlobUrl] = useState<string>();
    const [harBlobUrl, setHarBlobUrl] = useState<string>();
    const [harInteractionBlobUrl, setHarInteractionBlobUrl] = useState<string>();

    const [complaintDownloaded, setComplaintDownloaded] = useState(false);

    useEffect(() => {
        getProceeding(props.reference, { includeResults: true }).then((res) => setProceedingMeta(res));
    }, []);

    useEffect(() => {
        if (
            !proceedingMeta ||
            !proceedingMeta.secondNoInteractionResult ||
            !proceedingMeta.secondInteractionResult ||
            !proceedingMeta.complaintAuthority
        )
            return;

        sendBackgroundMessage('reportHarGenerate', {
            options: {
                type: 'report',
                analysisSource: 'web',
                // TODO
                language: 'en',

                har: proceedingMeta.secondNoInteractionResult!.har,
                trackHarResult: proceedingMeta.secondNoInteractionResult!.trackHarResult,

                harInteraction: proceedingMeta.secondInteractionResult!.har,
                trackHarResultInteraction: proceedingMeta.secondInteractionResult!.trackHarResult,
            },
        })
            .then((r) => r.result)
            .then((pdf) => createBlobUrl(pdf, 'application/pdf'))
            .then((url) => setReportBlobUrl(url));

        setHarBlobUrl(
            createBlobUrl(JSON.stringify(proceedingMeta.secondNoInteractionResult?.har), 'application/har+json'),
        );
        setHarInteractionBlobUrl(
            createBlobUrl(JSON.stringify(proceedingMeta.secondInteractionResult?.har), 'application/har+json'),
        );
    }, [proceedingMeta]);

    const updateProceeding = (update: Partial<ProceedingMeta>) =>
        _updateProceeding(props.reference, update).then(() =>
            setProceedingMeta((prev) => ({ ...prev, ...(update as ProceedingMeta) })),
        );

    if (!proceedingMeta) return <Text id="common.loading" />;
    if (!proceedingMeta.secondNoInteractionResult || !proceedingMeta.secondInteractionResult)
        return <Text id="complain.not-yet" />;
    if (
        (trackHarResultIsEmpty(proceedingMeta.secondNoInteractionResult.trackHarResult) &&
            trackHarResultIsEmpty(proceedingMeta.secondInteractionResult.trackHarResult)) ||
        ((proceedingMeta.secondInteractionConsent === 'given' ||
            proceedingMeta.secondInteractionConsent === 'not-sure') &&
            trackHarResultIsEmpty(proceedingMeta.secondNoInteractionResult.trackHarResult))
    )
        return <Text id="complain.no-tracking" />;

    if (proceedingMeta.complainantIsUserOfWebsite === undefined || !proceedingMeta.complaintType)
        return (
            <>
                <h1>
                    <Text id="complain.askIsUserOfWebsite-heading" />
                </h1>

                <p>
                    <Text id="complain.askIsUserOfWebsite-explanation" />
                </p>

                <RadioForm
                    options={[
                        { label: 'common.yes', value: 'yes' },
                        { label: 'common.no', value: 'no' },
                    ]}
                    onSubmit={(v) =>
                        updateProceeding({
                            complainantIsUserOfWebsite: v === 'yes',
                            complaintType: v === 'yes' ? 'formal' : 'informal',
                        })
                    }
                />
            </>
        );

    if (!proceedingMeta.controllerName || !proceedingMeta.controllerAddress)
        return (
            <>
                <h1>
                    <Text id="complain.askControllerAddress-heading" />
                </h1>

                <p>
                    <Text id="complain.askControllerAddress-explanation" />
                </p>

                <div class="col66 col100-mobile">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();

                            updateProceeding({
                                controllerName,
                                controllerAddress,
                                controllerDetailsSourceUrl,
                            });
                        }}>
                        <div class="form-group">
                            <label for="controllerName">
                                <Text id="complain.askControllerAddress-name" />
                            </label>
                            <br />
                            <input
                                type="text"
                                id="controllerName"
                                class="form-element"
                                placeholder={t('complain.askControllerAddress-name-placeholder')}
                                value={controllerName}
                                onInput={(e) => setControllerName(e.currentTarget.value)}
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="controllerAddress">
                                <Text id="complain.askControllerAddress-address" />
                            </label>
                            <br />
                            <textarea
                                id="controllerAddress"
                                class="form-element"
                                placeholder={t('complain.askControllerAddress-address-placeholder')}
                                value={controllerAddress}
                                onInput={(e) => setControllerAddress(e.currentTarget.value)}
                                rows={4}
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="controllerAddressSourceUrl">
                                <Text id="complain.askControllerAddress-source" />
                            </label>
                            <br />
                            <input
                                type="url"
                                id="controllerAddressSourceUrl"
                                class="form-element"
                                placeholder={t('complain.askControllerAddress-source-placeholder')}
                                value={controllerDetailsSourceUrl}
                                onInput={(e) => setControllerDetailsSourceUrl(e.currentTarget.value)}
                                required
                            />
                        </div>

                        <input type="submit" class="button button-primary" value={t('common.continue')} />
                    </form>
                </div>
            </>
        );

    if (!proceedingMeta.complaintAuthority)
        return (
            <>
                <h1>
                    <Text id="complain.askAuthority-heading" />
                </h1>

                <p>
                    <MarkupText id="complain.askAuthority-explanation" />
                </p>

                <RadioForm
                    options={Object.values(dpas).map((dpa) => ({ labelLiteral: dpa.name, value: dpa.slug }))}
                    onSubmit={(v) => updateProceeding({ complaintAuthority: v })}
                />
            </>
        );

    if (!reportBlobUrl || !harBlobUrl || !harInteractionBlobUrl) return <Text id="complain.readyToSend-generating" />;

    if (!proceedingMeta.complaintSent && dpa)
        return (
            <>
                <h1>
                    <Text id="complain.readyToSend-heading" />
                </h1>

                <p>
                    <MarkupText id="complain.readyToSend-explanation" />
                </p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        sendBackgroundMessage('reportHarGenerate', {
                            options: {
                                type:
                                    proceedingMeta.complaintType === 'formal'
                                        ? 'complaint'
                                        : ('complaint-informal' as 'complaint'),
                                analysisSource: 'web',
                                // TODO
                                language: 'en',

                                har: proceedingMeta.secondNoInteractionResult!.har,
                                trackHarResult: proceedingMeta.secondNoInteractionResult!.trackHarResult,
                                harInteraction: proceedingMeta.secondInteractionResult!.har,
                                trackHarResultInteraction: proceedingMeta.secondInteractionResult!.trackHarResult,
                                initialHar: proceedingMeta.initialNoInteractionResult!.har,
                                initialTrackHarResult: proceedingMeta.initialNoInteractionResult!.trackHarResult,
                                // TODO: These two are actually not used by ReportHAR.
                                initialHarInteraction: proceedingMeta.initialInteractionResult!.har,
                                initialTrackHarResultInteraction:
                                    proceedingMeta.initialInteractionResult!.trackHarResult,

                                complaintOptions: {
                                    date: new Date(),
                                    reference: proceedingMeta.reference,
                                    noticeDate: proceedingMeta.noticeSent!,

                                    // TODO
                                    nationalEPrivacyLaw: false,

                                    controllerAddress:
                                        proceedingMeta.controllerName + ', ' + proceedingMeta.controllerAddress,
                                    controllerAddressSourceUrl: proceedingMeta.controllerDetailsSourceUrl!,
                                    controllerResponse:
                                        proceedingMeta.controllerResponse === 'promise'
                                            ? 'broken-promise'
                                            : proceedingMeta.controllerResponse!,

                                    complainantAddress: complainantAddress!,
                                    complainantContactDetails: complainantContactDetails!,
                                    complainantAgreesToUnencryptedCommunication:
                                        complainantAgreesToUnencryptedCommunication!,

                                    interactionNoConsent:
                                        proceedingMeta.secondInteractionConsent !== 'given' &&
                                        proceedingMeta.secondInteractionConsent !== 'not-sure',
                                },
                            },
                        })
                            .then((r) => r.result)
                            .then((pdf) => openPdf(pdf))
                            .then(() => setComplaintDownloaded(true));
                    }}>
                    <div class="radio-wrapper col66 col100-mobile">
                        <div class="form-group">
                            <label for="complainantAddress">
                                <Text id="complain.readyToSend-complainant" />
                            </label>
                            <br />
                            <textarea
                                id="complainantAddress"
                                class="form-element"
                                value={complainantAddress}
                                onChange={(e) => setComplainantAddress(e.currentTarget.value)}
                                rows={4}
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="complainantContactDetails">
                                <Text id="complain.readyToSend-contact-details" />
                            </label>
                            <br />
                            <input
                                type="text"
                                id="complainantContactDetails"
                                class="form-element"
                                value={complainantContactDetails}
                                onChange={(e) => setComplainantContactDetails(e.currentTarget.value)}
                                required
                            />
                        </div>

                        <fieldset class="label-only-fieldset" style="margin-bottom: 1em;">
                            <legend>
                                <MarkupText id="complain.readyToSend-agree-to-unencrypted-communication" />
                            </legend>

                            <div class="radio-group">
                                {(['yes', 'no-letter'] as const).map((a) => (
                                    <div class="radio-wrapper">
                                        <input
                                            id={`agree-to-unencrypted-communication-${a}`}
                                            type="radio"
                                            class="form-element"
                                            value={a}
                                            checked={
                                                complainantAgreesToUnencryptedCommunication !== undefined &&
                                                (complainantAgreesToUnencryptedCommunication === true
                                                    ? 'yes'
                                                    : 'no-letter') === a
                                            }
                                            onChange={(e) =>
                                                setComplainantAgreesToUnencryptedCommunication(
                                                    e.currentTarget.value === 'yes',
                                                )
                                            }
                                            required
                                        />
                                        <label class="radio-label" for={`agree-to-unencrypted-communication-${a}`}>
                                            <Text id={`complain.readyToSend-${a}`} />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </fieldset>

                        <input
                            type="submit"
                            class={`button button-${complaintDownloaded ? 'secondary' : 'primary'}`}
                            value={t('complain.readyToSend-generate-complaint')}
                        />
                    </div>
                </form>
                <div class="clearfix"></div>

                <hr />

                <p>
                    <Text id="complain.readyToSend-send-explanation" />
                </p>

                <h2>
                    <Text id="complain.readyToSend-dpa-contact-details" />
                </h2>
                <p>
                    <Text id="complain.readyToSend-dpa-contact-details-explanation" />
                </p>

                <div class="col40 col100-mobile">
                    <strong>
                        <Text id="complain.readyToSend-address" />
                    </strong>
                    <br />
                    {dpa.name}
                    <br />
                    {dpa.address.split('\n').map((l) => [l, <br />])}
                </div>

                <div class="col60 col100-mobile">
                    {'email' in dpa && (
                        <>
                            <strong>
                                <Text id="complain.readyToSend-email" />
                            </strong>
                            <br />
                            <a href={`mailto:${dpa.email}`}>{dpa.email}</a>{' '}
                            {'pgp-url' in dpa && (
                                <>
                                    (
                                    <a href={dpa['pgp-url']}>
                                        <Text id="complain.readyToSend-pgp-key" />
                                    </a>
                                    )
                                </>
                            )}
                            <br />
                        </>
                    )}

                    {'webform' in dpa && (
                        <>
                            <strong>
                                <Text id="complain.readyToSend-webform" />
                            </strong>
                            <br />
                            <a href={dpa.webform} target="_blank">
                                {dpa.webform}
                            </a>
                        </>
                    )}
                </div>
                <div class="clearfix"></div>

                <h2>
                    <Text id="complain.readyToSend-attachments" />
                </h2>

                <div class="box box-warning">
                    <Text id="complain.readyToSend-attachment-note" />
                </div>

                <ul>
                    <li>
                        <a href={reportBlobUrl} target="_blank">
                            <Text id="complain.readyToSend-technical-report" />
                        </a>
                    </li>
                    <li>
                        <a
                            href={harBlobUrl}
                            download={`${proceedingMeta.reference}-traffic-recording-no-interaction.har`}>
                            <Text id="complain.readyToSend-traffic-recording" />
                        </a>
                    </li>
                    <li>
                        <a
                            href={harInteractionBlobUrl}
                            download={`${proceedingMeta.reference}-traffic-recording-interaction.har`}>
                            <Text id="complain.readyToSend-traffic-recording-interaction" />
                        </a>
                    </li>
                    <li>
                        <Text id="complain.readyToSend-controller-communication" />
                    </li>
                </ul>

                <button
                    class={`button button-${complaintDownloaded ? 'primary' : 'secondary'}`}
                    disabled={!complaintDownloaded}
                    onClick={() =>
                        updateProceeding({ complaintSent: new Date() }).then(() =>
                            navigate(`/analysis/${props.reference}`),
                        )
                    }>
                    <Text id="complain.readyToSend-complaint-sent" />
                </button>
            </>
        );

    return <Text id="complain.sent-already" />;
};
