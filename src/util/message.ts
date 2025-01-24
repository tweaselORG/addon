import { type Har } from 'har-format';
import { type AnnotatedResult as AnnotatedTrackHarResult } from 'trackhar';

export type ExtensionMessageType = keyof ExtensionMessageParams;

export type ExtensionMessageParams = {
    startAnalysis: {
        siteUrl: string;
    };
    endInteractionAnalysis: {
        reference: string;
    };
    trackHarProcess: {
        har: Har;
    };

    analysisEvent: {
        reference: string;

        event: {
            type: 'no-interaction-completed' | 'interaction-completed';
            har: Har;
            trackHarResult: (AnnotatedTrackHarResult | undefined)[];
        };
    };
};
export type ExtensionMessageReturnValues = {
    startAnalysis: {
        reference: string;
    };
    endInteractionAnalysis: never;
    trackHarProcess: {
        result: (AnnotatedTrackHarResult | undefined)[];
    };

    analysisEvent: never;
};

export type ExtensionMessage = {
    [Type in keyof ExtensionMessageParams]: {
        type: Type;
    } & ExtensionMessageParams[Type];
}[keyof ExtensionMessageParams];

/** Wrapper of `browser.runtime.sendMessage` to enforce types. */
export const sendBackgroundMessage = <Type extends ExtensionMessageType>(
    type: Type,
    message: ExtensionMessageParams[Type],
): Promise<ExtensionMessageReturnValues[Type]> => browser.runtime.sendMessage({ type, ...message });

export const addBackgroundMessageListener = (
    listener: (message: ExtensionMessage) => boolean | void | Promise<any>,
) => {
    const listenerWrapper = (message: ExtensionMessage, sender: browser.runtime.MessageSender) => {
        // We do not accept external messages.
        if (sender.id !== browser.runtime.id) return false;

        return listener(message);
    };

    browser.runtime.onMessage.addListener(listenerWrapper);

    return () => browser.runtime.onMessage.removeListener(listenerWrapper);
};

export const awaitBackgroundMessage = (condition: (message: ExtensionMessage) => boolean | Promise<boolean>) => {
    return new Promise<ExtensionMessage>((resolve) => {
        const cleanup = addBackgroundMessageListener(async (message: ExtensionMessage) => {
            if (await condition(message)) {
                resolve(message);
                cleanup();
                return true;
            }

            return false;
        });
    });
};
