import { createAuthHooks } from '@/lib';

const { useLogin } = createAuthHooks({
  login: async (username: string) => {
    const resp = await fetch('http://localhost:3000/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
      }),
    });

    const data = await resp.json();
    return data;
  },
  signup: async () => {},
  logout: async () => {},
  user: async () => {},
});

export function App() {
  const mutation = useLogin();

  return (
    <div>
      <button
        type='button'
        onClick={async () => {
          const data = await mutation.mutateAsync('username');
          console.log(data);
        }}
      >
        login
      </button>
    </div>
  );
}
