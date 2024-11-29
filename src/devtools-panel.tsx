import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { AnnotatedResult, process as processHAR, processRequest } from 'trackhar';

const _t = (key: string, section: string) => key;
const t = (key: string) => key;
const absUrl = (path: string) => 'https://trackers.tweasel.org' + path;

type RequestState = { result: AnnotatedResult | undefined };

const RequestView = ({ result }: RequestState) => {
    const adapter = result?.[0]?.adapter;

    return (
        <>
            {Array.isArray(result) ? (
                result.length === 0 ? (
                    <blockquote class="book-hint">{t('matched-no-data')}</blockquote>
                ) : (
                    <>
                        <blockquote class="book-hint info">
                            {adapter === 'indicators' ? (
                                t('matched-by-indicators')
                            ) : (
                                <>
                                    {t('matched-by-adapter')}{' '}
                                    <a href={absUrl('t/' + adapter)} target="_blank">
                                        {adapter}
                                    </a>
                                </>
                            )}
                        </blockquote>
                        <div class="data-table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th style="width: 25%;">
                                            {_t('tracker-single-transmitted-data-table-head-property', 'hugo')}
                                        </th>
                                        <th style="width: 10%;">
                                            {_t('tracker-single-transmitted-data-table-head-context', 'hugo')}
                                        </th>
                                        <th style="width: 25%;">
                                            {_t('tracker-single-transmitted-data-table-head-path', 'hugo')}
                                        </th>
                                        <th style="width: 40%;">{t('value')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.map((r) => (
                                        <ResultRow result={r} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )
            ) : (
                <blockquote class="book-hint">{t('unsupported-endpoint')}</blockquote>
            )}
        </>
    );
};

const ResultRow = ({ result }: { result: AnnotatedResult[number] }) => {
    let propertyName;

    try {
        propertyName = _t(result.property as string, 'properties');
    } catch (e) {
        propertyName = <code>{result.property as string}</code>;
    }

    return (
        <tr>
            <td>{propertyName}</td>
            <td>{result.context}</td>
            <td>
                <code>
                    {result.path}{' '}
                    {result.reasoning.startsWith('https://') || result.reasoning.startsWith('http://') ? (
                        <a href={result.reasoning} rel="nofollow" target="_blank">
                            <img
                                src="/svg/external.svg"
                                class="inline-icon icon-external"
                                alt={_t('tracker-single-transmitted-data-table-reasoning-external-link-desc', 'hugo')}
                                title={_t('tracker-single-transmitted-data-table-reasoning-external-link-desc', 'hugo')}
                            />
                        </a>
                    ) : result.reasoning.endsWith('.md') ? (
                        <a
                            href={absUrl(
                                'research/' + result.reasoning.replace(/\/([^/]+)$/, '#$1').replace(/\.md$/, ''),
                            )}
                            target="_blank">
                            <img
                                src="/svg/information.svg"
                                class="inline-icon icon-information"
                                title={_t('tracker-single-transmitted-data-table-reasoning-link-desc', 'hugo')}
                                alt={_t('tracker-single-transmitted-data-table-reasoning-link-desc', 'hugo')}
                            />
                        </a>
                    ) : (
                        <></>
                    )}
                </code>
            </td>
            <td class="value-column">
                <code>{result.value}</code>
            </td>
        </tr>
    );
};

const harEntryToRequest = async (e: browser.devtools.network.Request) => {
    const url = new URL(e.request.url);
    const endpointUrl = `${url.protocol}//${url.host}${url.pathname}`;
    const content = await e.getContent();

    return {
        startTime: new Date(e.startedDateTime),
        method: e.request.method,
        host: url.hostname,
        path: url.pathname + url.search,
        endpointUrl,
        content: content[0],
        port: url.port,
        scheme: url.protocol.replace(':', '') as 'http' | 'https',
        httpVersion: e.request.httpVersion,
        headers: e.request.headers,
        cookies: e.request.cookies,
    };
};

const TrackharResults = () => {
    const [har, setHar] = useState<any>(undefined);
    const [results, setResults] = useState<AnnotatedResult[]>([]);

    useEffect(() => {
        // Set the initial HAR
        browser.devtools.network.getHAR().then((har) => {
            setHar({ log: har });
        });

        // browser.devtools.network.onRequestFinished.addListener(async (request) => {
        //     console.log(processRequest(harEntryToRequest(request)));
        // });
    }, []);

    const analyze = () => {
        browser.devtools.network.getHAR().then((ffhar) => {
            const currentHar = { log: ffhar };
            if (currentHar.log.entries)
                processHAR(currentHar).then(
                    (results) => (console.log(results), setResults(results.filter((v) => !!v) as AnnotatedResult[])),
                );
        });
    };

    return (
        <>
            <h2>Tweasel Addon</h2>
            <button onClick={analyze}>Analyze</button>
            {results.length > 0 ? results.map((result) => <RequestView result={result} />) : <></>}
            <pre>{har}</pre>
        </>
    );
};

const trackharResultElement = document.getElementById('trackhar-results');
console.log(trackharResultElement);
if (trackharResultElement) render(<TrackharResults />, trackharResultElement);
