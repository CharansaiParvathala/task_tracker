import { connect, Cluster, Bucket, Collection } from 'couchbase';

class CouchbaseService {
  private static instance: CouchbaseService;
  private cluster: Cluster | null = null;
  private bucket: Bucket | null = null;
  private collection: Collection | null = null;

  private constructor() {}

  static getInstance(): CouchbaseService {
    if (!CouchbaseService.instance) {
      CouchbaseService.instance = new CouchbaseService();
    }
    return CouchbaseService.instance;
  }

  async connect() {
    try {
      const clusterConnStr = "couchbases://cb.drr3tmw3bgdgggid.cloud.couchbase.com";
      const username = "saibalaji";
      const password = "Parvathal@97046";
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

  async createUser(email: string, password: string, name: string) {
    try {
      if (!this.collection) throw new Error('Not connected to Couchbase');
      
      const userDoc = {
        type: 'user',
        email,
        password, // Note: In production, this should be hashed
        name,
        createdAt: new Date().toISOString(),
      };

      const docId = `user::${email}`;
      await this.collection.insert(docId, userDoc);
      return { success: true, userId: docId };
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async loginUser(email: string, password: string) {
    try {
      if (!this.collection) throw new Error('Not connected to Couchbase');
      
      const docId = `user::${email}`;
      const result = await this.collection.get(docId);
      
      if (!result.content) {
        throw new Error('User not found');
      }

      const user = result.content;
      if (user.password !== password) { // Note: In production, use proper password comparison
        throw new Error('Invalid password');
      }

      return {
        success: true,
        user: {
          id: docId,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async resetPassword(email: string, newPassword: string) {
    try {
      if (!this.collection) throw new Error('Not connected to Couchbase');
      
      const docId = `user::${email}`;
      const result = await this.collection.get(docId);
      
      if (!result.content) {
        throw new Error('User not found');
      }

      const user = result.content;
      user.password = newPassword; // Note: In production, this should be hashed
      
      await this.collection.upsert(docId, user);
      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }
}

export const couchbaseService = CouchbaseService.getInstance(); 