import { COMMANDS, MESSAGE_KEYS } from './src/common/constants';
import { getCurrentTab } from './src/core/utils';

browser.commands.onCommand.addListener(async (command) => {
    if (command === COMMANDS.RUN) {
        const currentTab = await getCurrentTab();
        await browser.tabs.sendMessage(currentTab.id, {
            key: MESSAGE_KEYS.RUN,
        });
        await browser.tabs.sendMessage(currentTab.id, {
            key: MESSAGE_KEYS.TOAST_RUNNING,
        });
    }
});

browser.runtime.onMessage.addListener(async (message) => {
    if (message.key === MESSAGE_KEYS.TOAST_SHOULD_UPDATE) {
        const currentTab = await getCurrentTab();
        await browser.tabs.sendMessage(currentTab.id, {
            key: MESSAGE_KEYS.TOAST_WILL_UPDATE,
            progress: message.progress,
        });
    }
});
