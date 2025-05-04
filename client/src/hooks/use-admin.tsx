import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from './use-toast';
import { apiRequest } from '../lib/queryClient';

// Admin authentication will be handled via API call to the server
// The actual password is stored in an environment variable

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  verifyAdmin: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  // Check localStorage for existing admin status on initialization
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const storedAdmin = localStorage.getItem('isAdmin');
    return storedAdmin === 'true';
  });
  const { toast } = useToast();

  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/admin/verify', { password });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Admin verification error:', error);
      return false;
    }
  };

  const login = async (password: string): Promise<boolean> => {
    const isAuthenticated = await verifyPassword(password);
    
    if (isAuthenticated) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      return true;
    } else {
      toast({
        title: 'Authentication Failed',
        description: 'Incorrect admin password',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  // This function is used to prompt for admin authentication when needed
  const verifyAdmin = async (): Promise<boolean> => {
    // Always ask for password each time editing is attempted
    const password = prompt('Admin password required to edit content:');
    
    // If password is null (user clicked cancel) or empty, return false
    if (!password) return false;
    
    // Verify password via API
    const isAuthenticated = await verifyPassword(password);
    
    if (isAuthenticated) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      return true;
    } else {
      toast({
        title: 'Authentication Failed',
        description: 'Incorrect admin password',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, verifyAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}