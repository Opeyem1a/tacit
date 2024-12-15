interface AddressInfo {
    address1: string;
    address2: string;
    city: string;
    // generalization of states/provinces/etc - stole the idea from Shopify
    zone: string;
    postalCode: string;
}

export const ADDRESSES = {
    basic: {
        address1: '123 Fake Street',
        address2: 'Unit 456',
        city: 'Calgary',
        zone: 'AB',
        postalCode: 'T2G 0X7', // fixme: just a random postal code
    },
} satisfies Record<string, AddressInfo>;
