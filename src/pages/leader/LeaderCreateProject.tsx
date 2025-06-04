import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../components/ui/use-toast';
import { createProject, getCurrentUser } from '../../lib/storage';
import { api } from '../../lib/api';

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Project name must be at least 3 characters.",
  }),
  workers: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Workers must be a positive number.",
  }),
  totalWork: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Total work distance must be a positive number.",
  }),
});

const LeaderCreateProject = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Verify user session on mount and when user changes
  useEffect(() => {
    const verifySession = () => {
      if (!loading) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          navigate('/login');
        }
      }
    };
    
    verifySession();
  }, [loading, navigate]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      workers: "",
      totalWork: "",
    },
  });
  
  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    // Double-check user session before proceeding
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create project in local storage
      const newProject = createProject({
        name: values.name,
        leaderId: currentUser.id,
        workers: parseInt(values.workers),
        totalWork: parseFloat(values.totalWork),
        completedWork: 0,
        createdAt: new Date().toISOString(),
      });

      // Store project in Couchbase via API
      await api.createProject({
        id: newProject.id,
        name: values.name,
        leaderId: currentUser.id,
        workers: parseInt(values.workers),
        totalWork: parseFloat(values.totalWork),
        completedWork: 0,
        createdAt: new Date().toISOString(),
        status: 'active',
        leaderName: currentUser.name,
        leaderEmail: currentUser.email
      });
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      
      // Redirect to leader page after short delay
      setTimeout(() => {
        navigate('/leader');
      }, 1500);
      
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate, toast]);
  
  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Create New Project</h1>
      <p className="text-muted-foreground mb-8">
        Enter the details for your new construction project.
      </p>
      
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Fill in the information to create a new project.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workers">Number of Workers</Label>
                <Input
                  id="workers"
                  type="number"
                  placeholder="Enter number of workers"
                  min="1"
                  {...register("workers")}
                />
                {errors.workers && (
                  <p className="text-sm text-destructive">{errors.workers.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalWork">Total Work Distance (meters)</Label>
                <Input
                  id="totalWork"
                  type="number"
                  placeholder="Enter total work distance in meters"
                  min="1"
                  step="0.01"
                  {...register("totalWork")}
                />
                {errors.totalWork && (
                  <p className="text-sm text-destructive">{errors.totalWork.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LeaderCreateProject;
