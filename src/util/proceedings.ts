import { type ProceedingMeta, type ProceedingMetaBase } from './types';

export const getProceeding = async (
    reference: string,
    options?: { includeResults?: boolean },
): Promise<ProceedingMeta> => {
    const base = (await browser.storage.local.get('proceeding-meta-' + reference))['proceeding-meta-' + reference];

    if (base.noticeSent) base.noticeSent = new Date(base.noticeSent);

    if (options?.includeResults) {
        return {
            ...base,
            initialNoInteractionResult: (
                await browser.storage.local.get('proceeding-initialNoInteractionResult-' + reference)
            )['proceeding-initialNoInteractionResult-' + reference],
            initialInteractionResult: (
                await browser.storage.local.get('proceeding-initialInteractionResult-' + reference)
            )['proceeding-initialInteractionResult-' + reference],
            secondNoInteractionResult: (
                await browser.storage.local.get('proceeding-secondNoInteractionResult-' + reference)
            )['proceeding-secondNoInteractionResult-' + reference],
            secondInteractionResult: (
                await browser.storage.local.get('proceeding-secondInteractionResult-' + reference)
            )['proceeding-secondInteractionResult-' + reference],
        };
    }

    return base;
};

export const getProceedingReferences = (): Promise<string[]> =>
    browser.storage.local.get('proceedings').then((res) => res['proceedings'] ?? []);

export const getProceedings = async (options?: { includeResults?: boolean }): Promise<ProceedingMeta[]> => {
    const references = await getProceedingReferences();
    return Promise.all(references.map((reference) => getProceeding(reference, options)));
};

export const createProceeding = async (proceedingMeta: ProceedingMetaBase) => {
    await browser.storage.local.set({ ['proceeding-meta-' + proceedingMeta.reference]: proceedingMeta });

    const existingProceedings = await getProceedingReferences();
    await browser.storage.local.set({ proceedings: [proceedingMeta.reference, ...existingProceedings] });
};

export const updateProceeding = async (reference: string, update: Partial<ProceedingMeta>) => {
    const {
        initialNoInteractionResult,
        initialInteractionResult,
        secondNoInteractionResult,
        secondInteractionResult,
        ...base
    } = update;

    if (initialNoInteractionResult)
        await browser.storage.local.set({
            ['proceeding-initialNoInteractionResult-' + reference]: initialNoInteractionResult,
        });

    if (initialInteractionResult)
        await browser.storage.local.set({
            ['proceeding-initialInteractionResult-' + reference]: initialInteractionResult,
        });

    if (secondNoInteractionResult)
        await browser.storage.local.set({
            ['proceeding-secondNoInteractionResult-' + reference]: secondNoInteractionResult,
        });

    if (secondInteractionResult)
        await browser.storage.local.set({
            ['proceeding-secondInteractionResult-' + reference]: secondInteractionResult,
        });

    if (base) {
        const storageKey = 'proceeding-meta-' + reference;
        const existingMeta = (await browser.storage.local.get(storageKey))[storageKey];

        if (base.noticeSent)
            base.controllerResponseDeadline = new Date(base.noticeSent.getTime() + 1000 * 60 * 60 * 24 * 62);

        await browser.storage.local.set({ [storageKey]: { ...existingMeta, ...base } });
    }
};

export const resetSecondAnalysis = async (reference: string) => {
    await browser.storage.local.remove('proceeding-secondNoInteractionResult-' + reference);
    await browser.storage.local.remove('proceeding-secondInteractionResult-' + reference);

    await updateProceeding(reference, { secondInteractionConsent: null as unknown as undefined });
};

export const deleteProceeding = async (reference: string) => {
    const existingProceedings = await getProceedingReferences();
    await browser.storage.local.set({ proceedings: existingProceedings.filter((ref) => ref !== reference) });

    await browser.storage.local.remove('proceeding-meta-' + reference);
    await browser.storage.local.remove('proceeding-initialNoInteractionResult-' + reference);
    await browser.storage.local.remove('proceeding-initialInteractionResult-' + reference);
    await browser.storage.local.remove('proceeding-secondNoInteractionResult-' + reference);
    await browser.storage.local.remove('proceeding-secondInteractionResult-' + reference);
};
