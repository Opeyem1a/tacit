import { COMMANDS, TacitMessage } from './src/common/constants';
import { getCurrentTabId, typed } from './src/core/utils';

browser.commands.onCommand.addListener(async (command) => {
    if (command === COMMANDS.RUN) {
        const currentTab = await getCurrentTabId();

        await browser.tabs.sendMessage(
            currentTab,
            typed<TacitMessage>({ key: 'START' })
        );

        await browser.tabs.sendMessage(
            currentTab,
            typed<TacitMessage>({ key: 'TOAST_SHOW' })
        );
    }
});

browser.runtime.onMessage.addListener(async (message: TacitMessage) => {
    if (message.key === 'TOAST_UPDATE_INTENT') {
        const currentTab = await getCurrentTabId();
        await browser.tabs.sendMessage(
            currentTab,
            typed<TacitMessage>({
                key: 'TOAST_UPDATE',
                progress: message.progress,
                frame: message.frame,
            })
        );
    }
});
