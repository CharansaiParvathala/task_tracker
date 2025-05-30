// src/config/couchbase.ts
import { Cluster } from 'couchbase';
import bcrypt from 'bcryptjs';

const COUCHBASE_CONFIG = {
  connectionString: 'couchbases://cb.drr3tmw3bgdgggid.cloud.couchbase.com',
  username: 'saibalaji',
  password: 'Parvathala@97046',
  bucketName: 'users'
};

export const cluster = new Cluster(COUCHBASE_CONFIG.connectionString, {
  username: COUCHBASE_CONFIG.username,
  password: COUCHBASE_CONFIG.password,
  configProfile: 'wanDevelopment'
});

export const usersBucket = cluster.bucket(COUCHBASE_CONFIG.bucketName);
export const usersCollection = usersBucket.defaultCollection();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
