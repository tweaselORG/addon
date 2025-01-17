import { type Har } from 'har-format';

export type ExtensionMessageType = 'startAnalysis' | 'analysisEvent';

export type ExtensionMessageParams = {
    startAnalysis: {
        type: 'startAnalysis';
        siteUrl: string;
    };

    analysisEvent: {
        type: 'analysisEvent';
        reference: string;

        event: {
            type: 'no-interaction-completed' | 'interaction-completed';
            har: Har;
        };
    };
};
export type ExtensionMessageReturnValues = {
    startAnalysis: {
        reference: string;
    };

    analysisEvent: never;
};

/** Wrapper of `browser.runtime.sendMessage` to enforce types. */
export const sendBackgroundMessage = <Type extends ExtensionMessageType>(
    message: ExtensionMessageParams[Type],
): Promise<ExtensionMessageReturnValues[Type]> => browser.runtime.sendMessage(message);
