import "./global.css";
import "./i18n/config";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Home from "./pages/Home";
import PublicJobs from "./pages/PublicJobs";
import JobDetails from "./pages/JobDetails";
import ApplyJob from "./pages/ApplyJob";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Applicants from "./pages/Applicants";
import Interviews from "./pages/Interviews";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<PublicJobs />} />
              <Route path="/jobs/:jobId" element={<JobDetails />} />
              <Route path="/apply/:jobId" element={<ApplyJob />} />
              <Route path="/login" element={<Login />} />

              {/* HR Routes (Now open to all users, no restrictions) */}
              <Route path="/hr/dashboard" element={<Dashboard />} />
              <Route path="/hr/jobs" element={<Jobs />} />
              <Route path="/hr/applicants" element={<Applicants />} />
              <Route path="/hr/interviews" element={<Interviews />} />

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </Provider>
);

createRoot(document.getElementById("root")!).render(<App />);
