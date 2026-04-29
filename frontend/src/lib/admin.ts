import { useSession } from './auth-client';

const useIsAdmin = () => {
  const { data: session } = useSession();
  const user = (session as unknown as { user?: unknown } | null | undefined)?.user as
    | {
        isAdmin?: boolean | null;
      }
    | undefined;

  return user?.isAdmin ?? false;
};

export default useIsAdmin;
