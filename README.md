# better-react-query-auth

A powerful, type-safe authentication hook factory for React applications using TanStack Query (React Query). Build flexible authentication flows with automatic cache management and extensible auth workflows.

## Inspiration & Attribution

This package is inspired by [react-query-auth](https://github.com/alan2207/react-query-auth) by Alan Alickovic. We've adapted and extended some of the original concepts with additional features like authentication flows, improved TypeScript support, and enhanced flexibility. Special thanks to the original author for the foundational ideas.

# Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Basic Example (Without Flows)](#basic-example-without-flows)
  - [Advanced Example (With Flows)](#advanced-example-with-flows)
- [API Reference](#api-reference)
  - [`createAuthHooks(config)`](#createauthhooksconfig)
  - [Flow Naming Convention](#flow-naming-convention)
- [License](#license)
- [Contributing](#contributing)
- [Support](#support)

## Features

- 🔐 **Complete Auth System**: Login, signup, logout, and user management out of the box
- 🔄 **Extensible Flows**: Add pre/post-authentication steps (email verification, MFA, onboarding)
- 📦 **Automatic Cache Management**: User state synchronized across your app
- 🎯 **Type-Safe**: Full TypeScript support with comprehensive type inference
- 🪝 **React Query Integration**: Leverages TanStack Query's powerful features
- 🎨 **AuthLoader Component**: Built-in loading and authentication states
- ⚡ **Minimal Boilerplate**: One configuration, many hooks

## Installation

```bash
npm install better-react-query-auth @tanstack/react-query
# or
yarn add better-react-query-auth @tanstack/react-query
# or
pnpm add better-react-query-auth @tanstack/react-query
```

## Quick Start

### Basic Example (Without Flows)

```typescript
// auth.ts
import { createAuthHooks } from 'better-react-query-auth';

// Define your user type
interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

// Create your auth hooks
export const { useUser, useLogin, useSignup, useLogout, AuthLoader, userKey } = createAuthHooks<
  User,
  LoginCredentials,
  SignupCredentials
>({
  // Fetch current user
  user: async () => {
    const response = await fetch('/api/auth/me');
    if (!response.ok) return null;
    return response.json();
  },

  // Login mutation
  login: async credentials => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  // Signup mutation
  signup: async credentials => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Signup failed');
    return response.json();
  },

  // Logout mutation
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  // Optional: custom query key (default: ['current-user'])
  userKey: ['auth', 'user'],
});
```

```tsx
// LoginForm.tsx
import { useLogin } from './auth';

export function LoginForm() {
  const login = useLogin({
    onSuccess: user => {
      console.log('Logged in as:', user.name);
    },
    onError: error => {
      console.error('Login failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    login.mutate({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name='email' type='email' required />
      <input name='password' type='password' required />
      <button type='submit' disabled={login.isPending}>
        {login.isPending ? 'Logging in...' : 'Login'}
      </button>
      {login.isError && <p>Error: {login.error.message}</p>}
    </form>
  );
}
```

```tsx
// App.tsx
import { AuthLoader, useUser, useLogout } from './auth';

function App() {
  return (
    <AuthLoader
      renderLoading={() => <div>Loading...</div>}
      renderUnauthenticated={() => <LoginPage />}
      renderError={error => <div>Error: {error.message}</div>}
    >
      <AuthenticatedApp />
    </AuthLoader>
  );
}

function AuthenticatedApp() {
  const { data: user } = useUser();
  const logout = useLogout();

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={() => logout.mutate({})}>Logout</button>
    </div>
  );
}
```

### Advanced Example (With Flows)

Authentication flows allow you to add additional steps before or after login/signup, such as email verification, MFA, or onboarding.

```typescript
// auth-with-flows.ts
import { createAuthHooks } from 'better-react-query-auth';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

interface VerifyEmailData {
  userId: string;
  code: string;
}

interface MfaData {
  userId: string;
  token: string;
}

interface OnboardingData {
  userId: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Create auth hooks with flows
export const {
  useUser,
  useLogin,
  useSignup,
  useLogout,

  // Login flow hooks
  useLoginVerifyEmail,
  useLoginMfa,

  // Signup flow hooks
  useSignupVerifyEmail,
  useSignupOnboarding,

  AuthLoader,
  userKey,
} = createAuthHooks<
  User,
  LoginCredentials,
  SignupCredentials,
  {
    verifyEmail: (data: VerifyEmailData) => Promise<void>;
    mfa: (data: MfaData) => Promise<void>;
  },
  {
    verifyEmail: (data: VerifyEmailData) => Promise<void>;
    onboarding: (data: OnboardingData) => Promise<User>;
  }
>({
  user: async () => {
    const response = await fetch('/api/auth/me');
    if (!response.ok) return null;
    return response.json();
  },

  login: async credentials => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  signup: async credentials => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Signup failed');
    return response.json();
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  // Login flow - additional authentication steps
  loginFlow: {
    verifyEmail: async data => {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Verification failed');
    },

    mfa: async data => {
      const response = await fetch('/api/auth/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('MFA failed');
    },
  },

  // Signup flow - post-registration steps
  signupFlow: {
    verifyEmail: async data => {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Verification failed');
    },

    onboarding: async data => {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Onboarding failed');
      return response.json();
    },
  },
});
```

```tsx
// SignupFlow.tsx
import { useState } from 'react';
import { useSignup, useSignupVerifyEmail, useSignupOnboarding } from './auth-with-flows';

export function SignupFlow() {
  const [step, setStep] = useState<'signup' | 'verify' | 'onboarding'>('signup');
  const [userId, setUserId] = useState<string>('');

  const signup = useSignup({
    onSuccess: user => {
      setUserId(user.id);
      setStep('verify');
    },
  });

  const verifyEmail = useSignupVerifyEmail({
    onSuccess: () => {
      setStep('onboarding');
    },
  });

  const onboarding = useSignupOnboarding({
    onSuccess: user => {
      console.log('Onboarding complete!', user);
      // User is now fully authenticated and onboarded
    },
  });

  if (step === 'signup') {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          signup.mutate({
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            name: formData.get('name') as string,
          });
        }}
      >
        <input name='name' required />
        <input name='email' type='email' required />
        <input name='password' type='password' required />
        <button type='submit' disabled={signup.isPending}>
          Sign Up
        </button>
      </form>
    );
  }

  if (step === 'verify') {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          verifyEmail.mutate({
            userId,
            code: formData.get('code') as string,
          });
        }}
      >
        <p>Check your email for a verification code</p>
        <input name='code' required />
        <button type='submit' disabled={verifyEmail.isPending}>
          Verify Email
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onboarding.mutate({
          userId,
          preferences: {
            theme: formData.get('theme') as 'light' | 'dark',
            notifications: formData.get('notifications') === 'on',
          },
        });
      }}
    >
      <h2>Complete Your Profile</h2>
      <select name='theme'>
        <option value='light'>Light</option>
        <option value='dark'>Dark</option>
      </select>
      <label>
        <input name='notifications' type='checkbox' />
        Enable notifications
      </label>
      <button type='submit' disabled={onboarding.isPending}>
        Complete Setup
      </button>
    </form>
  );
}
```

## API Reference

### `createAuthHooks(config)`

Creates a set of authentication hooks based on your configuration.

**Parameters:**

- `config.user`: Query function to fetch the current user
- `config.login`: Mutation function for login
- `config.signup`: Mutation function for signup
- `config.logout`: Mutation function for logout
- `config.userKey`: (Optional) Custom query key for user data
- `config.loginFlow`: (Optional) Additional login flow steps
- `config.signupFlow`: (Optional) Additional signup flow steps

**Returns:**

- `useUser`: Hook to access current user data
- `useLogin`: Hook for login mutation
- `useSignup`: Hook for signup mutation
- `useLogout`: Hook for logout mutation
- `AuthLoader`: Component for handling auth states
- `userKey`: The query key used for user data
- `use{Flow}{Step}`: Generated hooks for each flow step

### Flow Naming Convention

Flow hooks are automatically generated with the pattern: `use{Flow}{Step}`

- Login flow: `useLogin{StepName}` (e.g., `useLoginVerifyEmail`, `useLoginMfa`)
- Signup flow: `useSignup{StepName}` (e.g., `useSignupVerifyEmail`, `useSignupOnboarding`)

Special characters are removed and names are normalized to camelCase.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
