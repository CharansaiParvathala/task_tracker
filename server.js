const express = require('express');
const cors = require('cors');
const { connect, Cluster, Bucket, Collection } = require('couchbase');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:8080', // Your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Couchbase connection
let cluster = null;
let bucket = null;
let collection = null;

async function connectToCouchbase() {
  try {
    const clusterConnStr = "couchbases://cb.drr3tmw3bgdgggid.cloud.couchbase.com";
    const username = "saibalaji";
    const password = "Parvathal@97046";
    const bucketName = "travel-sample";

    console.log('Connecting to Couchbase...');
    cluster = await connect(clusterConnStr, {
      username,
      password,
    });

    bucket = cluster.bucket(bucketName);
    collection = bucket.defaultCollection();
    
    console.log('Connected to Couchbase successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to Couchbase:', error);
    throw error;
  }
}

// Initialize Couchbase connection
connectToCouchbase().catch(console.error);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Project creation endpoint
app.post('/api/projects', async (req, res) => {
  console.log('Received project creation request:', JSON.stringify(req.body, null, 2));
  
  try {
    if (!collection) {
      console.log('Collection not initialized, attempting to connect...');
      await connectToCouchbase();
    }

    const project = req.body;
    
    // Validate required fields
    if (!project.name) {
      console.log('Project name is missing');
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    if (!project.workers) {
      console.log('Number of workers is missing');
      return res.status(400).json({
        success: false,
        error: 'Number of workers is required'
      });
    }

    if (!project.totalWork) {
      console.log('Total work distance is missing');
      return res.status(400).json({
        success: false,
        error: 'Total work distance is required'
      });
    }

    // Generate a unique ID if not provided
    if (!project.id) {
      project.id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    const docId = `project::${project.id}`;
    console.log('Creating project with ID:', docId);
    
    const projectDoc = {
      ...project,
      type: 'project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ensure these fields are present
      numberOfWorkers: project.workers,
      totalWorkDistance: project.totalWork,
      completedWork: project.completedWork || 0,
      status: project.status || 'active'
    };

    console.log('Project document to be inserted:', JSON.stringify(projectDoc, null, 2));
    
    await collection.insert(docId, projectDoc);

    console.log('Project created successfully');
    res.json({ 
      success: true, 
      projectId: docId,
      project: projectDoc
    });
  } catch (error) {
    console.error('Failed to create project:', error);
    // Check if it's a duplicate key error
    if (error.message && error.message.includes('already exists')) {
      return res.status(409).json({ 
        success: false, 
        error: 'A project with this ID already exists' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create project',
      details: error.toString()
    });
  }
});

// User authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  console.log('Received login request:', req.body);
  
  try {
    if (!collection) {
      await connectToCouchbase();
    }

    const { email, password } = req.body;
    const docId = `user::${email}`;
    const result = await collection.get(docId);
    
    if (!result.content) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = result.content;
    if (user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    res.json({
      success: true,
      user: {
        id: docId,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  console.log('Received signup request:', req.body);
  
  try {
    if (!collection) {
      await connectToCouchbase();
    }

    const { email, password, name, role } = req.body;
    const docId = `user::${email}`;
    
    const userDoc = {
      type: 'user',
      email,
      password,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    await collection.insert(docId, userDoc);
    res.json({ success: true, userId: docId });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  console.log('Received password reset request:', req.body);
  
  try {
    if (!collection) {
      await connectToCouchbase();
    }

    const { email, newPassword } = req.body;
    const docId = `user::${email}`;
    const result = await collection.get(docId);
    
    if (!result.content) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = result.content;
    user.password = newPassword;
    
    await collection.upsert(docId, user);
    res.json({ success: true });
  } catch (error) {
    console.error('Password reset failed:', error);
    res.status(500).json({ success: false, error: 'Password reset failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Handle 404 errors
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint available at http://localhost:${PORT}/test`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
}); 