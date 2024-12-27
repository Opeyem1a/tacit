import {
    assertActionCheckboxIsValid,
    assertActionClickIsValid,
    assertActionInputIsValid,
    assertActionIsObject,
    assertActionKindIsValid,
    assertActionPriorityIsValid,
    assertActionSelectIsValid,
} from './assertions';

export interface TriggeredInput {
    selector: string;
    value: string;
}

export interface TriggeredSelection {
    // selector for the <select /> itself
    selector: string;
    value: string;
}

export interface TriggeredCheckbox {
    selector: string;
    checked: boolean;
}

export interface TriggeredClick {
    selector: string;
    delayMs: number | null;
}

export type BaseAction = { kind: string; priority: number | null };
/**
 * priority - must be a positive integer
 */
export type TriggeredAction = BaseAction &
    (
        | ({ kind: 'input' } & TriggeredInput)
        | ({ kind: 'select' } & TriggeredSelection)
        | ({ kind: 'click' } & TriggeredClick)
        | ({ kind: 'checkbox' } & TriggeredCheckbox)
    );
export type KindOfAction = TriggeredAction['kind'];

/**
 * This should be the entire list of possible options (used in validation)
 */
export const ACTION_KINDS: KindOfAction[] = [
    'input',
    'select',
    'click',
    'checkbox',
];

const FAKE_DATA = {
    address1: '123 Fake Street',
    address2: 'Unit 456',
    city: 'Calgary',
    zone: 'AB',
    countryCode: 'CA',
    postalCode: 'T2G 0X7', // fixme: just a random postal code
    firstName: 'Test',
    lastName: 'Testerson',
    baseEmail: 'test@test.com',
    creditCardNumber: '4242 4242 4242 4242',
    creditCardCvc: '123',
    creditCardExpMonth: '12', // fixme: this expiry date could be smarter
    creditCardExpYear: '34',
};

export const ACTIONS: readonly TriggeredAction[] = [
    {
        kind: 'input',
        priority: 1,
        selector: "input[autocomplete='cc-number']",
        value: FAKE_DATA.creditCardNumber,
    },
    {
        kind: 'input',
        priority: 1,
        selector: "input[autocomplete='cc-exp']",
        value: `${FAKE_DATA.creditCardExpMonth} / ${FAKE_DATA.creditCardExpYear}`,
    },
    {
        kind: 'input',
        priority: 1,
        selector: "input[autocomplete='cc-csc']",
        value: FAKE_DATA.creditCardCvc,
    },
    {
        kind: 'input',
        priority: 1,
        selector: "input[autocomplete='cc-name']",
        value: `${FAKE_DATA.firstName} ${FAKE_DATA.lastName}`,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            "input[autocomplete='shipping email'], input[autocomplete='billing email']",
        value: FAKE_DATA.baseEmail, // fixme: make this change?
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            "input[autocomplete='shipping given-name'], input[autocomplete='billing given-name']",
        value: FAKE_DATA.firstName,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            "input[autocomplete='shipping family-name'], input[autocomplete='billing family-name']",
        value: FAKE_DATA.lastName,
    },
    {
        kind: 'input',
        priority: 1,
        selector: 'input#shipping-address1, input#billing-address1',
        value: FAKE_DATA.address1,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            "input[autocomplete='shipping address-line2'], input[autocomplete='billing address-line2']",
        value: FAKE_DATA.address2,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            "input[autocomplete='shipping address-level2'], input[autocomplete='billing address-level2']",
        value: FAKE_DATA.city,
    },
    {
        kind: 'input',
        priority: 1,
        selector:
            "input[autocomplete='shipping postal-code'], input[autocomplete='billing postal-code']",
        value: FAKE_DATA.postalCode,
    },
    {
        kind: 'select',
        priority: 0,
        selector:
            "select[autocomplete='shipping country'], select[autocomplete='billing country']",
        value: FAKE_DATA.countryCode,
    },
    {
        kind: 'select',
        priority: 1,
        selector:
            "select[autocomplete='shipping address-level1'], select[autocomplete='billing address-level1']",
        value: FAKE_DATA.zone,
    },
    {
        kind: 'click',
        priority: 2,
        /** On Shopify checkout, it seems to switch between Form1, Form3, Form4, etc.
         *  No pattern for this is obvious, but the discount code input is within
         *  Form0 consistently, so neither clash with it
         *  */
        selector: "form[id^='Form']:not([id='Form0']) button[type='submit']",
        delayMs: 150,
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

type SafeParseResult<T, E> =
    | { success: true; data: T }
    | { success: false; error: E };
export const safeParseAction = (
    _action: unknown
): SafeParseResult<TriggeredAction, string> => {
    try {
        assertActionIsObject(_action);
        assertActionKindIsValid(_action);
        assertActionPriorityIsValid(_action);

        if (_action.kind === 'input') {
            assertActionInputIsValid(_action);
        }

        if (_action.kind === 'select') {
            assertActionSelectIsValid(_action);
        }

        if (_action.kind === 'click') {
            assertActionClickIsValid(_action);
        }

        if (_action.kind === 'checkbox') {
            assertActionCheckboxIsValid(_action);
        }
    } catch (error) {
        console.error(`[tacit] Safe parse error - ${error}`);
        return {
            success: false,
            // @ts-expect-error - it's an error with a message for sure
            error: String(error.message),
        };
    }

    return {
        success: true,
        /**
         * @unsafe 'as'
         */
        data: _action as TriggeredAction,
    };
};
