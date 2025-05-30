import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { getAllUsers, createUser, updateUser, deleteUser, getUsersByRole } from '@/lib/storage';
import { User, UserRole } from '@/lib/types';

const AdminCredentials = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('leader');
  
  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };
  
  const handleAddUser = () => {
    if (!name || !email || !password || !role) {
      toast.error("Please fill all fields");
      return;
    }
    
    try {
      // Fixing the createUser call to pass the individual arguments instead of an object
      const newUser = createUser(name, email, password, role);
      
      if (newUser) {
        toast.success("User created successfully");
        setShowAddDialog(false);
        resetForm();
        loadUsers();
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to create user");
    }
  };
  
  const handleEditUser = () => {
    if (!selectedUser || !name || !email || !role) {
      toast.error("Please fill all fields");
      return;
    }
    
    try {
      updateUser({
        ...selectedUser,
        name,
        email,
        password: password || selectedUser.password,
        role
      });
      
      toast.success("User updated successfully");
      setShowEditDialog(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };
  
  const handleDeleteUser = () => {
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    
    try {
      deleteUser(selectedUser.id);
      toast.success("User deleted successfully");
      setShowDeleteDialog(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };
  
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setShowEditDialog(true);
  };
  
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };
  
  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('leader');
    setSelectedUser(null);
  };
  
  const getUserCount = (role: UserRole): number => {
    return users.filter(user => user.role === role).length;
  };
  
  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      'admin': 'Admin',
      'leader': 'Team Leader',
      'checker': 'Quality Checker',
      'owner': 'Owner'
    };
    
    return labels[role] || role;
  };
  
  // Fixed TypeScript handler for role selection
  const handleRoleChange = (value: string) => {
    setRole(value as UserRole);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Manage User Credentials</h1>
      <p className="text-muted-foreground mb-8">
        Add, edit, and manage user accounts and their roles within the system.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>
                Manage existing user accounts and their roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Admin Users:</p>
                  <p className="text-2xl font-bold">{getUserCount('admin')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Team Leaders:</p>
                  <p className="text-2xl font-bold">{getUserCount('leader')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Quality Checkers:</p>
                  <p className="text-2xl font-bold">{getUserCount('checker')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Owners:</p>
                  <p className="text-2xl font-bold">{getUserCount('owner')}</p>
                </div>
              </div>
              
              <Button onClick={() => setShowAddDialog(true)}>Add User</Button>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 bg-gray-50"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getRoleLabel(user.role)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                            Edit
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => openDeleteDialog(user)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with the necessary details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger id="role" className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="leader">Team Leader</SelectItem>
                  <SelectItem value="checker">Quality Checker</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Edit the details of the selected user account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input type="password" id="password" placeholder="Leave blank to keep current password" onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={handleRoleChange}>
                <SelectTrigger id="role" className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="leader">Team Leader</SelectItem>
                  <SelectItem value="checker">Quality Checker</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCredentials;
