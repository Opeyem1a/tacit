interface Person {
    firstName: string;
    lastName: string;
    baseEmail: string;
}

export const PEOPLE = {
    basic: {
        firstName: 'Test',
        lastName: 'Testerson',
        baseEmail: 'test@test.com',
    },
} satisfies Record<string, Person>;
