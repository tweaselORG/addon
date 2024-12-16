import { useState } from 'preact/hooks';
import { Text } from '../util/i18n';

export const Home = () => {
    const [siteUrl, setSiteUrl] = useState<string>();

    return (
        <>
            <label>
                <Text id="home.siteUrl" />

                <input type="url" required value={siteUrl} onChange={(e) => setSiteUrl(e.currentTarget.value)} />

                <button
                    onClick={() =>
                        browser.runtime.sendMessage({
                            greeting: 'Greeting from the content script',
                        })
                    }>
                    <Text id="home.analyze" />
                </button>
            </label>
        </>
    );
};
