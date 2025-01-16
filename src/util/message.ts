export type ExtensionMessageType = 'startAnalysis' | 'analysisEvent';

export type ExtensionMessageParams = {
    startAnalysis: {
        type: 'startAnalysis';
        siteUrl: string;
    };

    analysisEvent: {
        type: 'analysisEvent';
        reference: string;

        event: never;
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
