import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Purchase from "./pages/purchase.jsx";
import Login from "./pages/login.jsx";
import OwnerDashboard from "./pages/OwnerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Billing from "./pages/Billing";
import Sales from "./pages/Sales.jsx";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  // ✅ Declare currentUser inside the component
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user from localStorage on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Owner-only route */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute user={currentUser} allowedRoles={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Employee + Owner */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute user={currentUser} allowedRoles={["owner"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute user={currentUser} allowedRoles={["employee", "owner"]}>
              <Billing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <ProtectedRoute user={currentUser} allowedRoles={["employee", "owner"]}>
              <Sales />
            </ProtectedRoute>
          }
        />
         <Route path="/purchase" element={
          <ProtectedRoute user={currentUser} allowedRoles={["owner"]}>
          <Purchase /> 
          </ProtectedRoute>}/>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
