import { parse as parseCookieHeader, parseSetCookie as parseSetCookieHeader } from 'cookie-es';
import type { Entry, Har } from 'har-format';
import * as qs from 'qs-esm';
import type { GenerateOptions as ReportHarGenerateOptions, TweaselHar } from 'reporthar';
import type { AnnotatedResult as AnnotatedTrackHarResult } from 'trackhar';
import { version as trackHarVersion } from 'trackhar/package.json';
import { addBackgroundMessageListener, sendBackgroundMessage } from './util/message';
import { createProceeding, getProceeding, updateProceeding } from './util/proceedings';
import type { AnalysisType, ProceedingMeta, ProceedingMetaBase } from './util/types';
import { generateReference, httpHeadersToHarHeaders, pause } from './util/util';

browser.runtime.onInstalled.addListener(async () => {
    console.log('Installed!');
});

type RequestId = string;

type RecordHarOptions = {
    /** Either an ISO 8601 string of when the site was loaded (if it was already loaded) or a function to load the site. */
    loadSite: string | (() => Promise<unknown>);
    siteUrl: string;
    tabId: number;
    timeout: number | Promise<unknown>;
};
const recordHar = async (options: RecordHarOptions) => {
    const onBeforeRequestEvents: Record<RequestId, browser.webRequest._OnBeforeRequestDetails> = {};
    const onSendHeadersEvents: Record<RequestId, browser.webRequest._OnSendHeadersDetails> = {};
    const onBeforeRedirectEvents: Record<RequestId, browser.webRequest._OnBeforeRedirectDetails> = {};
    const onResponseStartedEvents: Record<RequestId, browser.webRequest._OnResponseStartedDetails> = {};

    const manifest = browser.runtime.getManifest();
    const browserInfo = await browser.runtime.getBrowserInfo();
    const platformInfo = await browser.runtime.getPlatformInfo();

    const har: TweaselHar = {
        log: {
            version: '1.2',
            creator: {
                name: 'Tweasel browser addon',
                version: manifest.version,
            },
            browser: {
                name: `${browserInfo.vendor} ${browserInfo.name}`,
                version: `${browserInfo.version} (${browserInfo.buildID})`,
            },
            _tweasel: {
                device: {
                    platform: platformInfo.os as 'android',
                    runTarget: 'device',
                    osVersion: '<unknown>',
                    architectures: platformInfo.arch,
                },
                startDate: new Date().toISOString(),
                endDate: '',
                metaVersion: '2.0-alpha0' as '2.0',
                versions: {
                    'tweasel-addon': manifest.version,
                    trackhar: trackHarVersion,
                },
                periodWithoutInteraction: typeof options.timeout === 'number' ? options.timeout : -1,
            },
            pages: [
                {
                    id: 'analyzedPage',
                    pageTimings: {},
                    startedDateTime: '',
                    title: options.siteUrl,
                    _URL: options.siteUrl,
                },
            ],
            entries: [],
        },
    };

    if (typeof options.loadSite === 'function') {
        await options.loadSite();
        har.log.pages![0]!.startedDateTime = new Date().toISOString();
    } else {
        har.log.pages![0]!.startedDateTime = options.loadSite;

        const title = await browser.tabs.get(options.tabId).then((tab) => tab.title);
        if (title) har.log.pages![0]!.title = title;
    }

    const onBeforeRequestListener: (details: browser.webRequest._OnBeforeRequestDetails) => void = (details) => {
        onBeforeRequestEvents[details.requestId] = details;
    };
    browser.webRequest.onBeforeRequest.addListener(
        onBeforeRequestListener,
        { urls: ['<all_urls>'], tabId: options.tabId },
        ['requestBody'],
    );

    const onSendHeadersListener: (details: browser.webRequest._OnSendHeadersDetails) => void = (details) => {
        onSendHeadersEvents[details.requestId] = details;
    };
    browser.webRequest.onSendHeaders.addListener(
        onSendHeadersListener,
        { urls: ['<all_urls>'], tabId: options.tabId },
        ['requestHeaders'],
    );

    const onBeforeRedirectListener: (details: browser.webRequest._OnBeforeRedirectDetails) => void = (details) => {
        onBeforeRedirectEvents[details.requestId] = details;
    };
    browser.webRequest.onBeforeRedirect.addListener(onBeforeRedirectListener, {
        urls: ['<all_urls>'],
        tabId: options.tabId,
    });

    const onResponseStartedListener: (details: browser.webRequest._OnResponseStartedDetails) => void = (details) => {
        onResponseStartedEvents[details.requestId] = details;
    };
    browser.webRequest.onResponseStarted.addListener(onResponseStartedListener, {
        urls: ['<all_urls>'],
        tabId: options.tabId,
    });

    const onCompletedListener: (details: browser.webRequest._OnCompletedDetails) => void = async (
        onCompletedDetails,
    ) => {
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
            requestHeaders.find((h) => h.name.toLowerCase() === 'content-type')?.value || 'application/octet-stream';
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
            responseHeaders.find((h) => h.name.toLowerCase() === 'content-type')?.value || 'application/octet-stream';

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
            pageref: 'analyzedPage',
        };

        har.log.entries.push(entry);
    };
    browser.webRequest.onCompleted.addListener(onCompletedListener, { urls: ['<all_urls>'], tabId: options.tabId }, [
        'responseHeaders',
    ]);

    await (typeof options.timeout === 'number' ? pause(options.timeout) : options.timeout);

    browser.webRequest.onBeforeRequest.removeListener(onBeforeRequestListener);
    browser.webRequest.onSendHeaders.removeListener(onSendHeadersListener);
    browser.webRequest.onBeforeRedirect.removeListener(onBeforeRedirectListener);
    browser.webRequest.onResponseStarted.removeListener(onResponseStartedListener);
    browser.webRequest.onCompleted.removeListener(onCompletedListener);

    har.log._tweasel.endDate = new Date().toISOString();

    if (typeof options.loadSite === 'function') {
        const title = await browser.tabs.get(options.tabId).then((tab) => tab.title);
        if (title) har.log.pages![0]!.title = title;
    }

    return har;
};

