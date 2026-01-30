import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  Search, 
  Plus,
  Edit,
  UserCheck,
  GraduationCap,
  User,
  Shield
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { IUser } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

/** Derive list context from URL (routes are users/doctors | users/tas | users/admins). */
function useListRole(): 'doctors' | 'tas' | 'admins' {
  const { pathname } = useLocation();
  if (pathname.includes('/users/admins')) return 'admins';
  if (pathname.includes('/users/tas')) return 'tas';
  if (pathname.includes('/users/doctors')) return 'doctors';
  return 'doctors';
}

function getListRoleLabel(listRole: 'doctors' | 'tas' | 'admins'): string {
  switch (listRole) {
    case 'doctors': return 'Doctor';
    case 'tas': return 'Teaching Assistant';
    case 'admins': return 'Administrator';
    default: return listRole;
  }
}

export function AllUsers() {
  const listRole = useListRole();
  const role = listRole;
  const { error: showError } = useToastStore();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [role, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data - in real app: await api.getUsers({ role, search: searchTerm });
      const mockUsers: IUser[] = role === 'doctors' ? [
        { id: 'doc-1', name: 'Dr. Fatima Ali', email: 'fatima.ali@university.edu', role: 'doctor', universityId: 'univ-1' },
        { id: 'doc-2', name: 'Dr. Ahmed Toba', email: 'ahmed.toba@university.edu', role: 'doctor', universityId: 'univ-1' },
      ] : role === 'tas' ? [
        { id: 'ta-1', name: 'Ahmed Mohamed', email: 'ahmed.mohamed@university.edu', role: 'ta', universityId: 'univ-1' },
      ] : role === 'admins' ? [
        { id: 'admin-1', name: 'Admin User', email: 'admin@university.edu', role: 'universityAdmin', universityId: 'univ-1' },
      ] : [];
      setUsers(mockUsers);
    } catch (error) {
      logger.error('Failed to fetch users', { context: 'AllUsers', error });
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'doctor': return UserCheck;
      case 'ta': return Users;
      case 'student': return GraduationCap;
      case 'universityAdmin':
      case 'collegeAdmin': return Shield;
      default: return User;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'doctor': return 'Doctor';
      case 'ta': return 'TA';
      case 'student': return 'Student';
      case 'universityAdmin': return 'University Admin';
      case 'collegeAdmin': return 'College Admin';
      default: return role;
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {role === 'doctors' ? 'Doctors' : role === 'tas' ? 'Teaching Assistants' : 'Administrators'}
          </h1>
          <p className="text-gray-600 mt-1">Manage {getListRoleLabel(role)} accounts</p>
        </div>
        <Link to={`/dashboard/users/${role}/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add {getListRoleLabel(role)}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All {getListRoleLabel(role)}s</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const Icon = getRoleIcon(user.role);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {getRoleLabel(user.role)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/dashboard/users/${role}/${user.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

