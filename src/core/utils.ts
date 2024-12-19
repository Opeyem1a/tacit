export const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getCurrentTab = async () => {
    const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
    });

    const currentTab = tabs[0];
    if (!currentTab) {
        console.warn('[tacit] No current tab detected');
    }

    return currentTab;
};
