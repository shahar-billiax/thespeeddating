"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface AdminCountryContextValue {
  countryId: number;
  countryCode: string;
  setAdminCountry: (countryId: number, countryCode: string) => void;
}

const AdminCountryContext = createContext<AdminCountryContextValue>({
  countryId: 1,
  countryCode: "gb",
  setAdminCountry: () => {},
});

const COOKIE_NAME = "admin_country";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function AdminCountryProvider({
  initialCountryId,
  initialCountryCode,
  children,
}: {
  initialCountryId: number;
  initialCountryCode: string;
  children: ReactNode;
}) {
  const [countryId, setCountryId] = useState(initialCountryId);
  const [countryCode, setCountryCode] = useState(initialCountryCode);

  const setAdminCountry = useCallback((id: number, code: string) => {
    document.cookie = `${COOKIE_NAME}=${id}:${code}; path=/admin; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    setCountryId(id);
    setCountryCode(code);
  }, []);

  return (
    <AdminCountryContext.Provider
      value={{ countryId, countryCode, setAdminCountry }}
    >
      {children}
    </AdminCountryContext.Provider>
  );
}

export function useAdminCountry() {
  return useContext(AdminCountryContext);
}
