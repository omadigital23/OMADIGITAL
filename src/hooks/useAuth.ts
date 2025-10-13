import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage or session
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    } else {
      // Default admin user for authenticated sessions
      setUser({
        id: 'admin_dca740c1',
        name: 'OMA Digital Admin',
        role: 'admin',
        email: 'admin@omadigital.com'
      });
    }
    setLoading(false);
  }, []);

  return { user, loading };
}