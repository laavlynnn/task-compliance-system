import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import TaskForm from "./pages/TaskForm";
import RequirementSubmit from "./pages/RequirementSubmit";
import Submissions from "./pages/Submissions";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navbar />
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Navbar />
            <Tasks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks/create"
        element={
          <ProtectedRoute adminOnly>
            <Navbar />
            <TaskForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks/:id/edit"
        element={
          <ProtectedRoute adminOnly>
            <Navbar />
            <TaskForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks/:id"
        element={
          <ProtectedRoute>
            <Navbar />
            <TaskDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/requirements/:id/submit"
        element={
          <ProtectedRoute>
            <Navbar />
            <RequirementSubmit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <ProtectedRoute adminOnly>
            <Navbar />
            <Submissions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute adminOnly>
            <Navbar />
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Navbar />
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <Navigate to="/dashboard" replace />
        }
      />

      <Route
        path="*"
        element={
          <Navigate to="/dashboard" replace />
        }
      />
    </Routes>
  );
}

export default App;