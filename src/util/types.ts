import { type Har } from 'har-format';
import { type AnnotatedResult as AnnotatedTrackHarResult } from 'trackhar';

export type AnalysisStepResult = {
    har: Har;
    trackHarResult: (AnnotatedTrackHarResult | undefined)[];
};

export type ProceedingMeta = {
    reference: string;
    siteUrl: string;
    startedAt: string;

    noInteractionResult?: AnalysisStepResult;
    interactionResult?: AnalysisStepResult;
};
