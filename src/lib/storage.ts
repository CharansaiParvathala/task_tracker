import { User, UserRole, Project, Vehicle, Driver, ProgressUpdate, PaymentRequest, PhotoWithMetadata, PaymentPurpose } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  USERS: 'sai_balaji_users',
  PROJECTS: 'sai_balaji_projects',
  VEHICLES: 'sai_balaji_vehicles',
  DRIVERS: 'sai_balaji_drivers',
  PROGRESS_UPDATES: 'sai_balaji_progress_updates',
  PAYMENT_REQUESTS: 'sai_balaji_payment_requests',
  CURRENT_USER: 'sai_balaji_current_user',
  BACKUP_LINKS: 'sai_balaji_backup_links'
};

// Initialize the storage with default data
export function initializeStorage() {
  // Create permanent accounts if they don't exist
  const users = getUsers();
  
  // Admin account
  if (!users.some(user => user.email === 'admin@saibalaji.com')) {
    const adminUser: User = {
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@saibalaji.com',
      password: 'admin123',
      role: 'admin'
    };
    users.push(adminUser);
  }
  
  // Checker account
  if (!users.some(user => user.email === 'checker@saibalaji.com')) {
    const checkerUser: User = {
      id: uuidv4(),
      name: 'Checker User',
      email: 'checker@saibalaji.com',
      password: 'checker123',
      role: 'checker'
    };
    users.push(checkerUser);
  }
  
  // Owner account
  if (!users.some(user => user.email === 'owner@saibalaji.com')) {
    const ownerUser: User = {
      id: uuidv4(),
      name: 'Owner User',
      email: 'owner@saibalaji.com',
      password: 'owner123',
      role: 'owner'
    };
    users.push(ownerUser);
  }
  
  // Save updated user list
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Check if other storages need initialization
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.PROGRESS_UPDATES)) {
    localStorage.setItem(STORAGE_KEYS.PROGRESS_UPDATES, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.BACKUP_LINKS)) {
    localStorage.setItem(STORAGE_KEYS.BACKUP_LINKS, JSON.stringify([]));
  }
}

// User Management
export function getUsers(): User[] {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
}

// Alias function for compatibility
export const getAllUsers = getUsers;

export function getCurrentUser(): User | null {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function getUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find(user => user.email === email) || null;
}

export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
}

export function getUsersByRole(role: UserRole): User[] {
  const users = getUsers();
  return users.filter(user => user.role === role);
}

export function registerUser(name: string, email: string, password: string, role: UserRole): { success: boolean; message: string } {
  // Validate role - only allow 'leader' for new registrations
  if (role !== 'leader') {
    return { success: false, message: 'Only team leader registration is allowed.' };
  }
  
  const users = getUsers();
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    return { success: false, message: 'Email already registered.' };
  }
  
  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password,
    role
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  return { success: true, message: 'User registered successfully.' };
}

export function createUser(name: string, email: string, password: string, role: UserRole): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    return { success: false, message: 'Email already registered.' };
  }
  
  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password,
    role
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  return { success: true, message: 'User created successfully.', user: newUser };
}

export function updateUser(user: User): { success: boolean; message: string } {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  if (index === -1) {
    return { success: false, message: 'User not found.' };
  }
  
  users[index] = user;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  return { success: true, message: 'User updated successfully.' };
}

export function deleteUser(id: string): { success: boolean; message: string } {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  
  if (filteredUsers.length === users.length) {
    return { success: false, message: 'User not found.' };
  }
  
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
  
  return { success: true, message: 'User deleted successfully.' };
}

// Project Management
export function getProjects(): Project[] {
  const projects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return projects ? JSON.parse(projects) : [];
}

// Alias function for compatibility
export const getAllProjects = getProjects;

export function getProjectById(id: string | undefined): Project | null {
  if (!id) return null;
  const projects = getProjects();
  return projects.find(project => project.id === id) || null;
}

export function getProjectsByLeaderId(leaderId: string): Project[] {
  const projects = getProjects();
  return projects.filter(project => project.leaderId === leaderId);
}

