import { useState } from 'preact/hooks';
import { useLocation } from 'wouter-preact';
import { sendBackgroundMessage } from '../../util/message';
import { MarkupText, Text, t } from '../util/i18n';

export const Home = () => {
    const [siteUrl, setSiteUrl] = useState<string>('https://example.org');
    const [, navigate] = useLocation();

    if (browser.contextualIdentities === undefined)
        return (
            <div class="box box-warning">
                <MarkupText id="home.missing-containers" />
            </div>
        );

    return (
        <>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();

                    if (siteUrl) {
                        const { reference } = await sendBackgroundMessage({ type: 'startAnalysis', siteUrl });
                        navigate(`/analysis/${reference}`);
                    }
                }}>
                <label>
                    <Text id="home.siteUrl" />

                    <input type="url" required value={siteUrl} onChange={(e) => setSiteUrl(e.currentTarget.value)} />

                    <input type="submit" value={t('home.analyze')} />
                </label>
            </form>
        </>
    );
};
