import { useMutation } from '@tanstack/react-query';

import type { Alphanumeric } from '@/types/utils';
import type { HookName, AuthHookName, AuthFlowHooks, MutationFlow, MutationFactory } from '@/types';

function capitalize<T extends string>(input: T): Capitalize<T> {
  const capitalized = input.length === 0 ? input : `${input[0].toUpperCase()}${input.slice(1)}`;
  return capitalized as Capitalize<T>;
}

function normalizeHookFor<T extends string>(input: T) {
  return input.replace(/[^\dA-Za-z]/g, '') as Alphanumeric<T>;
}

function authHookNameFor<T extends string, U extends string>(
  step: T,
  infix: U,
): AuthHookName<T, U> {
  const normalInfix = capitalize(normalizeHookFor(infix));
  const normalStep = capitalize(normalizeHookFor(step));

  return `use${normalInfix}${normalStep}`;
}

export function mutationHooksForFlow<T extends MutationFlow, U extends string>(flow: T, infix: U) {
  const hooks: { [k: HookName]: MutationFactory } = {};

  for (const key in flow) {
    const hookName = authHookNameFor(key, infix);

    hooks[hookName] = (options = {}) => {
      return useMutation({
        mutationFn: flow[key],
        ...options,
      });
    };
  }

  return hooks as AuthFlowHooks<T, U>;
}
