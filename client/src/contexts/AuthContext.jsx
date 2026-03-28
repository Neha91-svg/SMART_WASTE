import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState('Admin'); // Default to Admin for screenshots
  const [user, setUser] = useState({ name: 'System Admin' });
  
  const logout = () => { console.log('Logged out'); };

  return (
    <AuthContext.Provider value={{ role, setRole, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
