import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import {
  useAllocateUsers,
  useBulkActions,
} from '@/hooks/queries/useUsers';
import { getApiErrorMessage } from '@/lib/http/client';
import type { Phase2ApiUser } from '@/types/phase2-user';
import { useToastStore } from '@/store/toastStore';
import { GraduationCap, MoveRight, Power, UserCheck } from 'lucide-react';

type DeptOpt = { value: string; label: string };

export function UserBulkActionsPanel({
  selectedIds,
  selectedUsers,
  departmentOptions,
  currentUserId,
  isCollegeAdmin,
  onClear,
}: {
  selectedIds: string[];
  selectedUsers: Phase2ApiUser[];
  departmentOptions: DeptOpt[];
  currentUserId?: string;
  isCollegeAdmin: boolean;
  onClear: () => void;
}) {
  const { success, error: toastError } = useToastStore();
  const bulk = useBulkActions();
  const allocate = useAllocateUsers();

  const [moveOpen, setMoveOpen] = useState(false);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [targetDept, setTargetDept] = useState('');

  const effectiveIds = selectedIds.filter((id) => id !== currentUserId);
  const studentIds = selectedUsers.filter((u) => u.role === 'student').map((u) => String(u._id));

  const runBulk = async (action: 'activate' | 'deactivate' | 'graduate') => {
    if (effectiveIds.length === 0) {
      toastError('Select at least one user other than yourself.');
      return;
    }
    try {
      const data = await bulk.mutateAsync({ action, userIds: effectiveIds });
      const summary = 'modified' in data ? `Updated ${data.modified} of ${data.requested}.` : 'Bulk action completed.';
      success(summary);
      onClear();
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  const confirmMove = async () => {
    if (!targetDept) {
      toastError('Choose a department.');
      return;
    }
    if (effectiveIds.length === 0) {
      toastError('Select at least one user other than yourself.');
      return;
    }
    try {
      const data = await bulk.mutateAsync({
        action: 'move-department',
        userIds: effectiveIds,
        payload: { departmentId: targetDept },
      });
      success(`Moved ${'modified' in data ? data.modified : 0} user(s).`);
      setMoveOpen(false);
      setTargetDept('');
      onClear();
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  const confirmAllocate = async () => {
    if (!targetDept) {
      toastError('Choose a target department.');
      return;
    }
    if (studentIds.length === 0) {
      toastError('Select at least one student to allocate.');
      return;
    }
    try {
      const res = await allocate.mutateAsync({ targetDepartmentId: targetDept, studentIds });
      success(res.message ?? `Allocated ${res.modifiedCount} student(s).`);
      setAllocateOpen(false);
      setTargetDept('');
      onClear();
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary-500/30 bg-primary-500/5 px-4 py-3 text-sm dark:bg-primary-500/10">
        <span className="font-medium text-gray-800 dark:text-gray-100">{selectedIds.length} selected</span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="gap-1"
          onClick={() => void runBulk('activate')}
          disabled={bulk.isPending}
        >
          <Power className="h-3.5 w-3.5" />
          Activate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="gap-1"
          onClick={() => void runBulk('deactivate')}
          disabled={bulk.isPending}
        >
          Deactivate
        </Button>
        <Button type="button" size="sm" variant="secondary" className="gap-1" onClick={() => setMoveOpen(true)}>
          <MoveRight className="h-3.5 w-3.5" />
          Move department
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="gap-1"
          onClick={() => void runBulk('graduate')}
          disabled={bulk.isPending}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Graduate
        </Button>
        {isCollegeAdmin && (
          <Button type="button" size="sm" variant="primary" className="gap-1" onClick={() => setAllocateOpen(true)}>
            <UserCheck className="h-3.5 w-3.5" />
            Allocate students
          </Button>
        )}
        <Button type="button" size="sm" variant="ghost" onClick={onClear}>
          Clear
        </Button>
      </div>

      <Modal isOpen={moveOpen} onClose={() => setMoveOpen(false)} title="Move to department" size="md">
        <Select2 label="Target department" options={departmentOptions} value={targetDept} onChange={setTargetDept} />
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setMoveOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={() => void confirmMove()} disabled={bulk.isPending}>
            Apply
          </Button>
        </div>
      </Modal>

      <Modal isOpen={allocateOpen} onClose={() => setAllocateOpen(false)} title="Allocate students" size="md">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Only student roles are sent ({studentIds.length} in current selection).
        </p>
        <Select2 label="Target department" options={departmentOptions} value={targetDept} onChange={setTargetDept} />
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setAllocateOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={() => void confirmAllocate()} disabled={allocate.isPending}>
            Allocate
          </Button>
        </div>
      </Modal>
    </>
  );
}
