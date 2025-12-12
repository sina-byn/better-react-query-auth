import {
  type QueryKey,
  type QueryFunction,
  type UseQueryResult,
  type UseQueryOptions,
  type MutationFunction,
  type UseMutationResult,
  type UseMutationOptions,
} from '@tanstack/react-query';

import type { StrictOmit, Alphanumeric } from './utils';

export type HookName = `use${string}`;
export type AuthHookName<T extends string> = `use${Capitalize<Alphanumeric<T>>}`;

export type AuthQueryFn<TData = any> = QueryFunction<TData, QueryKey>;

export type AuthMutationFlow = { [k: string]: AuthMutationFn };
export type AuthMutationFn<TData = any, TVariables = any> = MutationFunction<TData, TVariables>;

export type AuthHandler = AuthMutationFn | AuthMutationFlow;

export type AuthQueryOptions = StrictOmit<UseQueryOptions, 'queryFn' | 'queryKey'>;
export type AuthMutationOptions = StrictOmit<UseMutationOptions, 'mutationFn' | 'mutationKey'>;

export type QueryFactory<TData = any> = (options?: AuthQueryOptions) => UseQueryResult<TData>;

export type MutationFactory<TData = any, TVariables = any> = (
  options?: AuthMutationOptions,
) => UseMutationResult<TData, Error, TVariables, unknown>;

export type AuthFlowHooks<T extends AuthMutationFlow> = {
  [K in keyof T as K extends string ? AuthHookName<K> : never]: T[K] extends AuthMutationFn<
    infer TData,
    infer TVariables
  >
    ? MutationFactory<TData, TVariables>
    : never;
};

export type AuthActionHooks<T, K extends string> =
  T extends AuthMutationFn<infer TData, infer TVariables>
    ? { [k in K as AuthHookName<k>]: MutationFactory<TData, TVariables> }
    : T extends AuthMutationFlow
      ? AuthFlowHooks<T>
      : never;

export type AuthResolvers<T extends AuthHandler, U extends AuthHandler> = {
  [K in 'resolvers' as T extends AuthMutationFn ? (U extends AuthMutationFn ? never : K) : K]: {
    [K in 'login' as T extends AuthMutationFn ? never : K]: keyof T;
  } & {
    [K in 'singup' as U extends AuthMutationFn ? never : K]: keyof U;
  };
};

export type PartialAuthResolvers = Partial<{
  login: 'login' & (string & {});
  signup: 'signup' & (string & {});
}>;

export type HookGroupConfig<T extends AuthMutationFlow> = {
  userKey: QueryKey;
  resolver: keyof T;
};

export type AuthHooks<
  T extends AuthHandler,
  U extends AuthHandler,
  V extends AuthMutationFn,
  W extends AuthQueryFn,
> = AuthActionHooks<T, 'login'> &
  AuthActionHooks<U, 'signup'> & {
    useUser: W extends AuthQueryFn<infer TData> ? QueryFactory<TData> : never;
    useLogout: V extends AuthMutationFn<infer TData, infer TVariables>
      ? MutationFactory<TData, TVariables>
      : never;
  };

export type AuthConfig<
  T extends AuthHandler,
  U extends AuthHandler,
  V extends AuthMutationFn,
  W extends AuthQueryFn,
> = {
  login: T;
  signup: U;
  logout: V;
  user: W;
  userKey?: QueryKey;
} & AuthResolvers<T, U>;
