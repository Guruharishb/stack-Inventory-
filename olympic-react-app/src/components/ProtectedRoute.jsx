import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getRole } from "../utils/auth";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const role = getRole();

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect unauthorized users
    return <Navigate to="/billing" replace />;
  }

  return children ?? <Outlet />;
}
