import { useEffect, useState } from 'preact/hooks';
import { Link, useLocation } from 'wouter-preact';
import { sendBackgroundMessage } from '../../util/message';
import { deleteProceeding, getProceedings } from '../../util/proceedings';
import { ProceedingMeta } from '../../util/types';
import { MarkupText, Text, t } from '../util/i18n';

export const Home = () => {
    const [siteUrl, setSiteUrl] = useState<string>();
    const [proceedings, setProceedings] = useState<ProceedingMeta[]>();
    const [proceedingUpdates, setProceedingUpdates] = useState(0);
    const [, navigate] = useLocation();

    useEffect(() => {
        getProceedings({ includeResults: false }).then((result) => setProceedings(result));
    }, [proceedingUpdates]);

    if (browser.contextualIdentities === undefined)
        return (
            <div class="box box-warning">
                <MarkupText id="home.missing-containers" />
            </div>
        );

    return (
        <>
            <h1>
                <Text id="home.title" />
            </h1>

            <h2>
                <Text id="home.start-analysis" />
            </h2>

            <p>
                <Text id="home.explanation" />
            </p>

            <form
                onSubmit={async (e) => {
                    e.preventDefault();

                    if (siteUrl) {
                        const { reference } = await sendBackgroundMessage('startAnalysis', {
                            siteUrl,
                            analysisType: 'initial',
                        });
                        navigate(`/analysis/${reference}`);
                    }
                }}>
                <label>
                    <strong>
                        <Text id="home.siteUrl" />
                    </strong>
                    <br />

                    <input
                        type="url"
                        class="form-element"
                        required
                        value={siteUrl}
                        placeholder="https://example.org"
                        onInput={(e) => setSiteUrl(e.currentTarget.value)}
                    />
                </label>

                <input
                    type="submit"
                    class="button button-primary"
                    value={t('home.analyze')}
                    style="margin-top: 1em;"
                    disabled={!siteUrl}
                />
            </form>

            {proceedings && proceedings.length > 0 && (
                <>
                    <h2>
                        <Text id="home.proceedings" />
                    </h2>

                    <table class="table fancy-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>
                                    <Text id="home.started-at" />
                                </th>
                                <th>
                                    <Text id="home.reference" />
                                </th>
                                <th>
                                    <Text id="home.site-url" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {proceedings.map((proceeding) => (
                                <tr>
                                    <td>
                                        <button
                                            class="button button-secondary button-small icon-trash"
                                            title={t('home.delete-proceeding', [proceeding.reference])}
                                            onClick={() => {
                                                if (
                                                    confirm(t('home.confirm-delete-proceeding', [proceeding.reference]))
                                                )
                                                    deleteProceeding(proceeding.reference).then(() =>
                                                        setProceedingUpdates(proceedingUpdates + 1),
                                                    );
                                            }}
                                        />
                                    </td>
                                    <td>{new Date(proceeding.startedAt).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={`/analysis/${proceeding.reference}`}>{proceeding.reference}</Link>
                                    </td>
                                    <td>{proceeding.siteUrl}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </>
    );
};
