"use client";
import { User } from '@/types';

type SessionProviderProps = {
  children: React.ReactNode;
  user: User | null;
}

export function SessionProvider({ user, children }: SessionProviderProps) {
/*   const { setUser } = useAuth();

  useEffect(() => {
    setUser(user as User);
  }, [user, setUser]); */

  return <>{children}</>;;
}