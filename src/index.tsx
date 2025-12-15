import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { mutationHooksForFlow } from '@/utils';

import type {
  AuthConfig,
  QueryOptions,
  MutationFlow,
  MutationOptions,
  AuthLoaderProps,
} from '@/types';

// * constants
const LOGIN = 'login' as const;
const SIGNUP = 'signup' as const;

export function createAuthHooks<
  TUser extends unknown,
  TLogin,
  TSignup,
  TLoginFlow extends MutationFlow = never,
  TSignupFlow extends MutationFlow = never,
>(config: AuthConfig<TUser, TLogin, TSignup, TLoginFlow, TSignupFlow>) {
  const { user, login, signup, logout, userKey = ['current-user'] } = config;

  const loginFlow = config.loginFlow ?? ({} as TLoginFlow);
  const signupFlow = config.signupFlow ?? ({} as TSignupFlow);

  if ('login' in loginFlow) {
    throw new Error('[better-react-query-auth] `login` is a reserved `loginFlow` key.');
  }

  if ('signup' in signupFlow) {
    throw new Error('[better-react-query-auth] `signup` is a reserved `signupFlow` key.');
  }

  const useUser = (options: QueryOptions<TUser | null> = {}) => {
    return useQuery({
      queryKey: userKey,
      queryFn: user,
      ...options,
    });
  };

  return {
    userKey,
    useUser,

    ...mutationHooksForFlow(loginFlow, LOGIN),
    ...mutationHooksForFlow(signupFlow, SIGNUP),

    useLogin: (options: MutationOptions<TUser, TLogin> = {}) => {
      const queryClient = useQueryClient();

      const setUser = (user: TUser) => queryClient.setQueryData(userKey, user);

      return useMutation({
        mutationFn: login,
        ...options,
        onSuccess: (data, ...rest) => {
          setUser(data);
          options?.onSuccess?.(data, ...rest);
        },
      });
    },

    useSignup: (options: MutationOptions<TUser, TSignup> = {}) => {
      const queryClient = useQueryClient();

      const setUser = (user: TUser) => queryClient.setQueryData(userKey, user);

      return useMutation({
        mutationFn: signup,
        ...options,
        onSuccess: (data, ...rest) => {
          setUser(data);
          options?.onSuccess?.(data, ...rest);
        },
      });
    },

    useLogout: (options: MutationOptions = {}) => {
      const queryClient = useQueryClient();

      const setUser = (user: null) => queryClient.setQueryData(userKey, user);

      return useMutation({
        mutationFn: logout,
        ...options,
        onSuccess: (...args) => {
          setUser(null);
          options?.onSuccess?.(...args);
        },
      });
    },

    AuthLoader: ({
      options,
      children,
      renderLoading,
      renderUnauthenticated,
      renderError = (error: Error) => <>{JSON.stringify(error)}</>,
    }: AuthLoaderProps<TUser>) => {
      const { data, error, status, isFetched, isSuccess } = useUser(options);

      if (isSuccess) {
        if (renderUnauthenticated && !data) {
          return renderUnauthenticated();
        }

        return children;
      }

      if (!isFetched) {
        return renderLoading();
      }

      if (status === 'error') {
        return renderError(error);
      }

      return null;
    },
  };
}
