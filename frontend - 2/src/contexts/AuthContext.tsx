import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  completeProfile: (role: UserRole, preferences?: ProfilePreferences) => void;
}

interface ProfilePreferences {
  preferredLocation?: string;
  budgetMin?: number;
  budgetMax?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data returned from MyDigital ID
const mockMyDigitalIdResponse = {
  ic: '950101-01-1234',
  name: 'Ahmad Bin Abdullah',
  age: 29,
  gender: 'male' as const,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rentsafe_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async () => {
    setIsLoading(true);
    // Simulate MyDigital ID redirect and callback
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newUser: User = {
      ...mockMyDigitalIdResponse,
      profileComplete: false,
    };
    
    setUser(newUser);
    localStorage.setItem('rentsafe_user', JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('rentsafe_user');
  }, []);

  const completeProfile = useCallback(
    (role: UserRole, preferences?: ProfilePreferences) => {
      if (!user) return;
      
      const updatedUser: User = {
        ...user,
        role,
        preferredLocation: preferences?.preferredLocation || user.preferredLocation,
        budgetMin: preferences?.budgetMin ?? user.budgetMin,
        budgetMax: preferences?.budgetMax ?? user.budgetMax,
        profileComplete: true,
      };
      
      setUser(updatedUser);
      localStorage.setItem('rentsafe_user', JSON.stringify(updatedUser));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        completeProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
