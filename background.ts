import { COMMANDS } from './src/common/constants';

browser.commands.onCommand.addListener(async (command) => {
    if (command === COMMANDS.RUN) {
        const tabs = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });

        const currentTab = tabs[0];
        if (!currentTab) {
            console.warn('[tacit] No current tab detected');
        }

        await browser.tabs.sendMessage(currentTab.id, {
            command: COMMANDS.RUN,
        });
        await browser.tabs.sendMessage(currentTab.id, {
            command: COMMANDS.TOAST_RUNNING,
        });
    }
});
