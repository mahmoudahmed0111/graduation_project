import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { MapPin, ArrowLeft, Save } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { api, getApiErrorMessage } from '@/lib/api';

const TYPE_OPTS = [
  { value: 'lecture_hall', label: 'Lecture hall' },
  { value: 'lab', label: 'Lab' },
  { value: 'section_room', label: 'Section room' },
  { value: 'auditorium', label: 'Auditorium' },
];

export function EditLocation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    capacity: '',
    type: 'lecture_hall' as 'lecture_hall' | 'lab' | 'section_room' | 'auditorium',
    building: '',
    floor: '',
    roomNumber: '',
    readerId: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const raw = await api.getLocation(id);
        const r = raw as Record<string, unknown>;
        setForm({
          name: String(r.name ?? ''),
          capacity: String(r.capacity ?? ''),
          type: (String(r.type ?? 'lecture_hall') as typeof form.type),
          building: typeof r.building === 'string' ? r.building : '',
          floor: typeof r.floor === 'number' ? String(r.floor) : '',
          roomNumber: typeof r.roomNumber === 'string' ? r.roomNumber : '',
          readerId: typeof r.readerId === 'string' ? r.readerId : '',
        });
      } catch (error) {
        logger.error('Failed to load location', { context: 'EditLocation', error });
        showError('Could not load location');
        navigate('/dashboard/organizational/locations');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const cap = Number(form.capacity);
    if (!form.name.trim() || !Number.isFinite(cap) || cap < 0) {
      showError('Name and valid capacity are required');
      return;
    }
    try {
      setSaving(true);
      await api.updateLocation(id, {
        name: form.name.trim(),
        capacity: cap,
        type: form.type,
        ...(form.building.trim() ? { building: form.building.trim() } : {}),
        ...(form.floor.trim() !== '' && !Number.isNaN(Number(form.floor))
          ? { floor: Number(form.floor) }
          : {}),
        ...(form.roomNumber.trim() ? { roomNumber: form.roomNumber.trim() } : {}),
        ...(form.readerId.trim() ? { readerId: form.readerId.trim() } : {}),
      });
      success('Location updated');
      navigate('/dashboard/organizational/locations');
    } catch (error) {
      logger.error('Failed to update location', { context: 'EditLocation', error });
      showError(getApiErrorMessage(error, 'Failed to update location'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/organizational/locations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit location</h1>
          <p className="text-sm text-gray-600 mt-0.5">PATCH /api/v1/locations/:id</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-600" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                <Input
                  type="number"
                  min={0}
                  value={form.capacity}
                  onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <Select2
                  value={form.type}
                  onChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      type: v as typeof form.type,
                    }))
                  }
                  options={TYPE_OPTS}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                <Input
                  value={form.building}
                  onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <Input
                  type="number"
                  value={form.floor}
                  onChange={(e) => setForm((p) => ({ ...p, floor: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room number</label>
                <Input
                  value={form.roomNumber}
                  onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reader ID</label>
                <Input
                  value={form.readerId}
                  onChange={(e) => setForm((p) => ({ ...p, readerId: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
