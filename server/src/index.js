const express = require('express');
const cors = require('cors');
const couchbase = require('couchbase');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Couchbase connection
const clusterConnStr = "couchbases://cb.drr3tmw3bgdgggid.cloud.couchbase.com";
const username = "saibalaji";
const password = "Parvathala@97046";
const bucketName = "travel-sample";
const scopeName = "inventory";
const collectionName = "users";

let cluster;
let bucket;
let collection;

async function connectToCouchbase() {
  try {
    cluster = await couchbase.connect(clusterConnStr, {
      username: username,
      password: password,
      configProfile: "wanDevelopment"
    });
    bucket = cluster.bucket(bucketName);
    collection = bucket.scope(scopeName).collection(collectionName);
    console.log('Connected to Couchbase');
  } catch (error) {
    console.error('Failed to connect to Couchbase:', error);
    process.exit(1);
  }
}

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role
    const validRoles = ['admin', 'checker', 'owner', 'leader'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Check if user already exists
    const docId = `user::${email}`;
    try {
      await collection.get(docId);
      return res.status(400).json({ error: 'User already exists' });
    } catch (error) {
      // User doesn't exist, continue with signup
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userDoc = {
      type: 'user',
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    await collection.insert(docId, userDoc);
    res.status(201).json({ 
      success: true, 
      user: {
        id: docId,
        email,
        name,
        role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const docId = `user::${email}`;
    const result = await collection.get(docId);
    
    if (!result.content) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.content;
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.json({
      success: true,
      user: {
        id: docId,
        email: user.email,
        name: user.name,
        role: user.role
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    const docId = `user::${email}`;
    const result = await collection.get(docId);
    
    if (!result.content) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.content;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    await collection.upsert(docId, user);
    res.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

const PORT = process.env.PORT || 3001;

// Connect to Couchbase and start server
connectToCouchbase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 