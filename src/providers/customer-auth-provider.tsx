"use client";

import * as React from "react";

type CustomerAuthContextValue = {
  isLoggedIn: boolean;
  userLabel: string;
  login: () => void;
  logout: () => void;
};

const CustomerAuthContext = React.createContext<CustomerAuthContextValue | null>(
  null
);

export function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const value = React.useMemo(
    () => ({
      isLoggedIn,
      userLabel: "Alex Driver",
      login: () => setIsLoggedIn(true),
      logout: () => setIsLoggedIn(false),
    }),
    [isLoggedIn]
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = React.useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}
