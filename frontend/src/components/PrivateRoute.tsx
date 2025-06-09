import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Check for token in localStorage
  const token = localStorage.getItem("token");

  // If there's no token, redirect to auth page
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // If there is a token, render the protected component
  return <>{children}</>;
};

export default PrivateRoute;
