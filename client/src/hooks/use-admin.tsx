import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from './use-toast';

// Hardcoded admin password - in a real app, this would be handled on the server
const ADMIN_PASSWORD = 'kit@123'; // Must be exactly this value

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
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

  const login = (password: string): boolean => {
    // Make sure we're doing an exact match
    if (password === ADMIN_PASSWORD) {
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
    
    // Direct check for the specific password
    if (password === ADMIN_PASSWORD) {
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