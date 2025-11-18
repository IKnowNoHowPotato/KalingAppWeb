import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Login from "./login.jsx";
import DashboardPanel from "./DashboardPanel.jsx";
import TeacherRegister from "./TeacherRegister.jsx";
import QuizPanel from "./panels/QuizPanel.jsx";


// ✅ Check if user is logged in (dummy)
const ProtectedRoute = ({ children }) => {
  const currentUser = localStorage.getItem("currentUser");
  return currentUser ? children : <Navigate to="/login" />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/create"
          element={
            <ProtectedRoute>
              <QuizPanel teacherCode={JSON.parse(localStorage.getItem("currentUser"))?.teacherCode} />
            </ProtectedRoute>
          }
        />

        {/* Public route for teacher registration */}
        <Route path="/register-teacher" element={<TeacherRegister />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