const analyzeWebsite = async (proceedingMeta: ProceedingMetaBase, analysisType: AnalysisType) => {
    const container = await browser.contextualIdentities.create({
        name: `tweasel-temp-${proceedingMeta.reference}`,
        color: 'toolbar',
        icon: 'circle',
    });

    const tab = await browser.tabs.create({
        active: false,
        cookieStoreId: container.cookieStoreId,
        muted: true,
    });
    if (!tab.id) throw new Error('Could not create tab.');
    await browser.tabs.hide(tab.id);

    const noInteractionHar = await recordHar({
        tabId: tab.id,
        timeout: 30000,
        loadSite: () => browser.tabs.update(tab.id!, { url: proceedingMeta.siteUrl }),
        siteUrl: proceedingMeta.siteUrl,
    });
    const { result: noInteractionTrackHarResult } = await trackHarProcess(noInteractionHar);
    const noInteractionResult = { har: noInteractionHar, trackHarResult: noInteractionTrackHarResult };
    await updateProceeding(proceedingMeta.reference, { [analysisType + 'NoInteractionResult']: noInteractionResult });
    await sendBackgroundMessage('analysisEvent', {
        reference: proceedingMeta.reference,
        event: {
            analysisType,
            type: 'no-interaction-completed',
            har: noInteractionHar,
            trackHarResult: noInteractionTrackHarResult,
        },
    });

    await browser.tabs.show(tab.id);

    const interactionTimeout = new Promise<void>((resolve) => {
        const finish = () => {
            resolve();
            backgroundMessageCleanup();
            browser.tabs.onRemoved.removeListener(tabListener);
        };

        const tabListener = (tabId: number) => {
            if (tabId === tab.id) finish();
        };
        browser.tabs.onRemoved.addListener(tabListener);

        const backgroundMessageCleanup = addBackgroundMessageListener(async (m) => {
            if (m.type === 'endInteractionAnalysis' && m.reference === proceedingMeta.reference) {
                finish();
                return true;
            }

            return false;
        });
    });
    const interactionHar = await recordHar({
        tabId: tab.id,
        timeout: interactionTimeout,
        loadSite: noInteractionHar.log.pages![0]!.startedDateTime,
        siteUrl: proceedingMeta.siteUrl,
    });
    const { result: interactionTrackHarResult } = await trackHarProcess(interactionHar);
    const interactionResult = { har: interactionHar, trackHarResult: interactionTrackHarResult };
    await updateProceeding(proceedingMeta.reference, { [analysisType + 'InteractionResult']: interactionResult });
    await sendBackgroundMessage('analysisEvent', {
        reference: proceedingMeta.reference,
        event: {
            analysisType,
            type: 'interaction-completed',
            har: interactionHar,
            trackHarResult: interactionTrackHarResult,
        },
    });

    await browser.tabs
        .remove(tab.id)
        // The user may have already closed the tab themselves, that's fine.
        .catch(() => 1);

    await browser.contextualIdentities.remove(container.cookieStoreId);
};

