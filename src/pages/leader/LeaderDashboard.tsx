
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { getProjectsByLeaderId, getAllPaymentRequests } from '@/lib/storage';
import { Project, PaymentRequest } from '@/lib/types';

const LeaderDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentRequest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const userProjects = getProjectsByLeaderId(user.id);
      setProjects(userProjects);
      
      // Use getAllPaymentRequests and filter by leaderId instead
      const allPayments = getAllPaymentRequests();
      const leaderPayments = allPayments
        .filter(payment => 
          userProjects.some(project => project.id === payment.projectId)
        )
        .slice(0, 3);
      setRecentPayments(leaderPayments);
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Scheduled</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateProgress = (project: Project) => {
    if (project.totalWork === 0) return 0;
    return Math.min(100, Math.round((project.completedWork / project.totalWork) * 100));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Leader Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{projects.length}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/leader/create-project')}>
              Create New Project
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Track Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Update work progress and capture photos</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/leader/add-progress')}>
              Add Progress
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Submit new payment requests</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/leader/request-payment')}>
              Request Payment
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>Created on {formatDate(project.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Progress:</span>
                        <span>{calculateProgress(project)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-primary" 
                          style={{ width: `${calculateProgress(project)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Completed: {project.completedWork} m</span>
                        <span>Total: {project.totalWork} m</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate('/leader/view-progress')}
                    >
                      View Progress
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You haven't created any projects yet.</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/leader/create-project')} className="w-full">
                  Create Your First Project
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Payment Requests</h2>
          {recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <Card key={payment.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>₹ {payment.totalAmount}</span>
                      {getStatusBadge(payment.status)}
                    </CardTitle>
                    <CardDescription>Requested on {formatDate(payment.date)}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/leader/view-payment')}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Payment Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You haven't submitted any payment requests yet.</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/leader/request-payment')} className="w-full">
                  Request Payment
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {recentPayments.length > 0 && (
            <div className="mt-4">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/leader/view-payment')}
              >
                View All Payment Requests
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderDashboard;
