
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink } from 'lucide-react';
import { getAllBackupLinks, BackupLink } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

const OwnerBackupLinks: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [backupLinks, setBackupLinks] = useState<BackupLink[]>([]);

  // Redirect if not owner
  useEffect(() => {
    if (user && user.role !== 'owner') {
      navigate('/');
    }
  }, [user, navigate]);

  // Load backup links
  useEffect(() => {
    const links = getAllBackupLinks();
    setBackupLinks(links);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Backup Links</h1>
        <p className="text-muted-foreground">
          Access backup links provided by the administrator.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Backup Links</CardTitle>
          <CardDescription>
            These links can be used to access backed up data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backupLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backup links are currently available. Please contact the administrator.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backupLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.description}</TableCell>
                    <TableCell>{formatDate(link.createdAt)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" /> Open
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerBackupLinks;
