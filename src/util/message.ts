/** This type is used to explicitly type all messages by and to the extension. */
export type ExtensionMessage = {
    type: 'startAnalysis';
    siteUrl: string;
};

/** Wrapper of `browser.runtime.sendMessage` to enforce types. */
export const sendBackgroundMessage = (message: ExtensionMessage) => browser.runtime.sendMessage(message);
