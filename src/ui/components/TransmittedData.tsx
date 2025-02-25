import { useMemo } from 'preact/hooks';
import { prepareTraffic } from 'reporthar';
import { type AnnotatedResult as AnnotatedTrackHarResult } from 'trackhar';
import trackHarTranslationsEn from 'trackhar/i18n/en.json';
import { stubHar } from '../../util/util';
import { Text } from '../util/i18n';

export type TransmittedDataProps = {
    trackHarResult: (AnnotatedTrackHarResult | undefined)[];
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
};

const trackHarTranslations = {
    en: trackHarTranslationsEn,
};
const trackHarT = <TScope extends keyof typeof trackHarTranslationsEn>(
    scope: TScope,
    key: keyof (typeof trackHarTranslationsEn)[TScope],
) => trackHarTranslations['en'][scope][key];

export const TransmittedData = (props: TransmittedDataProps) => {
    const { findings } = useMemo(
        () =>
            prepareTraffic({
                trackHarResult: props.trackHarResult,
                // We don't care about the additional processing the function does on the HAR file for ReportHAR, so we can just
                // stub the HAR.
                har: stubHar,
            }),
        [],
    );

    if (Object.keys(findings).length === 0)
        return (
            <p>
                <em>
                    <Text id="trackhar-result.no-transmissions-detected" />
                </em>
            </p>
        );

    const Heading = `h${props.headingLevel || 2}` as 'h2';

    return Object.entries(findings).map(([adapterSlug, adapterResult]) => (
        <>
            <Heading>{adapterResult.adapter.name}</Heading>
            <Text
                id="trackhar-result.tracker-intro"
                substitutions={[adapterResult.requests.length + '', adapterResult.adapter.name]}
            />{' '}
            <a href={`https://trackers.tweasel.org/t/${adapterSlug}`}>
                <Text id="trackhar-result.more-information" />
            </a>
            <table class="table fancy-table">
                <thead>
                    <tr>
                        <th>
                            <Text id="trackhar-result.data-type" />
                        </th>
                        <th>
                            <Text id="trackhar-result.transmitted-values" />{' '}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(adapterResult.receivedData).map(([property, value]) => (
                        <tr>
                            <td>{trackHarT('properties', property as 'appName')}</td>
                            <td>
                                <code>{value.join(', ')}</code>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style>
                {`
                table.fancy-table td:nth-child(1),
                table.fancy-table th:nth-child(1) {
                    width: 30%;
                }
                `}
            </style>
        </>
    ));
};
