import {
  type QueryKey,
  type QueryFunction,
  type UseQueryResult,
  type UseQueryOptions,
  type MutationFunction,
  type UseMutationResult,
  type UseMutationOptions,
} from '@tanstack/react-query';

import type { JSX } from 'react';
import type { StrictOmit, Alphanumeric } from '@/types/utils';

export type HookName = `use${string}`;

export type AuthHookName<
  T extends string,
  U extends string = '',
> = `use${Capitalize<Alphanumeric<U>>}${Capitalize<Alphanumeric<T>>}`;

export type ReservedFlowKeys = 'login' | 'signup';

export type MutationFn<TData = any, TVariables = any> = MutationFunction<TData, TVariables>;

export type MutationFlow = {
  [K in Exclude<string, ReservedFlowKeys>]: MutationFunction<any, any>;
} & {
  [K in ReservedFlowKeys]?: never;
};

export type QueryOptions<TData = unknown> = StrictOmit<
  UseQueryOptions<TData, Error>,
  'queryFn' | 'queryKey'
>;

export type QueryFactory<TData = any> = (options?: QueryOptions) => UseQueryResult<TData>;

export type MutationOptions<TData = unknown, TVariables = unknown> = StrictOmit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
>;

export type MutationFactory<TData = any, TVariables = any> = (
  options?: MutationOptions,
) => UseMutationResult<TData, Error, TVariables, unknown>;

export type AuthFlowHooks<T extends MutationFlow, U extends string = ''> = {
  [K in keyof T as K extends string ? AuthHookName<K, U> : never]: T[K] extends MutationFn<
    infer TData,
    infer TVariables
  >
    ? MutationFactory<TData, TVariables>
    : never;
};

export type AuthConfig<
  TUser extends unknown,
  TLogin,
  TSignup,
  TLoginFlow extends MutationFlow = never,
  TSignupFlow extends MutationFlow = never,
> = {
  user: QueryFunction<TUser, QueryKey>;
  login: MutationFn<TUser, TLogin>;
  signup: MutationFn<TUser, TSignup>;
  logout: MutationFn<unknown, unknown>;
  userKey?: QueryKey;
  loginFlow?: TLoginFlow;
  signupFlow?: TSignupFlow;
};

export type AuthLoaderProps<TUser> = {
  children: React.ReactNode;
  renderLoading: () => JSX.Element;
  renderUnauthenticated?: () => JSX.Element;
  renderError?: (error: Error) => JSX.Element;
  options?: QueryOptions<TUser | null>;
};
