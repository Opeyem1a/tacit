import { TriggeredAction } from './actions';

export const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getCurrentTabId = async (): Promise<number> => {
    const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
    });

    const currentTab = tabs[0];
    if (!currentTab) {
        throw new Error('[tacit] No current tab detected');
    }

    // fixme: @unsafe - 'as'
    return currentTab.id as number;
};

export const typed = <T>(value: T) => {
    return value;
};

export const sortActions = (
    actions: readonly TriggeredAction[]
): readonly TriggeredAction[] => {
    // fixme: what about .toSorted() ?
    return [...actions].sort(function ({ priority: a }, { priority: b }) {
        /**
         * Always sort null priorities to the beginning of the list
         * i.e. [null, null, 0, 1, 10000, -100, -1, null] becomes [ null, null, null, -100, -1, 0, 1, 10000 ]
         */
        if (a === null) return -1;
        if (b === null) return 1;
        return a - b;
    });
};

export const formatJsonString = (data: object) => {
    return JSON.stringify(data, undefined, 2);
};
