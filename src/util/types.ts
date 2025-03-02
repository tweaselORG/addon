import type { TweaselHar } from 'reporthar';
import { type AnnotatedResult as AnnotatedTrackHarResult } from 'trackhar';
import { type RequireAllOrNone } from 'type-fest';

export type AnalysisType = 'initial' | 'second';
export type AnalysisConsentAnswer = 'not-asked' | 'given' | 'ignored' | 'refused' | 'not-sure';

export type AnalysisStepResult = {
    har: TweaselHar;
    trackHarResult: (AnnotatedTrackHarResult | undefined)[];
};

export type ProceedingMetaBase = {
    reference: string;
    siteUrl: string;
    startedAt: string;

    initialInteractionConsent?: AnalysisConsentAnswer;
    secondInteractionConsent?: AnalysisConsentAnswer;

    controllerResponse?: 'promise' | 'denial' | 'none';

    complainantIsUserOfWebsite?: boolean;
    complaintType?: 'formal' | 'informal';
    controllerName?: string;
    controllerAddress?: string;
    controllerDetailsSourceUrl?: string;
    complaintAuthority?: string;
    complaintSent?: Date;
} & RequireAllOrNone<{
    noticeSent?: Date;
    controllerResponseDeadline?: Date;
}>;
export type ProceedingMetaResults = {
    initialNoInteractionResult?: AnalysisStepResult;
    initialInteractionResult?: AnalysisStepResult;
    secondNoInteractionResult?: AnalysisStepResult;
    secondInteractionResult?: AnalysisStepResult;
};
export type ProceedingMeta = ProceedingMetaBase & ProceedingMetaResults;
