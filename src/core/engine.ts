import { STRIPE_TEST_CARDS } from './data/stripe-test-cards';
import { PEOPLE } from './data/people';
import { ADDRESSES } from './data/addresses';
import { delay } from './utils';

export const tacit = async ({
    updateProgress,
}: {
    updateProgress: (args: {
        complete: number;
        total: number;
    }) => Promise<void>;
}) => {
    // todo: these are readonly, it might matter
    // todo: actions can be defined elsewhere
    const sortedActions = [...ACTIONS].sort(function (
        { priority: a },
        { priority: b }
    ) {
        /**
         * Always sort null priorities to the beginning of the list
         * i.e. [null, null, 0, 1, 10000, -100, -1, null] becomes [ null, null, null, -100, -1, 0, 1, 10000 ]
         */
        if (a === null) return -1;
        if (b === null) return 1;
        return a - b;
    });

    const afterAction = async (completedActionCount: number) => {
        await updateProgress({
            complete: completedActionCount,
            total: sortedActions.length,
        });
        await delay(25);
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
                handleAction({ action, element });
            }
            await afterAction(++completedActionCount);
        } catch (error) {
            console.error(`[tacit] Error: ${error}`);
        }
    }
};

interface TriggeredInput {
    selector: string;
    value: string;
}

interface TriggeredSelection {
    // selector for the <select /> itself
    selector: string;
    value: string;
}

interface TriggeredCheckbox {
    selector: string;
    checked: boolean;
}

interface TriggeredClick {
    selector: string;
    delayMs: number | null;
}

const ACTIONS: TriggeredAction[] = [
    {
        kind: 'input',
        priority: 1,
        selector: 'input[autocomplete="cc-number"]',
        value: STRIPE_TEST_CARDS.visa.number,
    },
    {
        kind: 'input',
        priority: 1,
        selector: 'input[autocomplete="cc-exp"]',
        value: `${STRIPE_TEST_CARDS.visa.expMonth} / ${STRIPE_TEST_CARDS.visa.expYear}`,
    },
    {
        kind: 'input',
        priority: 1,
        selector: 'input[autocomplete="cc-csc"]',
        value: STRIPE_TEST_CARDS.visa.cvc,
    },
    {
        kind: 'input',
        priority: 1,
        selector: 'input[autocomplete="cc-name"]',
        value: STRIPE_TEST_CARDS.visa.fullName,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            'input[autocomplete="shipping email"], input[autocomplete="billing email"]',
        value: PEOPLE.basic.baseEmail,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            'input[autocomplete="shipping given-name"], input[autocomplete="billing given-name"]',
        value: PEOPLE.basic.firstName,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            'input[autocomplete="shipping family-name"], input[autocomplete="billing family-name"]',
        value: PEOPLE.basic.lastName,
    },
    {
        kind: 'input',
        priority: 1,
        selector: 'input#shipping-address1, input#billing-address1',
        value: ADDRESSES.basic.address1,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            'input[autocomplete="shipping address-line2"], input[autocomplete="billing address-line2"]',
        value: ADDRESSES.basic.address2,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            'input[autocomplete="shipping address-level2"], input[autocomplete="billing address-level2"]',
        value: ADDRESSES.basic.city,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            'input[autocomplete="shipping postal-code"], input[autocomplete="billing postal-code"]',
        value: ADDRESSES.basic.postalCode,
    },
    {
        kind: 'select',
        priority: 0,
        selector:
            'select[autocomplete="shipping country"], select[autocomplete="billing country"]',
        value: 'CA',
    },
    {
        kind: 'select',
        priority: 1,
        selector:
            'select[autocomplete="shipping address-level1"], select[autocomplete="billing address-level1"]',
        value: 'AB',
    },
    {
        kind: 'click',
        priority: 2,
        /** On Shopify checkout, it seems to switch between Form1, Form3, Form4, etc.
         *  No pattern for this is obvious, but the discount code input is within
         *  Form0 consistently, so neither clash with it
         *  */
        selector: 'form[id^="Form"]:not([id="Form0"]) button[type="submit"]',
        delayMs: 300,
    },
    {
        kind: 'checkbox',
        priority: 0,
        selector: 'input#RememberMe-RememberMeCheckbox',
        checked: false,
    },
    {
        kind: 'click',
        priority: 1,
        selector: 'input#billing_address_selector-shipping',
        delayMs: null,
    },
];

/**
 * priority - must be a positive integer
 */
type TriggeredAction = { kind: string; priority: number | null } & (
    | ({ kind: 'input' } & TriggeredInput)
    | ({ kind: 'select' } & TriggeredSelection)
    | ({ kind: 'click' } & TriggeredClick)
    | ({ kind: 'checkbox' } & TriggeredCheckbox)
);
// type KindOfAction = TriggeredAction['kind'];

// todo: find some better solution
// type HandleActionArgs = { kind: KindOfAction } & (
//     | {
//           element: HTMLInputElement;
//           action: TriggeredInput;
//       }
//     | {
//           element: HTMLSelectElement;
//           action: TriggeredSelection;
//       }
//     | {
//           element: HTMLElement;
//           action: TriggeredClick;
//       }
// );

const handleAction = <T extends HTMLElement>({
    action,
    element,
}: {
    action: TriggeredAction;
    element: T;
}) => {
    if (action.kind === 'input') {
        // @ts-expect-error - ignore for now
        handleInput({ element, value: action.value });
        return;
    }

    if (action.kind === 'select') {
        const optionElement = element.querySelector<HTMLOptionElement>(
            `option[value="${action.value}"]`
        );
        if (!optionElement) {
            console.warn(
                `[tacit] Could not find select option matching the value "${action.value}", skipping action`
            );
            return;
        }
        // @ts-expect-error - ignore for now
        handleSelection({ selectElement: element, optionElement });
        return;
    }

    if (action.kind === 'click') {
        handleClick({
            element,
            delayMs: action.delayMs,
        });
        return;
    }

    if (action.kind === 'checkbox') {
        handleCheckbox({
            // @ts-expect-error - ignore for now
            element,
            checked: action.checked,
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
