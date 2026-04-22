import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLookupUser } from '@/hooks/queries/useUsers';
import { getApiErrorMessage } from '@/lib/http/client';
import { useToastStore } from '@/store/toastStore';
import { useNavigate } from 'react-router-dom';

export function NationalIdLookupModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { error: toastError, success } = useToastStore();
  const [nationalID, setNationalID] = useState('');
  const lookup = useLookupUser();

  const handleSubmit = async () => {
    const trimmed = nationalID.replace(/\D/g, '');
    if (trimmed.length !== 14) {
      toastError('National ID must be 14 digits.');
      return;
    }
    try {
      const user = await lookup.mutateAsync(trimmed);
      success('User found.');
      onClose();
      setNationalID('');
      navigate(`/dashboard/users/directory/${user._id}`);
    } catch (e) {
      toastError(getApiErrorMessage(e, 'No user found or not available in your scope.'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lookup by National ID" size="md">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        National ID is sent in the request body only, not in the URL.
      </p>
      <div className="space-y-4">
        <Input
          label="National ID"
          value={nationalID}
          onChange={(e) => setNationalID(e.target.value)}
          placeholder="14 digits"
          maxLength={14}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={() => void handleSubmit()} disabled={lookup.isPending}>
            {lookup.isPending ? 'Searching…' : 'Lookup'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
