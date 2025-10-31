import React, { useEffect, useState } from "react";
import { useAuth } from "../layout/AuthProvider";
import Login from "./Login";

const RequireLogin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  return <>{children}</>;
};

export default RequireLogin;
