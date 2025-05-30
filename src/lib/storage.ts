import { User, UserRole, Project, Vehicle, Driver, ProgressUpdate, PaymentRequest, PhotoWithMetadata, PaymentPurpose } from './types';
import { v4 as uuidv4 } from 'uuid';
import { couchbaseStorage } from './couchbaseStorage';

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
export async function initializeStorage() {
  try {
    // Connect to Couchbase
    await couchbaseStorage.connect();
    
    // Create permanent accounts if they don't exist
    const users = await couchbaseStorage.getUsers();
    
    // Admin account
    if (!users.some(user => user.email === 'admin@saibalaji.com')) {
      const adminUser: User = {
        id: `admin-${Date.now()}`,
        name: 'Admin User',
        email: 'admin@saibalaji.com',
        password: 'admin123',
        role: 'admin'
      };
      await couchbaseStorage.createUser(adminUser);
    }
    
    // Checker account
    if (!users.some(user => user.email === 'checker@saibalaji.com')) {
      const checkerUser: User = {
        id: `checker-${Date.now()}`,
        name: 'Checker User',
        email: 'checker@saibalaji.com',
        password: 'checker123',
        role: 'checker'
      };
      await couchbaseStorage.createUser(checkerUser);
    }
    
    // Owner account
    if (!users.some(user => user.email === 'owner@saibalaji.com')) {
      const ownerUser: User = {
        id: `owner-${Date.now()}`,
        name: 'Owner User',
        email: 'owner@saibalaji.com',
        password: 'owner123',
        role: 'owner'
      };
      await couchbaseStorage.createUser(ownerUser);
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
}

// User Management
export async function getUsers(): Promise<User[]> {
  return await couchbaseStorage.getUsers();
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

export function registerUser(name: string, email: string, password: string, role: UserRole): { success: boolean; message?: string } {
  const users = getUsers();
  
  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return { success: false, message: 'User with this email already exists' };
  }
  
  // Create new user
  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password,
    role
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  return { success: true };
}

export async function createUser(user: User): Promise<User> {
  return await couchbaseStorage.createUser(user);
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
export async function getProjects(): Promise<Project[]> {
  return await couchbaseStorage.getProjects();
}

// Alias function for compatibility
export const getAllProjects = getProjects;

export function getProjectById(id: string | undefined): Project | null {
  if (!id) return null;
  const projects = getProjects();
  return projects.find(project => project.id === id) || null;
}

export async function getProjectsByLeaderId(leaderId: string): Promise<Project[]> {
  return await couchbaseStorage.getProjectsByLeaderId(leaderId);
}

export async function createProject(project: Project): Promise<Project> {
  return await couchbaseStorage.createProject(project);
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
export async function getVehicles(): Promise<Vehicle[]> {
  return await couchbaseStorage.getVehicles();
}

// Alias function for compatibility
export const getAllVehicles = getVehicles;

export function getVehicleById(id: string | undefined): Vehicle | null {
  if (!id) return null;
  const vehicles = getVehicles();
  return vehicles.find(vehicle => vehicle.id === id) || null;
}

export async function createVehicle(vehicle: Vehicle): Promise<Vehicle> {
  return await couchbaseStorage.createVehicle(vehicle);
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
export async function getDrivers(): Promise<Driver[]> {
  return await couchbaseStorage.getDrivers();
}

// Alias function for compatibility
export const getAllDrivers = getDrivers;

export function getDriverById(id: string): Driver | null {
  const drivers = getDrivers();
  return drivers.find(driver => driver.id === id) || null;
}

export async function createDriver(driver: Driver): Promise<Driver> {
  return await couchbaseStorage.createDriver(driver);
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
export async function getProgressUpdates(): Promise<ProgressUpdate[]> {
  return await couchbaseStorage.getProgressUpdates();
}

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

// Utility function to compress image
async function compressImage(dataUrl: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with reduced quality
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedDataUrl);
    };
    img.onerror = reject;
  });
}

export async function createProgressUpdate(update: ProgressUpdate): Promise<ProgressUpdate> {
  return await couchbaseStorage.createProgressUpdate(update);
}

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
export async function getPaymentRequests(): Promise<PaymentRequest[]> {
  return await couchbaseStorage.getPaymentRequests();
}

export function getPaymentRequestById(id: string): PaymentRequest | null {
  const requests = getPaymentRequests();
  return requests.find(req => req.id === id) || null;
}

export function getPaymentRequestsByProjectId(projectId: string): PaymentRequest[] {
  const requests = getPaymentRequests();
  return requests.filter(req => req.projectId === projectId);
}

export async function createPaymentRequest(request: PaymentRequest): Promise<PaymentRequest> {
  return await couchbaseStorage.createPaymentRequest(request);
}

export function updatePaymentRequest(request: PaymentRequest): void {
  const requests = getPaymentRequests();
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
export async function getLeaderProgressStats(): Promise<any> {
  return await couchbaseStorage.getLeaderProgressStats();
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
    paymentRequests: getPaymentRequests(),
    vehicles: getVehicles(),
    drivers: getDrivers()
  };
  
  return data;
}

export async function getPaymentRequestById(id: string): Promise<PaymentRequest | null> {
  const requests = await getPaymentRequests();
  return requests.find(req => req.id === id) || null;
}

export async function getPaymentRequestsByProjectId(projectId: string): Promise<PaymentRequest[]> {
  const requests = await getPaymentRequests();
  return requests.filter(req => req.projectId === projectId);
}

export async function updatePaymentRequest(request: PaymentRequest): Promise<void> {
  await couchbaseStorage.createPaymentRequest(request);
}

export async function updateProgressUpdate(update: ProgressUpdate): Promise<void> {
  await couchbaseStorage.createProgressUpdate(update);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find(p => p.id === id) || null;
}

export async function updateProject(project: Project): Promise<void> {
  await couchbaseStorage.createProject(project);
}

export async function getBackupData(): Promise<{
  users: User[];
  projects: Project[];
  progressUpdates: ProgressUpdate[];
  paymentRequests: PaymentRequest[];
  vehicles: Vehicle[];
  drivers: Driver[];
}> {
  return {
    users: await getUsers(),
    projects: await getProjects(),
    progressUpdates: await getProgressUpdates(),
    paymentRequests: await getPaymentRequests(),
    vehicles: await getVehicles(),
    drivers: await getDrivers()
  };
}