export function createProject(project: Omit<Project, 'id'>): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: uuidv4(),
    completedWork: 0
  };
  
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  return newProject;
}

export function updateProject(project: Project): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  
  if (index !== -1) {
    projects[index] = project;
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }
}

// Vehicle Management
export function getVehicles(): Vehicle[] {
  const vehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
  return vehicles ? JSON.parse(vehicles) : [];
}

// Alias function for compatibility
export const getAllVehicles = getVehicles;

export function getVehicleById(id: string | undefined): Vehicle | null {
  if (!id) return null;
  const vehicles = getVehicles();
  return vehicles.find(vehicle => vehicle.id === id) || null;
}

export function createVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle {
  const vehicles = getVehicles();
  const newVehicle: Vehicle = {
    ...vehicle,
    id: uuidv4()
  };
  
  vehicles.push(newVehicle);
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  return newVehicle;
}

export function updateVehicle(vehicle: Vehicle): void {
  const vehicles = getVehicles();
  const index = vehicles.findIndex(v => v.id === vehicle.id);
  
  if (index !== -1) {
    vehicles[index] = vehicle;
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }
}

export function deleteVehicle(id: string): void {
  const vehicles = getVehicles();
  const filteredVehicles = vehicles.filter(vehicle => vehicle.id !== id);
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(filteredVehicles));
}

// Driver Management
export function getDrivers(): Driver[] {
  const drivers = localStorage.getItem(STORAGE_KEYS.DRIVERS);
  return drivers ? JSON.parse(drivers) : [];
}

// Alias function for compatibility
export const getAllDrivers = getDrivers;

export function getDriverById(id: string): Driver | null {
  const drivers = getDrivers();
  return drivers.find(driver => driver.id === id) || null;
}

export function createDriver(driver: Omit<Driver, 'id'>): Driver {
  const drivers = getDrivers();
  const newDriver: Driver = {
    ...driver,
    id: uuidv4()
  };
  
  drivers.push(newDriver);
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  return newDriver;
}

export function updateDriver(driver: Driver): void {
  const drivers = getDrivers();
  const index = drivers.findIndex(d => d.id === driver.id);
  
  if (index !== -1) {
    drivers[index] = driver;
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  }
}

export function deleteDriver(id: string): void {
  const drivers = getDrivers();
  const filteredDrivers = drivers.filter(driver => driver.id !== id);
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(filteredDrivers));
}

// Progress Updates Management
export function getProgressUpdates(): ProgressUpdate[] {
  const updates = localStorage.getItem(STORAGE_KEYS.PROGRESS_UPDATES);
  return updates ? JSON.parse(updates) : [];
}

// Alias function for compatibility
export const getAllProgressUpdates = getProgressUpdates;

export function getProgressUpdateById(id: string | undefined): ProgressUpdate | null {
  if (!id) return null;
  const updates = getProgressUpdates();
  return updates.find(update => update.id === id) || null;
}

export function getProgressUpdatesByProjectId(projectId: string): ProgressUpdate[] {
  const updates = getProgressUpdates();
  return updates.filter(update => update.projectId === projectId);
}

export function createProgressUpdate(update: Omit<ProgressUpdate, 'id'>): ProgressUpdate {
  const updates = getProgressUpdates();
  const newUpdate: ProgressUpdate = {
    ...update,
    id: uuidv4()
  };
  
  updates.push(newUpdate);
  localStorage.setItem(STORAGE_KEYS.PROGRESS_UPDATES, JSON.stringify(updates));
  
  // Update project's completed work
  const project = getProjectById(update.projectId);
  if (project) {
    project.completedWork += update.completedWork;
    updateProject(project);
  }
  
  return newUpdate;
}

// Alias for compatibility
export const addProgressUpdate = createProgressUpdate;

export function updateProgressUpdate(update: ProgressUpdate): void {
  const updates = getProgressUpdates();
  const index = updates.findIndex(u => u.id === update.id);
  
  if (index !== -1) {
    const oldUpdate = updates[index];
    updates[index] = update;
    localStorage.setItem(STORAGE_KEYS.PROGRESS_UPDATES, JSON.stringify(updates));
    
    // Update project's completed work
    const project = getProjectById(update.projectId);
    if (project && oldUpdate.completedWork !== update.completedWork) {
      project.completedWork = project.completedWork - oldUpdate.completedWork + update.completedWork;
      updateProject(project);
    }
  }
}

