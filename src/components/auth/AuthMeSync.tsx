import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMe } from '@/hooks/queries/useUsers';
import type { IUser } from '@/types';

function extractCollegeIdFromMe(me: { college_id?: unknown }): string | undefined {
  const c = me.college_id;
  if (c == null) return undefined;
  if (typeof c === 'string') return c;
  if (typeof c === 'object' && c !== null && '_id' in c) return String((c as { _id: unknown })._id);
  return undefined;
}

export function AuthMeSync() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const { data: me } = useMe({ enabled: Boolean(isAuthenticated && user) });

  useEffect(() => {
    if (!me || !user) return;
    const patch: Partial<IUser> = {};
    const flag = Boolean(me.requiresPasswordChange);
    if (flag !== Boolean(user.requiresPasswordChange)) {
      patch.requiresPasswordChange = flag;
    }
    const collegeId = extractCollegeIdFromMe(me);
    if (collegeId && collegeId !== user.collegeId) {
      patch.collegeId = collegeId;
    }
    if (typeof me.photo === 'string' && me.photo && me.photo !== user.avatarUrl) {
      patch.avatarUrl = me.photo;
    }
    if (Object.keys(patch).length > 0) {
      setUser({ ...user, ...patch });
    }
  }, [me, user, setUser]);

  return null;
}
