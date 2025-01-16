import { parse as parseCookieHeader, parseSetCookie as parseSetCookieHeader } from 'cookie-es';
import type { Entry } from 'har-format';
import * as qs from 'qs-esm';
import { ExtensionMessageParams } from './util/message';
import { generateReference, httpHeadersToHarHeaders, pause } from './util/util';

browser.runtime.onInstalled.addListener(async () => {
    console.log('Installed!');
});

browser.action.onClicked.addListener(() => browser.tabs.create({ url: '/ui.html' }));

const analyzeWebsite = async (options: { url: string; reference: string }) => {
    const container = await browser.contextualIdentities.create({
        name: `tweasel-temp-${options.reference}`,
        color: 'toolbar',
        icon: 'circle',
    });

    const tab = await browser.tabs.create({
        active: false,
        cookieStoreId: container.cookieStoreId,
        muted: true,
    });
    if (!tab.id) throw new Error('Could not create tab.');
    // await browser.tabs.hide(tab.id);

    const storageKey = (item: string, requestId: string) => `tmp-${tab.id}-${requestId}-${item}`;

    browser.webRequest.onBeforeRequest.addListener(
        async (details) => {
            await browser.storage.local.set({ [storageKey('onBeforeRequest', details.requestId)]: details });

            return { cancel: false };
        },
        { urls: ['<all_urls>'], tabId: tab.id },
        ['requestBody'],
    );

    browser.webRequest.onSendHeaders.addListener(
        async (details) => {
            await browser.storage.local.set({ [storageKey('onSendHeaders', details.requestId)]: details });

            return { cancel: false };
        },
        { urls: ['<all_urls>'], tabId: tab.id },
        ['requestHeaders'],
    );

    browser.webRequest.onBeforeRedirect.addListener(
        async (details) => {
            await browser.storage.local.set({ [storageKey('onBeforeRedirect', details.requestId)]: details });

            return { cancel: false };
        },
        { urls: ['<all_urls>'], tabId: tab.id },
    );

    browser.webRequest.onResponseStarted.addListener(
        async (details) => {
            await browser.storage.local.set({
                [storageKey('onResponseStarted-timestamp', details.requestId)]: details.timeStamp,
            });

            return { cancel: false };
        },
        { urls: ['<all_urls>'], tabId: tab.id },
    );

    browser.webRequest.onCompleted.addListener(
        async (onCompletedDetails) => {
            const onBeforeRequestKey = storageKey('onBeforeRequest', onCompletedDetails.requestId);
            const onBeforeRequestDetails: browser.webRequest._OnBeforeRequestDetails = (
                await browser.storage.local.get(onBeforeRequestKey)
            )[onBeforeRequestKey];
            await browser.storage.local.remove(onBeforeRequestKey);

            const onSendHeadersKey = storageKey('onSendHeaders', onCompletedDetails.requestId);
            const onSendHeadersDetails: browser.webRequest._OnSendHeadersDetails = (
                await browser.storage.local.get(onSendHeadersKey)
            )[onSendHeadersKey];
            await browser.storage.local.remove(onSendHeadersKey);

            const onBeforeRedirectKey = storageKey('onBeforeRedirect', onCompletedDetails.requestId);
            const onBeforeRedirectDetails: browser.webRequest._OnBeforeRedirectDetails = (
                await browser.storage.local.get(onBeforeRedirectKey)
            )[onBeforeRedirectKey];
            await browser.storage.local.remove(onBeforeRedirectKey);

            const onResponseStartedTimestampKey = storageKey(
                'onResponseStarted-timestamp',
                onCompletedDetails.requestId,
            );
            const onResponseStartedTimestamp: number = (await browser.storage.local.get(onResponseStartedTimestampKey))[
                onResponseStartedTimestampKey
            ];
            await browser.storage.local.remove(onResponseStartedTimestampKey);

            if (!onBeforeRequestDetails) throw new Error('Missing onBeforeRequestDetails');
            if (!onSendHeadersDetails) throw new Error('Missing onSendHeadersDetails');

            // See: https://www.w3.org/Protocols/rfc2616/rfc2616-sec6.html#sec6.1
            const [responseHttpVersion, , responseStatusText] = onCompletedDetails.statusLine.split(' ');

            const url = new URL(onBeforeRequestDetails.url);

            const requestHeaders = httpHeadersToHarHeaders(onSendHeadersDetails.requestHeaders!);
            const responseHeaders = httpHeadersToHarHeaders(onCompletedDetails.responseHeaders!);

            const requestMimeType =
                requestHeaders.find((h) => h.name.toLowerCase() === 'content-type')?.value ||
                'application/octet-stream';
            let requestBodyText = onBeforeRequestDetails.requestBody?.raw?.[0]?.bytes;
            if (
                !requestBodyText &&
                onBeforeRequestDetails.requestBody?.formData &&
                requestMimeType === 'application/x-www-form-urlencoded'
            )
                requestBodyText = qs.stringify(onBeforeRequestDetails.requestBody.formData);

            const responseMimeType =
                responseHeaders.find((h) => h.name.toLowerCase() === 'content-type')?.value ||
                'application/octet-stream';

            const send = onSendHeadersDetails.timeStamp - onBeforeRequestDetails.timeStamp;
            const wait = onResponseStartedTimestamp - onSendHeadersDetails.timeStamp;
            const receive = onCompletedDetails.timeStamp - onResponseStartedTimestamp;

            const entry: Entry = {
                startedDateTime: new Date(onBeforeRequestDetails.timeStamp).toISOString(),
                cache: {},
                request: {
                    method: onBeforeRequestDetails.method,
                    url: onBeforeRequestDetails.url,
                    // Unfortunately, there seems to be no way to get the request HTTP version using these APIs, so we
                    // have to fall back to a placeholder. This is also what Playwright does when the version cannot be
                    // determined:
                    // https://github.com/microsoft/playwright/blob/275f334b5828c9b17a6e85d323e243e4366b3359/packages/playwright-core/src/server/har/harTracer.ts#L617
                    httpVersion: 'HTTP/1.1',
                    headers: requestHeaders,
                    cookies: requestHeaders
                        .filter((h) => h.name.toLowerCase() === 'cookie')
                        .flatMap((h) =>
                            Object.entries(parseCookieHeader(h.value)).map(([name, value]) => ({ name, value })),
                        ),
                    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest#requestbody
                    queryString: Object.entries(qs.parse(url.search, { depth: 0, ignoreQueryPrefix: true })).map(
                        ([name, value]) => ({
                            name,
                            value: value?.toString() || '',
                        }),
                    ),
                    ...(onBeforeRequestDetails.requestBody && {
                        postData: {
                            mimeType: requestMimeType,
                            // According to the spec, `params` and `text` are mutually exclusive, however that is just
                            // not true in practice, cf.:
                            // https://github.com/tweaselORG/TrackHAR/issues/58#issuecomment-1838215940
                            params: onBeforeRequestDetails.requestBody?.formData
                                ? Object.entries(onBeforeRequestDetails.requestBody?.formData!).flatMap(
                                      ([name, value]) =>
                                          value.map((v: unknown) => ({
                                              name,
                                              value: v?.toString(),
                                          })),
                                  )
                                : undefined,
                            text: requestBodyText,
                        },
                    }),
                    headersSize: -1,
                    bodySize: -1,
                },
                response: {
                    status: onCompletedDetails.statusCode,
                    statusText: responseStatusText || '',
                    httpVersion: responseHttpVersion || '',
                    headers: responseHeaders,
                    redirectURL: onBeforeRedirectDetails ? onBeforeRedirectDetails.redirectUrl : '',
                    cookies: responseHeaders
                        .filter((h) => h.name.toLowerCase() === 'set-cookie')
                        .map((h) => parseSetCookieHeader(h.value))
                        .map((c) => ({ ...c, expires: c.expires?.toISOString() })),
                    content: {
                        // It does not appear to be possible to get the response body using webext APIs, but luckily,
                        // the field is optional in the HAR spec and we don't actually need/use the data.
                        mimeType: responseMimeType,
                        size: onCompletedDetails.responseSize,
                    },
                    bodySize: -1,
                    headersSize: -1,
                },
                timings: {
                    blocked: -1,
                    dns: -1,
                    connect: -1,
                    ssl: -1,

                    send,
                    wait,
                    receive,
                },
                time: send + wait + receive,
                serverIPAddress: onCompletedDetails.ip,
            };
            console.log(entry);
        },
        { urls: ['<all_urls>'], tabId: tab.id },
        ['responseHeaders'],
    );

    await browser.tabs.update(tab.id, { url: options.url });

    await pause(5000);

    await browser.contextualIdentities.remove(container.cookieStoreId);
};

