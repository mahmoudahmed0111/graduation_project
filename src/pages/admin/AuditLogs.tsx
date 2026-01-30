import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Search, FileText, User, Target, Clock } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorId: string;
  action: string;
  target: string;
  targetId?: string;
  timestamp: string;
  details?: string;
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // In real app: const data = await api.getAuditLogs({ search: searchTerm });
        const mockLogs: AuditLogEntry[] = [
          { id: '1', actor: 'University Admin', actorId: '3', action: 'Updated Grade', target: 'Student Ahmed Mohamed', targetId: '1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
          { id: '2', actor: 'University Admin', actorId: '3', action: 'Deleted User', target: 'Soft-deleted account', targetId: 'u-deleted', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
          { id: '3', actor: 'College Admin', actorId: '4', action: 'Created College', target: 'Faculty of Science', targetId: 'college-2', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
          { id: '4', actor: 'University Admin', actorId: '3', action: 'Changed Semester', target: 'System', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
          { id: '5', actor: 'University Admin', actorId: '3', action: 'Unlocked Account', target: 'user@university.edu', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
        ];
        setLogs(mockLogs);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [searchTerm]);

  const filteredLogs = logs.filter(
    (log) =>
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">Monitor sensitive operations and system changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Monitoring Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by actor, action, or target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase">Actor</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase">Action</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase">Target</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No audit log entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{log.actor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded bg-primary-100 text-primary-800 font-medium">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span>{log.target}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDate(log.timestamp)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
