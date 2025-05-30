import { User, UserRole } from './types';
import { getUserByEmail, registerUser, setCurrentUser, logoutUser } from './storage';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const user = getUserByEmail(email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.password !== password) {
        throw new Error('Invalid password');
      }
      
      // Set current user in storage
      setCurrentUser(user);
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      throw error;
    }
  },

  async signup(email: string, password: string, name: string, role: UserRole): Promise<AuthResponse> {
    try {
      const result = registerUser(name, email, password, role);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Login the user after successful signup
      return this.login(email, password);
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email: string, newPassword: string): Promise<AuthResponse> {
    try {
      const user = getUserByEmail(email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update user's password
      user.password = newPassword;
      setCurrentUser(user);
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      throw error;
    }
  },
}; 