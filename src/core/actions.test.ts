import { describe, expect, test } from 'vitest';
import { ACTIONS, safeParseAction } from './actions';

describe('default actions have been configured properly', () => {
    test('all default actions are valid', () => {
        expect(
            ACTIONS.map((action) => safeParseAction(action).success).every(
                (result) => result
            )
        ).to.equal(true);
    });
});

describe('safe parsing actions behaves expectedly', () => {
    test('Invalid actions are handled', () => {
        expect(safeParseAction({}).success).to.equal(false);
        expect(safeParseAction({})).to.haveOwnProperty('error');
    });

    test('Valid actions are handled', () => {
        const action1 = {
            kind: 'input',
            priority: null,
            selector: 'input',
            value: '',
        };
        expect(safeParseAction(action1).success).to.equal(true);
        expect(safeParseAction(action1)).to.haveOwnProperty('data');
        expect(safeParseAction(action1)['data']).to.deep.equal(action1);
    });

    test('A basic example of each kind of action will be safely parsed', () => {
        expect(
            safeParseAction({
                kind: 'input',
                priority: null,
                selector: 'input#search',
                value: 'Some text',
            }).success
        ).to.equal(true);

        expect(
            safeParseAction({
                kind: 'select',
                priority: null,
                selector: 'select#dropdown',
                value: 'VALUE',
            }).success
        ).to.equal(true);

        expect(
            safeParseAction({
                kind: 'click',
                priority: null,
                selector: 'button#complete',
                delayMs: 150,
            }).success
        ).to.equal(true);

        expect(
            safeParseAction({
                kind: 'checkbox',
                priority: null,
                selector: 'input#auto',
                checked: true,
            }).success
        ).to.equal(true);
    });
});
