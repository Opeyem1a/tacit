import { describe, expect, test } from 'vitest';
import {
    assertActionCheckboxIsValid,
    assertActionClickIsValid,
    assertActionInputIsValid,
    assertActionIsObject,
    assertActionKeyCheckedIsValid,
    assertActionKeyDelayMsIsValid,
    assertActionKeySelectorIsValid,
    assertActionKeyValueIsValid,
    assertActionKindIsValid,
    assertActionPriorityIsValid,
    assertActionSelectIsValid,
} from './assertions';
import { ACTION_KINDS, BaseAction } from './actions';

describe('action assertions validate properly', () => {
    test('assertActionIsObject', () => {
        expect(() => assertActionIsObject(100)).to.throw();
        expect(() => assertActionIsObject('string')).to.throw();
        expect(() => assertActionIsObject(true)).to.throw();

        expect(() => assertActionIsObject({})).to.not.throw();
        expect(() => assertActionIsObject({ a: 1 })).to.not.throw();
    });

    test('assertActionKindIsValid', () => {
        expect(() => assertActionKindIsValid({})).to.throw();
        expect(() => assertActionKindIsValid({ kind: 100 })).to.throw();
        expect(() => assertActionKindIsValid({ kind: true })).to.throw();
        expect(() => assertActionKindIsValid({ kind: 'string' })).to.throw();
        expect(() => assertActionKindIsValid({ kind: {} })).to.throw();

        expect(() => {
            ACTION_KINDS.forEach((kind) => {
                assertActionKindIsValid({ kind });
            });
        }).to.not.throw();
    });

    test('assertActionPriorityIsValid', () => {
        expect(() => assertActionPriorityIsValid({})).to.throw();
        expect(() =>
            assertActionPriorityIsValid({ priority: true })
        ).to.throw();
        expect(() =>
            assertActionPriorityIsValid({ priority: 'string' })
        ).to.throw();
        expect(() => assertActionPriorityIsValid({ priority: {} })).to.throw();
        expect(() => assertActionPriorityIsValid({ priority: -1 })).to.throw();
        expect(() => assertActionPriorityIsValid({ priority: 101 })).to.throw();
        expect(() =>
            assertActionPriorityIsValid({ priority: 1000 })
        ).to.throw();

        expect(() =>
            assertActionPriorityIsValid({ priority: 0 })
        ).to.not.throw();
        expect(() =>
            assertActionPriorityIsValid({ priority: 1 })
        ).to.not.throw();
        expect(() =>
            assertActionPriorityIsValid({ priority: 100 })
        ).to.not.throw();
    });

    test('assertActionKeySelectorIsValid', () => {
        expect(() => assertActionKeySelectorIsValid({})).to.throw();
        expect(() =>
            assertActionKeySelectorIsValid({ anythingElse: 1 })
        ).to.throw();
        expect(() =>
            assertActionKeySelectorIsValid({ selector: 1 })
        ).to.throw();
        expect(() =>
            assertActionKeySelectorIsValid({ selector: true })
        ).to.throw();
        expect(() =>
            assertActionKeySelectorIsValid({ selector: {} })
        ).to.throw();

        expect(() =>
            assertActionKeySelectorIsValid({
                selector: 'string',
            })
        ).to.not.throw();
        expect(() =>
            assertActionKeySelectorIsValid({
                selector: 'string',
                extraProperty: 'anything',
            })
        ).to.not.throw();
    });

    test('assertActionKeyValueIsValid', () => {
        expect(() => assertActionKeyValueIsValid({})).to.throw();
        expect(() =>
            assertActionKeyValueIsValid({ anythingElse: 1 })
        ).to.throw();
        expect(() => assertActionKeyValueIsValid({ value: 1 })).to.throw();
        expect(() => assertActionKeyValueIsValid({ value: true })).to.throw();
        expect(() => assertActionKeyValueIsValid({ value: {} })).to.throw();

        expect(() =>
            assertActionKeyValueIsValid({
                value: 'string',
            })
        ).to.not.throw();
        expect(() =>
            assertActionKeyValueIsValid({
                value: 'string',
                extraProperty: 'anything',
            })
        ).to.not.throw();
    });

    test('assertActionKeyDelayMsIsValid', () => {
        expect(() => assertActionKeyDelayMsIsValid({})).to.throw();
        expect(() =>
            assertActionKeyDelayMsIsValid({ anythingElse: 1 })
        ).to.throw();
        expect(() => assertActionKeyDelayMsIsValid({ delayMs: -1 })).to.throw();
        expect(() =>
            assertActionKeyDelayMsIsValid({ delayMs: 2001 })
        ).to.throw();
        expect(() =>
            assertActionKeyDelayMsIsValid({ delayMs: true })
        ).to.throw();
        expect(() => assertActionKeyDelayMsIsValid({ delayMs: {} })).to.throw();

        expect(() =>
            assertActionKeyDelayMsIsValid({
                delayMs: null,
            })
        ).to.not.throw();
        expect(() =>
            assertActionKeyDelayMsIsValid({
                delayMs: 100,
            })
        ).to.not.throw();
        expect(() =>
            assertActionKeyDelayMsIsValid({
                delayMs: 0,
            })
        ).to.not.throw();
        expect(() =>
            assertActionKeyDelayMsIsValid({
                delayMs: 0,
                extraProperty: 'anything',
            })
        ).to.not.throw();
    });

    test('assertActionKeyCheckedIsValid', () => {
        expect(() => assertActionKeyCheckedIsValid({})).to.throw();
        expect(() =>
            assertActionKeyCheckedIsValid({ anythingElse: 1 })
        ).to.throw();
        expect(() => assertActionKeyCheckedIsValid({ checked: 1 })).to.throw();
        expect(() =>
            assertActionKeyCheckedIsValid({ checked: 'string' })
        ).to.throw();
        expect(() => assertActionKeyCheckedIsValid({ checked: {} })).to.throw();

        expect(() =>
            assertActionKeyCheckedIsValid({
                checked: true,
            })
        ).to.not.throw();
        expect(() =>
            assertActionKeyCheckedIsValid({
                checked: true,
                extraProperty: 'anything',
            })
        ).to.not.throw();
    });

    test('assertActionInputIsValid', () => {
        expect(() =>
            assertActionInputIsValid({
                kind: 'input',
                priority: 1,
                selector: '',
                value: '',
            } as BaseAction)
        ).to.not.throw();
        expect(() =>
            assertActionInputIsValid({
                kind: 'input',
                priority: 1,
                selector: '',
                value: '',
                extraProperty: 'anything',
            } as BaseAction)
        ).to.not.throw();
    });

    test('assertActionSelectIsValid', () => {
        expect(() =>
            assertActionSelectIsValid({
                kind: 'select',
                priority: 1,
                selector: '',
                value: '',
            } as BaseAction)
        ).to.not.throw();
        expect(() =>
            assertActionSelectIsValid({
                kind: 'select',
                priority: 1,
                selector: '',
                value: '',
                extraProperty: 'anything',
            } as BaseAction)
        ).to.not.throw();
    });

    test('assertActionCheckboxIsValid', () => {
        expect(() =>
            assertActionCheckboxIsValid({
                kind: 'checkbox',
                priority: 1,
                selector: '',
                checked: true,
            } as BaseAction)
        ).to.not.throw();
        expect(() =>
            assertActionCheckboxIsValid({
                kind: 'checkbox',
                priority: 1,
                selector: '',
                checked: true,
                extraProperty: 'anything',
            } as BaseAction)
        ).to.not.throw();
    });

    test('assertActionClickIsValid', () => {
        expect(() =>
            assertActionClickIsValid({
                kind: 'click',
                priority: 1,
                selector: '',
                delayMs: null,
            } as BaseAction)
        ).to.not.throw();
        expect(() =>
            assertActionClickIsValid({
                kind: 'click',
                priority: 1,
                selector: '',
                delayMs: 100,
            } as BaseAction)
        ).to.not.throw();
        expect(() =>
            assertActionClickIsValid({
                kind: 'click',
                priority: 1,
                selector: '',
                delayMs: 100,
                extraProperty: 'anything',
            } as BaseAction)
        ).to.not.throw();
    });
});
