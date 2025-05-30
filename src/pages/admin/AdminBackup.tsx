
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { Link2, Trash2, ExternalLink } from 'lucide-react';
import { getAllBackupLinks, createBackupLink, deleteBackupLink, BackupLink } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

const AdminBackup: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [backupLinks, setBackupLinks] = useState<BackupLink[]>([]);
  const [newLink, setNewLink] = useState({ url: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Load backup links
  useEffect(() => {
    const links = getAllBackupLinks();
    setBackupLinks(links);
  }, []);

  const handleAddBackupLink = () => {
    if (!newLink.url || !newLink.description) {
      toast.error("Please provide both URL and description");
      return;
    }

    if (!newLink.url.startsWith('http')) {
      toast.error("URL must start with http:// or https://");
      return;
    }

    setIsLoading(true);
    try {
      const backupLinkData = {
        url: newLink.url,
        description: newLink.description,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'unknown'
      };

      const savedLink = createBackupLink(backupLinkData);
      
      setBackupLinks(prev => [...prev, savedLink]);
      setNewLink({ url: '', description: '' });
      
      toast.success("Backup link added successfully");
    } catch (error) {
      console.error("Error adding backup link:", error);
      toast.error("Failed to add backup link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLink = (id: string) => {
    try {
      deleteBackupLink(id);
      setBackupLinks(prev => prev.filter(link => link.id !== id));
      toast.success("Backup link deleted successfully");
    } catch (error) {
      console.error("Error deleting backup link:", error);
      toast.error("Failed to delete backup link");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Backup Management</h1>
        <p className="text-muted-foreground">
          Add and manage backup links that will be accessible to the owner for recovery purposes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Backup Link</CardTitle>
          <CardDescription>
            Provide a link to a cloud storage or other backup resource that the owner can access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="url">URL</Label>
              <div className="relative">
                <Link2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="url" 
                  placeholder="https://drive.google.com/file/..." 
                  className="pl-10"
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Backup for May 2025 - Full database with images" 
                rows={3}
                value={newLink.description}
                onChange={(e) => setNewLink({...newLink, description: e.target.value})}
              />
            </div>
            
            <Button onClick={handleAddBackupLink} disabled={isLoading}>
              Add Backup Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Backup Links</CardTitle>
          <CardDescription>
            These links are visible to you and to the owner account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backupLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backup links have been added yet.
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
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" /> Open
                          </a>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteLink(link.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default AdminBackup;
