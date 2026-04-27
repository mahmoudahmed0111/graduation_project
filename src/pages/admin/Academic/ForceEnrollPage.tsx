import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { useForceEnrollmentMutation } from '@/hooks/queries/usePhase3Enrollments';
import { getApiErrorMessage } from '@/lib/http/client';

export function ForceEnrollPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const forceMut = useForceEnrollmentMutation();

  const [student_id, setStudent_id] = useState('');
  const [courseOffering_id, setCourseOffering_id] = useState('');
  const [reason, setReason] = useState('');
  const [overrideCapacity, setOverrideCapacity] = useState(false);
  const [overrideCreditLimit, setOverrideCreditLimit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student_id.trim() || !courseOffering_id.trim()) {
      showError('Student ID and course offering ID are required.');
      return;
    }
    try {
      await forceMut.mutateAsync({
        student_id: student_id.trim(),
        courseOffering_id: courseOffering_id.trim(),
        overrideCapacity: overrideCapacity || undefined,
        overrideCreditLimit: overrideCreditLimit || undefined,
        reason: reason.trim() || undefined,
      });
      success('Enrollment recorded.');
      navigate('/dashboard/academic/enrollments');
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/academic/enrollments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Force enroll</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Prerequisites are never bypassed. Overrides apply to capacity and/or credit limits only (UA/CA).
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Student ID *</label>
                <Input value={student_id} onChange={(e) => setStudent_id(e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Course offering ID *</label>
                <Input value={courseOffering_id} onChange={(e) => setCourseOffering_id(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Reason (optional)</label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={overrideCapacity}
                  onChange={(e) => setOverrideCapacity(e.target.checked)}
                />
                Override capacity (Gate 4)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={overrideCreditLimit}
                  onChange={(e) => setOverrideCreditLimit(e.target.checked)}
                />
                Override credit limit (Gate 2)
              </label>
            </div>
            <Button type="submit" variant="primary" disabled={forceMut.isPending} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {forceMut.isPending ? 'Submitting…' : 'Enroll'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
