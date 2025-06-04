const API_BASE_URL = 'http://localhost:3001/api';

const defaultOptions = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  async createProject(project: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(project),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async signup(email: string, password: string, name: string, role: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify({ email, password, name, role }),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async resetPassword(email: string, newPassword: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Test server connection
  async testConnection() {
    try {
      const response = await fetch('http://localhost:3001/test', {
        ...defaultOptions,
        method: 'GET',
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Server connection test failed:', error);
      throw error;
    }
  }
}; 