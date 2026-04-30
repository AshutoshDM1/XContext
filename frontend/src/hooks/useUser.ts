import { useSession } from '../lib/auth-client';

export interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean | null;
}

type UserFields = {
  id?: true;
  name?: true;
  email?: true;
  image?: true;
  isAdmin?: true;
};

const useUser = (fields: UserFields) => {
  const { data: session } = useSession();
  const user = (session as unknown as { user?: User } | null | undefined)?.user as User | undefined;

  // Build resulting object only with requested fields
  const result: Partial<User> = {};

  if (fields.id) result.id = user?.id ?? null;
  if (fields.name) result.name = user?.name ?? null;
  if (fields.email) result.email = user?.email ?? null;
  if (fields.image) result.image = user?.image ?? null;
  if (fields.isAdmin) result.isAdmin = user?.isAdmin ?? null;

  return result;
};

export default useUser;
