import { useState } from 'preact/hooks';
import { sendBackgroundMessage, type ExtensionMessage } from '../../util/message';
import { MarkupText, t, Text } from '../util/i18n';

export const Home = () => {
    const [siteUrl, setSiteUrl] = useState<string>();

    if (browser.contextualIdentities === undefined)
        return (
            <div class="box box-warning">
                <MarkupText id="home.missing-containers" />
            </div>
        );

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if(siteUrl) sendBackgroundMessage({
                        type: 'startAnalysis',
                        siteUrl,
                    });
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
