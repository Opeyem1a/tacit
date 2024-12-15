interface StripeTestCard {
    number: `${number} ${number} ${number} ${number}`;
    cvc: `${number}`;
    expMonth: `${number}`;
    expYear: `${number}`;
    fullName: string;
}

// basic Stripe test cards from https://docs.stripe.com/testing?testing-method=card-numbers
export const STRIPE_TEST_CARDS = {
    visa: {
        number: '4242 4242 4242 4242',
        cvc: '123',
        // fixme: this expiry date could be smarter
        expMonth: '12',
        expYear: '34',
        fullName: 'Test Tester',
    },
} satisfies Record<string, StripeTestCard>;
