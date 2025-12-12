import type { PartialAuthResolvers } from '@/types';

export const DEFAULT_RESOLVERS: Required<PartialAuthResolvers> = {
  login: 'login',
  signup: 'signup',
};
