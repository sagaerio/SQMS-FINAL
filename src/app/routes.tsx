import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { QueueStatus } from "./pages/QueueStatusNew";
import { Services } from "./pages/Services";
import { Appointments } from "./pages/Appointments";
import { Analytics } from "./pages/Analytics";
import { Support } from "./pages/Support";
import { MultiBranch } from "./pages/MultiBranch";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { StaffPortal } from "./pages/StaffPortal";
import { Chat } from "./pages/Chat";
import { EmployeeManagement } from "./pages/EmployeeManagement";
import { BusinessManagement } from "./pages/BusinessManagement";
import { BusinessRequests } from "./pages/BusinessRequests";
import { ErrorBoundary as ErrorBoundaryPage } from "./pages/ErrorBoundary";

export const router = createBrowserRouter([
  // Public routes (no navigation)
  {
    path: "/",
    Component: Home,
    ErrorBoundary: ErrorBoundaryPage,
  },
  {
    path: "/login",
    Component: Login,
    ErrorBoundary: ErrorBoundaryPage,
  },
  {
    path: "/staff-portal",
    Component: StaffPortal,
    ErrorBoundary: ErrorBoundaryPage,
  },
  {
    path: "/signup",
    Component: SignUp,
    ErrorBoundary: ErrorBoundaryPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
    ErrorBoundary: ErrorBoundaryPage,
  },
  // Protected routes (with navigation)
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: ErrorBoundaryPage,
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "admin", Component: AdminDashboard },
      { path: "staff", Component: StaffDashboard },
      { path: "profile", Component: Profile },
      { path: "status", Component: QueueStatus },
      { path: "services", Component: Services },
      { path: "appointments", Component: Appointments },
      { path: "analytics", Component: Analytics },
      { path: "support", Component: Support },
      { path: "chat", Component: Chat },
      { path: "branches", Component: MultiBranch },
      { path: "employees", Component: EmployeeManagement },
      { path: "businesses", Component: BusinessManagement },
      { path: "business-requests", Component: BusinessRequests },
      { path: "*", Component: ErrorBoundaryPage },
    ],
  },
  // Catch-all 404
  {
    path: "*",
    Component: ErrorBoundaryPage,
  },
]);