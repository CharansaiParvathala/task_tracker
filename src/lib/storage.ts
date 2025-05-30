import { User, UserRole, Project, Vehicle, Driver, ProgressUpdate, PaymentRequest, PhotoWithMetadata, PaymentPurpose } from './types';
import { couchbaseStorage } from './couchbaseStorage';

const STORAGE_KEYS = {
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

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.email === email) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.id === id) || null;
}

export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const users = await getUsers();
  return users.filter(user => user.role === role);
}

export async function registerUser(name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; message?: string }> {
  const users = await getUsers();
  
  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return { success: false, message: 'User with this email already exists' };
  }
  
  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role
  };
  
  await couchbaseStorage.createUser(newUser);
  return { success: true };
}

export async function createUser(user: User): Promise<User> {
  return await couchbaseStorage.createUser(user);
}

export async function updateUser(user: User): Promise<void> {
  await couchbaseStorage.createUser(user);
}

export async function deleteUser(id: string): Promise<void> {
  const users = await getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  await Promise.all(filteredUsers.map(user => couchbaseStorage.createUser(user)));
}

// Project Management
export async function getProjects(): Promise<Project[]> {
  return await couchbaseStorage.getProjects();
}

// Alias function for compatibility
export const getAllProjects = getProjects;

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find(project => project.id === id) || null;
}

export async function getProjectsByLeaderId(leaderId: string): Promise<Project[]> {
  return await couchbaseStorage.getProjectsByLeaderId(leaderId);
}

export async function createProject(project: Project): Promise<Project> {
  return await couchbaseStorage.createProject(project);
}

export async function updateProject(project: Project): Promise<void> {
  await couchbaseStorage.createProject(project);
}

// Vehicle Management
export async function getVehicles(): Promise<Vehicle[]> {
  return await couchbaseStorage.getVehicles();
}

// Alias function for compatibility
export const getAllVehicles = getVehicles;

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const vehicles = await getVehicles();
  return vehicles.find(vehicle => vehicle.id === id) || null;
}

export async function createVehicle(vehicle: Vehicle): Promise<Vehicle> {
  return await couchbaseStorage.createVehicle(vehicle);
}

export async function updateVehicle(vehicle: Vehicle): Promise<void> {
  await couchbaseStorage.createVehicle(vehicle);
}

export async function deleteVehicle(id: string): Promise<void> {
  const vehicles = await getVehicles();
  const filteredVehicles = vehicles.filter(vehicle => vehicle.id !== id);
  await Promise.all(filteredVehicles.map(vehicle => couchbaseStorage.createVehicle(vehicle)));
}

// Driver Management
export async function getDrivers(): Promise<Driver[]> {
  return await couchbaseStorage.getDrivers();
}

// Alias function for compatibility
export const getAllDrivers = getDrivers;

export async function getDriverById(id: string): Promise<Driver | null> {
  const drivers = await getDrivers();
  return drivers.find(driver => driver.id === id) || null;
}

export async function createDriver(driver: Driver): Promise<Driver> {
  return await couchbaseStorage.createDriver(driver);
}

export async function updateDriver(driver: Driver): Promise<void> {
  await couchbaseStorage.createDriver(driver);
}

export async function deleteDriver(id: string): Promise<void> {
  const drivers = await getDrivers();
  const filteredDrivers = drivers.filter(driver => driver.id !== id);
  await Promise.all(filteredDrivers.map(driver => couchbaseStorage.createDriver(driver)));
}

// Progress Updates Management
export async function getProgressUpdates(): Promise<ProgressUpdate[]> {
  return await couchbaseStorage.getProgressUpdates();
}

export const getAllProgressUpdates = getProgressUpdates;

export async function getProgressUpdateById(id: string): Promise<ProgressUpdate | null> {
  const updates = await getProgressUpdates();
  return updates.find(update => update.id === id) || null;
}

export async function getProgressUpdatesByProjectId(projectId: string): Promise<ProgressUpdate[]> {
  const updates = await getProgressUpdates();
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

export async function updateProgressUpdate(update: ProgressUpdate): Promise<void> {
  await couchbaseStorage.createProgressUpdate(update);
}

// Payment Requests Management
export async function getPaymentRequests(): Promise<PaymentRequest[]> {
  return await couchbaseStorage.getPaymentRequests();
}

// Alias function for compatibility
export const getAllPaymentRequests = getPaymentRequests;

export async function getPaymentRequestById(id: string): Promise<PaymentRequest | null> {
  const requests = await getPaymentRequests();
  return requests.find(req => req.id === id) || null;
}

export async function getPaymentRequestsByProjectId(projectId: string): Promise<PaymentRequest[]> {
  const requests = await getPaymentRequests();
  return requests.filter(req => req.projectId === projectId);
}

export async function createPaymentRequest(request: PaymentRequest): Promise<PaymentRequest> {
  return await couchbaseStorage.createPaymentRequest(request);
}

export async function updatePaymentRequest(request: PaymentRequest): Promise<void> {
  await couchbaseStorage.createPaymentRequest(request);
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
    id: `link-${Date.now()}`
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
