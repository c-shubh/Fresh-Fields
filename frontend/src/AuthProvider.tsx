import type { AuthApiTypes } from "@backend/controller/auth";
import { PropsWithChildren, createContext, useEffect, useState } from "react";

type LoginResponse = AuthApiTypes["login"]["response"]["data"];

interface DefaultValue {
  account: LoginResponse | null;
  isLoggedIn: boolean;
  setAccount: (a: LoginResponse) => void;
  logout: () => void;
}

const STORAGE_KEY = "account";

export const AuthContext = createContext<DefaultValue>({
  account: null,
  isLoggedIn: false,
  setAccount: () => {},
  logout: () => {},
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [account, setAcc] = useState<LoginResponse | null>(null);

  // Check for existing user data in localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) setAcc(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // To prevent corrupted data
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const setAccount = (account: LoginResponse) => {
    setAcc(account);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  };

  const logout = () => {
    setAcc(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    account,
    isLoggedIn: Boolean(account),
    setAccount,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