browser.runtime.onMessage.addListener(
    (message: ExtensionMessageParams[keyof ExtensionMessageParams], sender, sendResponse) => {
        // We do not accept external messages here.
        if (sender.id !== browser.runtime.id) return false;

        if (message.type === 'startAnalysis') {
            const reference = generateReference(new Date());

            analyzeWebsite({ url: message.siteUrl, reference });

            sendResponse({ reference });
        } else throw new Error('Invalid Message', { cause: message });

        return false;
    },
);

browser.action.onClicked.addListener(() => {
    // We cannot rely on this permission being set on install, because browsers treat `host_permissions` as optional since Manifest V3 (see https://blog.mozilla.org/addons/2022/11/17/unified-extensions-button-and-how-to-handle-permissions-in-manifest-v3/).
    // Also, this cannot be async, because this destroys the required "user action" context (see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/User_actions).
    browser.permissions.request({ origins: ['<all_urls>'] }).then(async (success) => {
        if (!success) throw new Error('Missing permissions');

        browser.tabs.reload();
    });
});

browser.tabs.onRemoved.addListener(async (tabId) => {
    // There is no `getKeys()` function, so we always have to pointlessly fetch all this data. :(
    const allKeys = Object.keys(await browser.storage.local.get());

    await browser.storage.local.remove(allKeys.filter((key) => key.startsWith(`tmp-${tabId}-`)));
});
