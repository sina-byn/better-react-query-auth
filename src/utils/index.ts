import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Alphanumeric } from '@/types/utils';

import type {
  HookName,
  AuthHookName,
  AuthFlowHooks,
  HookGroupConfig,
  MutationFactory,
  AuthMutationFlow,
} from '@/types';

function authHookNameFor<T extends string>(input: T): AuthHookName<T> {
  return `use${capitalize(normalizeHookFor(input))}`;
}

function normalizeHookFor<T extends string>(input: T) {
  return input.replace(/[^\dA-Za-z]/g, '') as Alphanumeric<T>;
}

function capitalize<T extends string>(input: T): Capitalize<T> {
  const capitalized = input.length === 0 ? input : `${input[0].toUpperCase()}${input.slice(1)}`;
  return capitalized as Capitalize<T>;
}

export function mutationHooksForFlow<T extends AuthMutationFlow>(
  flow: T,
  config: HookGroupConfig<T>,
): AuthFlowHooks<T> {
  const hooks: { [k: HookName]: MutationFactory } = {};
  const { userKey, resolver } = config;

  for (const key in flow) {
    const hookName = authHookNameFor(key);
    const isResolver = key === resolver;

    hooks[hookName] = (options = {}) => {
      const queryClient = useQueryClient();

      const setUser = useCallback(
        (data: unknown) => queryClient.setQueryData(userKey, data),
        [queryClient],
      );

      return useMutation({
        mutationKey: [...userKey, key],
        mutationFn: flow[key],
        ...options,
        onSuccess: (data, ...rest) => {
          if (isResolver) setUser(data);
          options.onSuccess?.(data, ...rest);
        },
      });
    };
  }

  return hooks as AuthFlowHooks<T>;
}
