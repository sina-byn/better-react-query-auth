import { createAuthHooks, type MutationFn } from '@/lib';

type User = {
  id: string;
  email: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type SignupInput = {
  email: string;
  password: string;
};

type LoginFlow = {
  requestOtp: MutationFn<void, string>;
  verifyOtp: MutationFn<void, { email: string; code: string }>;
};

export const auth = createAuthHooks<User, LoginInput, SignupInput, LoginFlow>({
  user: async () => {
    const res = await fetch('/api/me');
    if (!res.ok) return null;
    const data = await res.json();
    return data as User;
  },

  login: async (data: LoginInput) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json() as Promise<User>;
  },

  signup: async (data: SignupInput) => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json() as Promise<User>;
  },

  logout: async () => {
    await fetch('/api/logout', { method: 'POST' });
  },

  loginFlow: {
    requestOtp: async (email: string) => {
      const resp = await fetch('/api/login/otp/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      console.log(resp);
    },

    verifyOtp: async (payload: { email: string; code: string }) => {
      const resp = await fetch('/api/login/otp/verify', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log(resp);
    },
  },
});

export function App() {
  return <div>App</div>;
}
