import { delay, sortActions } from './utils';
import {
    ACTIONS,
    KindOfAction,
    TriggeredAction,
    TriggeredCheckbox,
    TriggeredClick,
    TriggeredInput,
    TriggeredSelection,
} from './actions';

export const tacit = async ({
    updateProgress,
}: {
    updateProgress: (args: {
        complete: number;
        total: number;
    }) => Promise<void>;
}) => {
    const sortedActions: readonly TriggeredAction[] = sortActions(ACTIONS);

    const afterAction = async (completedActionCount: number) => {
        await updateProgress({
            complete: completedActionCount,
            total: sortedActions.length,
        });
        await delay(15);
    };

    let completedActionCount = 0;
    for (const action of sortedActions) {
        try {
            const elements = document.querySelectorAll<HTMLElement>(
                action.selector
            );

            if (elements.length === 0) {
                console.warn('[tacit] No element matches for rule:', action);
                await afterAction(++completedActionCount);
                continue;
            }

            for (const element of elements) {
                handleAction({
                    kind: action.kind,
                    action,
                    element,
                } as HandleActionArgs);
            }
            await afterAction(++completedActionCount);
        } catch (error) {
            console.error(`[tacit] Error: ${error}`);
        }
    }
};

type HandleActionArgs = { kind: KindOfAction } & (
    | {
          kind: 'input';
          element: HTMLInputElement;
          action: TriggeredInput;
      }
    | {
          kind: 'select';
          element: HTMLSelectElement;
          action: TriggeredSelection;
      }
    | {
          kind: 'click';
          element: HTMLElement;
          action: TriggeredClick;
      }
    | {
          kind: 'checkbox';
          element: HTMLInputElement;
          action: TriggeredCheckbox;
      }
);

const handleAction = (params: HandleActionArgs) => {
    if (params.kind === 'input') {
        handleInput({ element: params.element, value: params.action.value });
        return;
    }

    if (params.kind === 'select') {
        const optionElement = params.element.querySelector<HTMLOptionElement>(
            `option[value="${params.action.value}"]`
        );
        if (!optionElement) {
            console.warn(
                `[tacit] Could not find select option matching the value "${params.action.value}", skipping action`
            );
            return;
        }
        handleSelection({ selectElement: params.element, optionElement });
        return;
    }

    if (params.kind === 'click') {
        handleClick({
            element: params.element,
            delayMs: params.action.delayMs,
        });
        return;
    }

    if (params.kind === 'checkbox') {
        handleCheckbox({
            element: params.element,
            checked: params.action.checked,
        });
        return;
    }
};

const handleInput = ({
    element,
    value,
}: {
    element: HTMLInputElement;
    value: string;
}) => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
};

const handleSelection = ({
    selectElement,
    optionElement,
}: {
    selectElement: HTMLSelectElement;
    optionElement: HTMLOptionElement;
}) => {
    optionElement.click();
    selectElement.value = optionElement.value;
    selectElement.dispatchEvent(new Event('input', { bubbles: true }));
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
};

const handleClick = ({
    element,
    delayMs,
}: {
    element: HTMLElement;
    delayMs: number | null;
}) => {
    if (delayMs !== null) {
        delay(delayMs).then(() => element.click());
        return;
    }
    element.click();
};

const handleCheckbox = ({
    element,
    checked,
}: {
    element: HTMLInputElement;
    checked: boolean;
}) => {
    element.checked = checked;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
};
