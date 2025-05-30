import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { MapView } from '@/components/shared/map-view';
import { getProjectsByLeaderId, getProgressUpdatesByProjectId, getVehicleById } from '@/lib/storage';
import { Project, ProgressUpdate, Vehicle } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File } from 'lucide-react';

const LeaderViewProgress = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [selectedProgress, setSelectedProgress] = useState<ProgressUpdate | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  
  useEffect(() => {
    if (user) {
      const userProjects = getProjectsByLeaderId(user.id);
      setProjects(userProjects);
      if (userProjects.length > 0 && !selectedProject) {
        setSelectedProject(userProjects[0].id);
      }
    }
  }, [user]);
  
  useEffect(() => {
    if (selectedProject) {
      const updates = getProgressUpdatesByProjectId(selectedProject)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setProgressUpdates(updates);
    } else {
      setProgressUpdates([]);
    }
  }, [selectedProject]);
  
  const handleViewProgress = (progress: ProgressUpdate) => {
    setSelectedProgress(progress);
    
    if (progress.vehicleId) {
      const vehicle = getVehicleById(progress.vehicleId);
      setSelectedVehicle(vehicle);
    } else {
      setSelectedVehicle(null);
    }
    
    setShowDialog(true);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const calculateCompletionPercentage = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.totalWork === 0) return 0;
    return Math.min(100, Math.round((project.completedWork / project.totalWork) * 100));
  };
  
  const getGradientByIndex = (index: number) => {
    const gradients = [
      'bg-gradient-to-r from-primary to-secondary',
      'bg-gradient-to-r from-secondary to-primary',
      'bg-gradient-to-r from-amber-500 to-amber-300',
      'bg-gradient-to-r from-amber-300 to-amber-500'
    ];
    return gradients[index];
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">View Progress</h1>
      <p className="text-muted-foreground mb-8">
        Track and view the progress of your projects.
      </p>
      
      <div className="mb-6">
        <Label htmlFor="project-select">Select Project</Label>
        <Select
          value={selectedProject}
          onValueChange={setSelectedProject}
        >
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedProject && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {projects.find(p => p.id === selectedProject)?.name}
            </CardTitle>
            <CardDescription>
              Overview of project progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Overall Completion:</span>
                  <span>{calculateCompletionPercentage(selectedProject)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-4">
                  <div 
                    className="bg-primary h-4 rounded-full" 
                    style={{ width: `${calculateCompletionPercentage(selectedProject)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Work:</p>
                  <p className="text-lg font-medium">
                    {projects.find(p => p.id === selectedProject)?.totalWork} meters
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Work:</p>
                  <p className="text-lg font-medium">
                    {projects.find(p => p.id === selectedProject)?.completedWork} meters
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <h2 className="text-2xl font-bold mb-4">Progress Updates</h2>
      {progressUpdates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {progressUpdates.map((progress) => (
            <Card key={progress.id} className={getGradientByIndex(parseInt(progress.id.slice(-2), 16) % 4)}>
              <CardHeader>
                <CardTitle>Update on {formatDate(progress.date)}</CardTitle>
                <CardDescription className="text-foreground/70">
                  {progress.completedWork} meters completed in {progress.timeTaken} hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {progress.photos.slice(0, 3).map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.dataUrl}
                        alt={`Progress photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                        {new Date(photo.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
                {progress.photos.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    + {progress.photos.length - 3} more photos
                  </p>
                )}
                
                {/* Display document count if available */}
                {progress.documents && progress.documents.length > 0 && (
                  <div className="mt-2 p-2 bg-accent/20 rounded-md flex items-center">
                    <File className="h-4 w-4 mr-2" />
                    <p className="text-sm font-medium">{progress.documents.length} document{progress.documents.length > 1 ? 's' : ''} attached</p>
                  </div>
                )}
                
                {progress.vehicleId && (
                  <div className="mt-2 p-2 bg-muted/40 rounded-md">
                    <p className="text-sm font-medium">Vehicle used for this work</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewProgress(progress)}
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
            <CardTitle>No Progress Updates</CardTitle>
            <CardDescription>
              No progress updates found for this project.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/leader/add-progress'}>
              Add Progress
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Progress Detail Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Progress Details</DialogTitle>
            <DialogDescription>
              Update from {selectedProgress && formatDate(selectedProgress.date)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProgress && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Work Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Date:</span> {formatDate(selectedProgress.date)}</p>
                    <p><span className="font-medium">Work Completed:</span> {selectedProgress.completedWork} meters</p>
                    <p><span className="font-medium">Time Taken:</span> {selectedProgress.timeTaken} hours</p>
                    <p>
                      <span className="font-medium">Work Rate:</span> {(selectedProgress.completedWork / selectedProgress.timeTaken).toFixed(2)} meters/hour
                    </p>
                  </div>
                </div>
                
                {selectedVehicle && (
                  <div>
                    <h3 className="font-semibold mb-2">Vehicle Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Vehicle:</span> {selectedVehicle.model}</p>
                      <p><span className="font-medium">Registration:</span> {selectedVehicle.registrationNumber}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedProgress.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <div className="bg-muted/40 p-3 rounded-md">
                    <p className="text-sm">{selectedProgress.notes}</p>
                  </div>
                </div>
              )}
              
              <Tabs defaultValue="photos" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="photos">
                  <div>
                    <h3 className="font-semibold mb-2">Progress Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedProgress.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo.dataUrl}
                            alt={`Progress photo ${index + 1}`}
                            className="w-full object-cover rounded-md"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                            {new Date(photo.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedProgress.photos.length > 0 && selectedProgress.photos[0].location && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Location</h3>
                      <MapView location={selectedProgress.photos[0].location} />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="documents">
                  <div>
                    <h3 className="font-semibold mb-2">Attached Documents</h3>
                    {selectedProgress.documents && selectedProgress.documents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedProgress.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center p-3 bg-muted/30 rounded-lg border border-border">
                            <File className="h-8 w-8 mr-3 text-primary" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(doc.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-auto"
                              onClick={() => window.open(doc.dataUrl, '_blank')}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground bg-muted/20 rounded-md">
                        No documents attached to this update.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              {selectedProgress.startMeterReading && selectedProgress.endMeterReading && (
                <div>
                  <h3 className="font-semibold mb-2">Meter Readings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Start Reading:</p>
                      <div className="relative">
                        <img
                          src={selectedProgress.startMeterReading.dataUrl}
                          alt="Start meter reading"
                          className="w-full max-h-48 object-contain rounded-md"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                          {new Date(selectedProgress.startMeterReading.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">End Reading:</p>
                      <div className="relative">
                        <img
                          src={selectedProgress.endMeterReading.dataUrl}
                          alt="End meter reading"
                          className="w-full max-h-48 object-contain rounded-md"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                          {new Date(selectedProgress.endMeterReading.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaderViewProgress;
