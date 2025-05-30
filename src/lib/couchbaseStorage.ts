import { connect, Cluster, Bucket, Collection } from 'couchbase';
import { User, UserRole, Project, Vehicle, Driver, ProgressUpdate, PaymentRequest, PhotoWithMetadata, PaymentPurpose } from './types';
import { v4 as uuidv4 } from 'uuid';

class CouchbaseStorageService {
  private static instance: CouchbaseStorageService;
  private cluster: Cluster | null = null;
  private bucket: Bucket | null = null;
  private collection: Collection | null = null;

  private constructor() {}

  static getInstance(): CouchbaseStorageService {
    if (!CouchbaseStorageService.instance) {
      CouchbaseStorageService.instance = new CouchbaseStorageService();
    }
    return CouchbaseStorageService.instance;
  }

  async connect() {
    try {
      const clusterConnStr = "couchbases://cb.drr3tmw3bgdgggid.cloud.couchbase.com";
      const username = "saibalaji";
      const password = "Parvathala@97046";
      const bucketName = "travel-sample";

      this.cluster = await connect(clusterConnStr, {
        username,
        password,
      });

      this.bucket = this.cluster.bucket(bucketName);
      this.collection = this.bucket.defaultCollection();
      
      console.log('Connected to Couchbase');
      return true;
    } catch (error) {
      console.error('Failed to connect to Couchbase:', error);
      throw error;
    }
  }

  // User Management
  async getUsers(): Promise<User[]> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const query = 'SELECT * FROM `travel-sample` WHERE type = "user"';
    const result = await this.cluster?.query(query);
    return result?.rows || [];
  }

  async createUser(user: User): Promise<User> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const docId = `user::${user.email}`;
    await this.collection.insert(docId, { ...user, type: 'user' });
    return user;
  }

  // Project Management
  async getProjects(): Promise<Project[]> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const query = 'SELECT * FROM `travel-sample` WHERE type = "project"';
    const result = await this.cluster?.query(query);
    return result?.rows || [];
  }

  async createProject(project: Project): Promise<Project> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const docId = `project::${project.id}`;
    await this.collection.insert(docId, { ...project, type: 'project' });
    return project;
  }

  // Progress Updates
  async getProgressUpdates(): Promise<ProgressUpdate[]> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const query = 'SELECT * FROM `travel-sample` WHERE type = "progress_update"';
    const result = await this.cluster?.query(query);
    return result?.rows || [];
  }

  async createProgressUpdate(update: ProgressUpdate): Promise<ProgressUpdate> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const docId = `progress::${update.id}`;
    await this.collection.insert(docId, { ...update, type: 'progress_update' });
    return update;
  }

  // Payment Requests
  async getPaymentRequests(): Promise<PaymentRequest[]> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const query = 'SELECT * FROM `travel-sample` WHERE type = "payment_request"';
    const result = await this.cluster?.query(query);
    return result?.rows || [];
  }

  async createPaymentRequest(request: PaymentRequest): Promise<PaymentRequest> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const docId = `payment::${request.id}`;
    await this.collection.insert(docId, { ...request, type: 'payment_request' });
    return request;
  }

  // Vehicle Management
  async getVehicles(): Promise<Vehicle[]> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const query = 'SELECT * FROM `travel-sample` WHERE type = "vehicle"';
    const result = await this.cluster?.query(query);
    return result?.rows || [];
  }

  async createVehicle(vehicle: Vehicle): Promise<Vehicle> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const docId = `vehicle::${vehicle.id}`;
    await this.collection.insert(docId, { ...vehicle, type: 'vehicle' });
    return vehicle;
  }

  // Driver Management
  async getDrivers(): Promise<Driver[]> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const query = 'SELECT * FROM `travel-sample` WHERE type = "driver"';
    const result = await this.cluster?.query(query);
    return result?.rows || [];
  }

  async createDriver(driver: Driver): Promise<Driver> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const docId = `driver::${driver.id}`;
    await this.collection.insert(docId, { ...driver, type: 'driver' });
    return driver;
  }

  // Helper Methods
  async getProjectsByLeaderId(leaderId: string): Promise<Project[]> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const query = 'SELECT * FROM `travel-sample` WHERE type = "project" AND leaderId = $leaderId';
    const result = await this.cluster?.query(query, { parameters: { leaderId } });
    return result?.rows || [];
  }

  async getLeaderProgressStats(): Promise<any> {
    if (!this.collection) throw new Error('Not connected to Couchbase');
    const query = `
      SELECT 
        p.leaderId,
        COUNT(p.id) as totalProjects,
        SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as completedProjects
      FROM \`travel-sample\` p
      WHERE p.type = "project"
      GROUP BY p.leaderId
    `;
    const result = await this.cluster?.query(query);
    return result?.rows || [];
  }
}

export const couchbaseStorage = CouchbaseStorageService.getInstance(); 