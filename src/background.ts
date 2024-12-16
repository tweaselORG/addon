import type { Entry } from 'har-format';

browser.runtime.onInstalled.addListener(async () => {
    console.log('Installed!');
});

browser.action.onClicked.addListener(() => browser.tabs.create({ url: '/ui.html' }));

browser.runtime.onMessage.addListener((request, sender) => {
    console.log(12, request, sender);

    return false;
});

type TabId = number;
const requests: Record<TabId, browser.webRequest._OnBeforeRequestDetails[]> = {};
const entries: Record<TabId, Entry[]> = {};

browser.action.onClicked.addListener(() => {
    // We cannot rely on this permission being set on install, because browsers treat `host_permissions` as optional since Manifest V3 (see https://blog.mozilla.org/addons/2022/11/17/unified-extensions-button-and-how-to-handle-permissions-in-manifest-v3/).
    // Also, this cannot be async, because this is destroys the required "user action" context (see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/User_actions).
    browser.permissions.request({ origins: ['<all_urls>'] }).then(async (success) => {
        if (!success) throw new Error('Missing permissions');

        browser.webRequest.onBeforeRequest.addListener(
            (requestDetails) => {
                const tabId = requestDetails.tabId;
                requests[tabId] = requests[tabId] ? [...requests[tabId], requestDetails] : [requestDetails];
            },
            { urls: ['<all_urls>'] },
            ['requestBody'],
        );

        console.log(requests);

        const currentTab = await browser.tabs.getCurrent();
        if (currentTab?.id) requests[currentTab.id] = [];

        browser.tabs.reload();
    });
});

browser.tabs.onRemoved.addListener((tabID) => {
    delete requests[tabID];

    console.log('Removed', tabID, requests);
});
