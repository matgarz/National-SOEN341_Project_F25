import { createContext, useContext, useState, type ReactNode } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "ORGANIZER" | "ADMIN";
  organizationId?: number | null;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);

      if (typeof parsed === "object" && parsed !== null && "id" in parsed) {
        return parsed as User;
      }

      localStorage.removeItem("user");
      return null;
    } catch {
      // If corrupted data → wipe and return null
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