// Payment Requests Management
export function getAllPaymentRequests(): PaymentRequest[] {
  const requests = localStorage.getItem(STORAGE_KEYS.PAYMENT_REQUESTS);
  return requests ? JSON.parse(requests) : [];
}

export function getPaymentRequestById(id: string): PaymentRequest | null {
  const requests = getAllPaymentRequests();
  return requests.find(req => req.id === id) || null;
}

export function getPaymentRequestsByProjectId(projectId: string): PaymentRequest[] {
  const requests = getAllPaymentRequests();
  return requests.filter(req => req.projectId === projectId);
}

export function createPaymentRequest(request: Omit<PaymentRequest, 'id'>): PaymentRequest {
  const requests = getAllPaymentRequests();
  const newRequest: PaymentRequest = {
    ...request,
    id: uuidv4()
  };
  
  requests.push(newRequest);
  localStorage.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(requests));
  return newRequest;
}

export function updatePaymentRequest(request: PaymentRequest): void {
  const requests = getAllPaymentRequests();
  const index = requests.findIndex(r => r.id === request.id);
  
  if (index !== -1) {
    requests[index] = request;
    localStorage.setItem(STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(requests));
  }
}

// Backup Links Management
export interface BackupLink {
  id: string;
  url: string;
  description: string;
  createdAt: string;
  createdBy: string;
}

export function getAllBackupLinks(): BackupLink[] {
  const links = localStorage.getItem(STORAGE_KEYS.BACKUP_LINKS);
  return links ? JSON.parse(links) : [];
}

export function createBackupLink(link: Omit<BackupLink, 'id'>): BackupLink {
  const links = getAllBackupLinks();
  const newLink: BackupLink = {
    ...link,
    id: uuidv4()
  };
  
  links.push(newLink);
  localStorage.setItem(STORAGE_KEYS.BACKUP_LINKS, JSON.stringify(links));
  return newLink;
}

export function deleteBackupLink(id: string): void {
  const links = getAllBackupLinks();
  const filteredLinks = links.filter(link => link.id !== id);
  localStorage.setItem(STORAGE_KEYS.BACKUP_LINKS, JSON.stringify(filteredLinks));
}

// Leader Progress Stats
export function getLeaderProgressStats() {
  const users = getUsers();
  const projects = getProjects();
  const progressUpdates = getProgressUpdates();
  
  const leaders = users.filter(user => user.role === 'leader');
  
  return leaders.map(leader => {
    const leaderProjects = projects.filter(project => project.leaderId === leader.id);
    const leaderUpdates = progressUpdates.filter(update => 
      leaderProjects.some(project => project.id === update.projectId)
    );
    
    const totalDistance = leaderProjects.reduce((sum, project) => sum + project.completedWork, 0);
    const totalTime = leaderUpdates.reduce((sum, update) => sum + update.timeTaken, 0);
    
    const totalWorkRequired = leaderProjects.reduce((sum, project) => sum + project.totalWork, 0);
    const completionPercentage = totalWorkRequired > 0 
      ? Math.round((totalDistance / totalWorkRequired) * 100) 
      : 0;
    
    return {
      leaderId: leader.id,
      leaderName: leader.name,
      projectCount: leaderProjects.length,
      totalDistance,
      totalTime,
      completionPercentage,
      recentUpdates: leaderUpdates.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 5)
    };
  });
}

// Utility functions
export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  // Default location (Bangalore)
  const defaultLocation = {
    latitude: 12.9716,
    longitude: 77.5946
  };
  
  // For demo purposes, return the default location
  // In a real app, this would use the browser's geolocation API
  return Promise.resolve(defaultLocation);
}

export function generateExportData() {
  const data = {
    projects: getProjects(),
    progressUpdates: getProgressUpdates(),
    paymentRequests: getAllPaymentRequests(),
    vehicles: getVehicles(),
    drivers: getDrivers()
  };
  
  return data;
}
