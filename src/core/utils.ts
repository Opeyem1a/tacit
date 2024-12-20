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

    // fixme: @dark - 'as'
    return currentTab.id as number;
};

export const typed = <T>(value: T) => {
    return value;
};
