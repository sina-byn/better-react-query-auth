import { useCallback } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { mutationHooksForFlow } from '@/utils';
import { DEFAULT_RESOLVERS } from '@/constants';

import type {
  AuthHooks,
  AuthConfig,
  AuthQueryFn,
  AuthHandler,
  AuthMutationFn,
  AuthActionHooks,
  AuthMutationFlow,
  PartialAuthResolvers,
} from '@/types';

export function createAuthHooks<
  T extends AuthHandler,
  U extends AuthHandler,
  V extends AuthMutationFn,
  W extends AuthQueryFn,
>(config: AuthConfig<T, U, V, W>): AuthHooks<T, U, V, W> {
  const { login, signup, logout, user, userKey = ['self'] } = config;

  const hasLoginFn = typeof login === 'function';
  const hasSignupFn = typeof signup === 'function';

  const loginFlow = (hasLoginFn ? { login } : login) as AuthMutationFlow;
  const signupFlow = (hasSignupFn ? { signup } : signup) as AuthMutationFlow;

  const hasResolvers = 'resolvers' in config;
  const resolvers = hasResolvers ? (config.resolvers as PartialAuthResolvers) : DEFAULT_RESOLVERS;

  const { login: loginResolver = 'login', signup: signupResolver = 'signup' } = {
    ...DEFAULT_RESOLVERS,
    ...resolvers,
  };

  const loginHooks = mutationHooksForFlow(loginFlow, {
    userKey,
    resolver: loginResolver,
  }) as AuthActionHooks<T, 'login'>;

  const signupHooks = mutationHooksForFlow(signupFlow, {
    userKey,
    resolver: signupResolver,
  }) as AuthActionHooks<U, 'signup'>;

  return {
    ...loginHooks,
    ...signupHooks,

    useLogout: (options = {}) => {
      const queryClient = useQueryClient();

      const setUser = useCallback(
        (data: unknown) => queryClient?.setQueryData(userKey, data),
        [queryClient],
      );

      return useMutation({
        mutationKey: [...userKey, 'logout'],
        mutationFn: logout,
        ...options,
        onSuccess(data, ...rest) {
          setUser(null);
          options.onSuccess?.(data, ...rest);
        },
      });
    },

    useUser: (options = {}) => {
      return useQuery({
        queryKey: userKey,
        queryFn: user,
        ...options,
      });
    },
  } as AuthHooks<T, U, V, W>;
}
