import { STRIPE_TEST_CARDS } from './data/stripe-test-cards';
import { PEOPLE } from './data/people';
import { ADDRESSES } from './data/addresses';
import { delay } from './utils';

export const tacit = async () => {
    // todo: these are readonly, it might matter
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

    for (const action of sortedActions) {
        const elements = document.querySelectorAll<HTMLElement>(
            action.selector
        );

        console.log(action.selector, elements);

        if (elements.length === 0) {
            console.warn('[tacit] No element matches for rule:', action);
            continue;
        }

        for (const element of elements) {
            handleAction({ action, element });
        }
        // small delay to avoid tripping on itself
        await delay(23);
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

interface TriggeredClick {
    selector: string;
}

const ACTIONS: TriggeredAction[] = [
    {
        kind: 'input',
        priority: 1,
        selector: `input[autocomplete="cc-number"]`,
        value: STRIPE_TEST_CARDS.visa.number,
    },
    {
        kind: 'input',
        priority: 1,
        selector: `input[autocomplete="cc-exp"]`,
        value: `${STRIPE_TEST_CARDS.visa.expMonth} / ${STRIPE_TEST_CARDS.visa.expYear}`,
    },
    {
        kind: 'input',
        priority: 1,
        selector: `input[autocomplete="cc-csc"]`,
        value: STRIPE_TEST_CARDS.visa.cvc,
    },
    {
        kind: 'input',
        priority: 1,
        selector: `input[autocomplete="cc-name"]`,
        value: STRIPE_TEST_CARDS.visa.fullName,
    },
    {
        kind: 'input',
        priority: 1,
        selector: `input[autocomplete="shipping email"]`,
        value: PEOPLE.basic.baseEmail,
    },
    {
        kind: 'input',
        priority: 1,
        selector: `input[autocomplete="shipping given-name"]`,
        value: PEOPLE.basic.firstName,
    },
    {
        kind: 'input',
        priority: 1,
        selector: `input[autocomplete="shipping family-name"]`,
        value: PEOPLE.basic.lastName,
    },
    {
        kind: 'input',
        priority: 1,
        selector: `input#shipping-address1`,
        value: ADDRESSES.basic.address1,
    },
    {
        kind: 'input',
        priority: 1,
        selector: `input[autocomplete="shipping address-line2"]`,
        value: ADDRESSES.basic.address2,
    },
    {
        kind: 'input',
        priority: 1,
        selector: `input[autocomplete="shipping address-level2"]`,
        value: ADDRESSES.basic.city,
    },
    {
        kind: 'input',
        priority: 1,
        selector: `input[autocomplete="shipping postal-code"]`,
        value: ADDRESSES.basic.postalCode,
    },
    {
        kind: 'select',
        priority: 0,
        selector: 'select[autocomplete="shipping country"]',
        value: 'CA',
    },
    {
        kind: 'select',
        priority: 1,
        selector: 'select[autocomplete="shipping address-level1"]',
        value: 'AB',
    },
    {
        kind: 'click',
        priority: 2,
        /** On Shopify checkout, it seems to switch between Form1 and Form3,
         *  no pattern for this is obvious, but the discount code input is within
         *  Form0 consistently, so neither clash with it
         *  */
        selector:
            'form#Form1 button[type="submit"], form#Form3 button[type="submit"]',
    },
    {
        kind: 'click',
        priority: 1,
        selector: 'input#RememberMe-RememberMeCheckbox',
    },
];

/**
 * priority - must be a positive integer
 */
type TriggeredAction = { kind: string; priority: number | null } & (
    | ({ kind: 'input' } & TriggeredInput)
    | ({ kind: 'select' } & TriggeredSelection)
    | ({ kind: 'click' } & TriggeredClick)
);
type KindOfAction = TriggeredAction['kind'];

// todo: find some better solution
type HandleActionArgs = { kind: KindOfAction } & (
    | {
          element: HTMLInputElement;
          action: TriggeredInput;
      }
    | {
          element: HTMLSelectElement;
          action: TriggeredSelection;
      }
    | {
          element: HTMLElement;
          action: TriggeredClick;
      }
);

const handleAction = <T extends HTMLElement>({
    action,
    element,
}: {
    action: TriggeredAction;
    element: T;
}) => {
    if (action.kind === 'input') {
        fillInput({ element, value: action.value });
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
        selectOption({ selectElement: element, optionElement });
        return;
    }

    if (action.kind === 'click') {
        console.log('CLICK', element);
        element.click();
        return;
    }
};

const fillInput = ({
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

const selectOption = ({
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
