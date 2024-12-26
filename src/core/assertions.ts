import {
    ACTION_KINDS,
    BaseAction,
    KindOfAction,
    TriggeredAction,
} from './actions';

export function assertActionIsObject(
    action: unknown
): asserts action is object {
    if (typeof action !== 'object') {
        throw new Error('Action must be an object');
    }
}

export function assertActionKindIsValid(
    action: object
): asserts action is { kind: KindOfAction } {
    if (!('kind' in action)) {
        throw new Error("No 'kind' specified for action");
    }
    if (!ACTION_KINDS.includes(action.kind as KindOfAction)) {
        throw new Error(`Invalid 'kind' ${action.kind} for action`);
    }
}

export function assertActionPriorityIsValid(
    action: object
): asserts action is { priority: number } {
    if (!('priority' in action)) {
        throw new Error("No 'priority' specified for action");
    }
    if (action.priority === null) return;
    if (
        typeof action.priority !== 'number' ||
        action.priority < 0 ||
        action.priority > 100 ||
        Math.floor(action.priority) !== action.priority
    ) {
        throw new Error(
            'Action priority must be a positive integer less than or equal to 100'
        );
    }
}

export function assertActionInputIsValid(
    action: BaseAction
): asserts action is Extract<TriggeredAction, { kind: 'input' }> {
    assertActionKeySelectorIsValid(action);
    assertActionKeyValueIsValid(action);
}

export function assertActionSelectIsValid(
    action: BaseAction
): asserts action is Extract<TriggeredAction, { kind: 'select' }> {
    assertActionKeySelectorIsValid(action);
    assertActionKeyValueIsValid(action);
}

export function assertActionClickIsValid(
    action: BaseAction
): asserts action is Extract<TriggeredAction, { kind: 'click' }> {
    assertActionKeySelectorIsValid(action);
    assertActionKeyDelayMsIsValid(action);
}

export function assertActionCheckboxIsValid(
    action: BaseAction
): asserts action is Extract<TriggeredAction, { kind: 'checkbox' }> {
    assertActionKeySelectorIsValid(action);
    assertActionKeyCheckedIsValid(action);
}

function assertActionKeySelectorIsValid(
    action: object
): asserts action is { selector: string } {
    if (!('selector' in action)) {
        throw new Error("No 'selector' specified for action");
    }
    if (typeof action.selector !== 'string') {
        throw new Error('Action selector must be a string');
    }
}

function assertActionKeyValueIsValid(
    action: object
): asserts action is { value: string } {
    if (!('value' in action)) {
        throw new Error("No 'value' specified for action");
    }
    if (typeof action.value !== 'string') {
        throw new Error('Action value must be a string');
    }
}

function assertActionKeyDelayMsIsValid(
    action: object
): asserts action is { delayMs: number | null } {
    if (!('delayMs' in action)) {
        throw new Error(`No 'delayMs' specified for action`);
    }
    if (action.delayMs === null) return;
    if (
        typeof action.delayMs !== 'number' ||
        action.delayMs < 0 ||
        action.delayMs > 2000 ||
        Math.floor(action.delayMs) !== action.delayMs
    ) {
        throw new Error(
            'Action delayMs must be a positive integer less than 2000'
        );
    }
}

function assertActionKeyCheckedIsValid(
    action: object
): asserts action is { checked: boolean } {
    if (!('checked' in action)) {
        throw new Error(`No 'checked' specified for action`);
    }
    if (typeof action.checked !== 'boolean') {
        throw new Error('Action checked must be a boolean');
    }
}
