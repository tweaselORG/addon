import { parse as parseCookieHeader, parseSetCookie as parseSetCookieHeader } from 'cookie-es';
import type { Entry, Har } from 'har-format';
import * as qs from 'qs-esm';
import { ExtensionMessageParams } from './util/message';
import { generateReference, httpHeadersToHarHeaders, pause } from './util/util';

browser.runtime.onInstalled.addListener(async () => {
    console.log('Installed!');
});

browser.action.onClicked.addListener(() => browser.tabs.create({ url: '/ui.html' }));

type RequestId = string;

const analyzeWebsite = async (options: { url: string; reference: string }) => {
    const manifest = browser.runtime.getManifest();
    const browserInfo = await browser.runtime.getBrowserInfo();

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

    const onBeforeRequestEvents: Record<RequestId, browser.webRequest._OnBeforeRequestDetails> = {};
    const onSendHeadersEvents: Record<RequestId, browser.webRequest._OnSendHeadersDetails> = {};
    const onBeforeRedirectEvents: Record<RequestId, browser.webRequest._OnBeforeRedirectDetails> = {};
    const onResponseStartedEvents: Record<RequestId, browser.webRequest._OnResponseStartedDetails> = {};

    const har: Har = {
        log: {
            version: '1.2',
            creator: {
                name: manifest.name,
                version: manifest.version,
            },
            browser: {
                name: `${browserInfo.vendor} ${browserInfo.name}`,
                version: `${browserInfo.version} (${browserInfo.buildID})`,
            },
            pages: [],
            entries: [],
        },
    };

    browser.webRequest.onBeforeRequest.addListener(
        (details) => {
            onBeforeRequestEvents[details.requestId] = details;
        },
        { urls: ['<all_urls>'], tabId: tab.id },
        ['requestBody'],
    );

    browser.webRequest.onSendHeaders.addListener(
        (details) => {
            onSendHeadersEvents[details.requestId] = details;
        },
        { urls: ['<all_urls>'], tabId: tab.id },
        ['requestHeaders'],
    );

    browser.webRequest.onBeforeRedirect.addListener(
        (details) => {
            onBeforeRedirectEvents[details.requestId] = details;
        },
        { urls: ['<all_urls>'], tabId: tab.id },
    );

    browser.webRequest.onResponseStarted.addListener(
        (details) => {
            onResponseStartedEvents[details.requestId] = details;
        },
        { urls: ['<all_urls>'], tabId: tab.id },
    );

    browser.webRequest.onCompleted.addListener(
        async (onCompletedDetails) => {
            const onBeforeRequestDetails = onBeforeRequestEvents[onCompletedDetails.requestId];
            const onSendHeadersDetails = onSendHeadersEvents[onCompletedDetails.requestId];
            const onBeforeRedirectDetails = onBeforeRedirectEvents[onCompletedDetails.requestId];
            const onResponseStartedDetails = onResponseStartedEvents[onCompletedDetails.requestId];

            delete onBeforeRequestEvents[onCompletedDetails.requestId];
            delete onSendHeadersEvents[onCompletedDetails.requestId];
            delete onBeforeRedirectEvents[onCompletedDetails.requestId];
            delete onResponseStartedEvents[onCompletedDetails.requestId];

            if (!onBeforeRequestDetails) throw new Error('Missing onBeforeRequestDetails');
            if (!onSendHeadersDetails) throw new Error('Missing onSendHeadersDetails');
            if (!onResponseStartedDetails) throw new Error('Missing onResponseStartedDetails');

            // See: https://www.w3.org/Protocols/rfc2616/rfc2616-sec6.html#sec6.1
            const [responseHttpVersion, , responseStatusText] = onCompletedDetails.statusLine.split(' ');

            const url = new URL(onBeforeRequestDetails.url);

            const requestHeaders = httpHeadersToHarHeaders(onSendHeadersDetails.requestHeaders!);
            const responseHeaders = httpHeadersToHarHeaders(onCompletedDetails.responseHeaders!);

            const requestMimeType =
                requestHeaders.find((h) => h.name.toLowerCase() === 'content-type')?.value ||
                'application/octet-stream';
            const requestBodyParams = onBeforeRequestDetails.requestBody?.formData
                ? Object.entries(onBeforeRequestDetails.requestBody?.formData!).flatMap(([name, value]) =>
                      value.map((v: unknown) => ({
                          name,
                          value: v?.toString(),
                      })),
                  )
                : undefined;
            // TODO: What does it mean if `raw` has more than one entry? How should we handle that?
            let requestBodyText = onBeforeRequestDetails.requestBody?.raw?.[0]?.bytes
                ? new TextDecoder().decode(onBeforeRequestDetails.requestBody?.raw?.[0]?.bytes)
                : undefined;
            if (!requestBodyText && requestBodyParams && requestMimeType === 'application/x-www-form-urlencoded')
                requestBodyText = qs.stringify(Object.fromEntries(requestBodyParams.map((p) => [p.name, p.value])));

            const responseMimeType =
                responseHeaders.find((h) => h.name.toLowerCase() === 'content-type')?.value ||
                'application/octet-stream';

            const send = onSendHeadersDetails.timeStamp - onBeforeRequestDetails.timeStamp;
            const wait = onResponseStartedDetails.timeStamp - onSendHeadersDetails.timeStamp;
            const receive = onCompletedDetails.timeStamp - onResponseStartedDetails.timeStamp;

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
                            params: requestBodyParams as undefined,
                            text: requestBodyText as string,
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

            har.log.entries.push(entry);
        },
        { urls: ['<all_urls>'], tabId: tab.id },
        ['responseHeaders'],
    );

    await browser.tabs.update(tab.id, { url: options.url });

    await pause(60000);

    await browser.tabs.remove(tab.id);
    console.log(JSON.stringify(har));
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
