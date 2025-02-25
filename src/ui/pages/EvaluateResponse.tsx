import { useEffect, useState } from 'preact/hooks';
import { navigate } from 'wouter-preact/use-hash-location';
import { sendBackgroundMessage } from '../../util/message';
import { getProceeding, updateProceeding } from '../../util/proceedings';
import { type ProceedingMeta } from '../../util/types';
import { formatDate } from '../../util/util';
import { RadioForm } from '../components/RadioForm';
import { Text } from '../util/i18n';

export type EvaluateResponseProps = {
    reference: string;
};

export const EvaluateResponse = (props: EvaluateResponseProps) => {
    const [proceedingMeta, setProceedingMeta] = useState<ProceedingMeta>();

    useEffect(() => {
        getProceeding(props.reference, { includeResults: false }).then((res) => setProceedingMeta(res));
    }, []);

    if (!proceedingMeta) return <Text id="common.loading" />;
    if (!proceedingMeta.noticeSent) return <Text id="evaluate-response.no-notice-yet" />;

    const deadline = formatDate(proceedingMeta.controllerResponseDeadline);
    const deadlineExpired = new Date() > proceedingMeta.controllerResponseDeadline;

    return (
        <>
            <h1>
                <Text id="evaluate-response.heading" />
            </h1>

            <p>
                <Text id="evaluate-response.explanation" />
            </p>

            {!deadlineExpired && (
                <p>
                    <Text id="evaluate-response.explanation-deadline" substitutions={[deadline]} />
                </p>
            )}

            <RadioForm
                options={[
                    { label: 'evaluate-response.reponse-promise', value: 'promise' },
                    { label: 'evaluate-response.reponse-denial', value: 'denial' },
                    {
                        label: 'evaluate-response.reponse-none',
                        value: 'none',
                        ...(!deadlineExpired && {
                            disabled: true,
                            explanation: {
                                title: 'evaluate-response.why-not-yet',
                                text: 'evaluate-response.why-not-yet-explanation',
                                textSubstitutions: [deadline],
                            },
                        }),
                    },
                ]}
                onSubmit={(v) =>
                    updateProceeding(props.reference, { controllerResponse: v })
                        .then(() =>
                            sendBackgroundMessage('startAnalysis', {
                                reference: props.reference,
                                analysisType: 'second',
                            }),
                        )
                        .then(() => navigate(`/analysis/${props.reference}`))
                }
                outerClass="col75 col100-mobile"
            />
        </>
    );
};
