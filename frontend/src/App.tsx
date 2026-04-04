import { Toaster } from "react-hot-toast";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";

import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminPanel from "@/pages/admin/AdminPanel";
import FarmerDashboard from "@/pages/farmer/FarmerDashboard";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import VerificationDetails from "@/pages/verifier/VerificationDetails";
import VerifierDashboard from "@/pages/verifier/VerifierDashboard";
import { useAuthStore } from "@/store/authStore";

function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-4xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="surface-panel-strong w-full p-8 text-center sm:p-10">
        <p className="eyebrow text-rose-300">
          Access Restricted
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-white">
          You do not have permission to view this page
        </h1>
        <p className="mt-4 text-slate-300">
          Your account is authenticated, but the requested route is limited to a
          different system role.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            className="button-primary px-6 py-3"
            to="/"
          >
            Return home
          </Link>
          <Link
            className="button-secondary px-6 py-3"
            to="/login"
          >
            Switch account
          </Link>
        </div>
      </section>
    </main>
  );
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const showNavbar = !["/", "/login"].includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-hero-grid">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8%] top-[10%] h-72 w-72 rounded-full bg-accent-green/10 blur-3xl" />
        <div className="absolute right-[-6%] top-[14%] h-[24rem] w-[24rem] rounded-full bg-accent-blue/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] h-[26rem] w-[26rem] rounded-full bg-accent-amber/10 blur-3xl" />
      </div>

      {showNavbar ? (
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
      ) : null}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["farmer"]}>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verifier/dashboard"
          element={
            <ProtectedRoute allowedRoles={["verifier"]}>
              <VerifierDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verifier/verification/:id"
          element={
            <ProtectedRoute allowedRoles={["verifier"]}>
              <VerificationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/panel"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(36, 49, 63, 0.9)",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 22px 56px rgba(26, 36, 49, 0.24)"
          }
        }}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