const ensureSandboxIframe = (type: 'trackhar' | 'reporthar') => {
    const existingIframe = document.getElementById(`${type}-sandbox`) as HTMLIFrameElement;
    if (existingIframe) {
        // This is not ideal. It could be that we fire two requests in short succession with the second one happening
        // just after the iframe has been created but before it has loaded. However, after having spent a ridiculous
        // amount of time on this (considering how simple it should be), I'm not sure whether properly checking is even
        // possible.
        // We cannot observe the `load` event again because it will not fire if the iframe is already loaded. We cannot
        // use `document.readyState` either because we are not allowed to access the `document` of a cross-origin iframe
        // (which we deliberately want this one to be for sandboxing).
        // And keeping the state ourselves after observing the `load` event once doesn't really work either since the
        // background page could have been reloaded/crashed without us noticing. Besides, with MV3, we cannot rely on
        // global variables to keep state and would have to commit this data __to disk__, which is just utterly
        // ridiculous.
        const iframeReady = Promise.resolve();

        return [existingIframe, iframeReady] as const;
    }

    const iframe = document.createElement('iframe');
    iframe.id = `${type}-sandbox`;
    iframe.allowFullscreen = false;
    iframe.loading = 'eager';
    iframe.sandbox.add('allow-scripts');
    iframe.src = browser.runtime.getURL(`${type}-sandbox.html`);
    iframe.style.display = 'none';

    document.body.appendChild(iframe);

    const iframeReady = new Promise<void>((res) => (iframe.onload = () => res()));

    return [iframe, iframeReady] as const;
};
const sandboxExecute = <ResultT>(type: 'trackhar' | 'reporthar', request: Record<string, unknown>) => {
    const [iframe, iframeReady] = ensureSandboxIframe(type);

    return iframeReady.then(
        () =>
            new Promise<{ result: ResultT }>((res, rej) => {
                const id = Math.random().toString(36);

                const listener = (event: MessageEvent) => {
                    console.log({ event, data: event.data });
                    if (event.origin !== 'null') return;

                    try {
                        const response = JSON.parse(event.data);
                        if (response.id !== id) return;

                        window.removeEventListener('message', listener);
                        res({ result: response.result });
                    } catch {
                        rej();
                    }
                };
                window.addEventListener('message', listener, false);

                console.log({ id, ...request });
                iframe.contentWindow?.postMessage(JSON.stringify({ id, ...request }), '*');
            }),
    );
};

const trackHarProcess = (har: Har) => sandboxExecute<(AnnotatedTrackHarResult | undefined)[]>('trackhar', { har });
const reportHarGenerate = (options: ReportHarGenerateOptions) =>
    sandboxExecute<string>('reporthar', { options }).then((res) => ({
        // TypeScript doesn't know about `fromBase64()` yet.
        result: (
            Uint8Array as Uint8ArrayConstructor & { fromBase64: (str: string) => Uint8Array<ArrayBufferLike> }
        ).fromBase64(res.result),
    }));

addBackgroundMessageListener((message) => {
    if (message.type === 'startAnalysis') {
        if (message.analysisType === 'second') {
            getProceeding(message.reference).then((proceedingMeta) => analyzeWebsite(proceedingMeta, 'second'));
            return Promise.resolve({ reference: message.reference });
        }

        const now = new Date();
        const reference = generateReference(now);

        const proceedingMeta: ProceedingMeta = {
            reference,
            siteUrl: message.siteUrl,
            startedAt: now.toISOString(),
        };

        analyzeWebsite(proceedingMeta, 'initial');
        return createProceeding(proceedingMeta).then(() => ({ reference }));
    } else if (message.type === 'trackHarProcess') return trackHarProcess(message.har);
    else if (message.type === 'reportHarGenerate') return reportHarGenerate(message.options);

    return false;
});

browser.action.onClicked.addListener(() => {
    // We cannot rely on this permission being set on install, because browsers treat `host_permissions` as optional since Manifest V3 (see https://blog.mozilla.org/addons/2022/11/17/unified-extensions-button-and-how-to-handle-permissions-in-manifest-v3/).
    // Also, this cannot be async, because this destroys the required "user action" context (see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/User_actions).
    browser.permissions.request({ origins: ['<all_urls>'] }).then(async (success) => {
        if (!success) throw new Error('Missing permissions');

        browser.tabs.create({ url: '/ui.html' });
    });
});
