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
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      if (user.password !== password) {
        return {
          success: false,
          error: 'Invalid password'
        };
      }
      
      // Set current user in storage
      setCurrentUser(user);
      
      return {
        success: true,
        user: user
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  },

  async signup(email: string, password: string, name: string, role: UserRole): Promise<AuthResponse> {
    try {
      const result = registerUser(name, email, password, role);
      
      if (!result.success) {
        return {
          success: false,
          error: result.message
        };
      }
      
      // Login the user after successful signup
      return this.login(email, password);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  },

  async resetPassword(email: string, newPassword: string): Promise<AuthResponse> {
    try {
      const user = getUserByEmail(email);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      // Update user's password
      user.password = newPassword;
      setCurrentUser(user);
      
      return {
        success: true,
        user: user
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  },
}; 