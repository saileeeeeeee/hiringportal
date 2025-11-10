import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Moon, Sun, Menu, X, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/authSlice';
import { useTheme } from '@/contexts/ThemeContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const navLinkClass = (path: string) =>
    `transition-colors ${
      location.pathname === path
        ? 'text-primary font-medium'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  const isHR = user?.role === 'HR' || user?.role === 'Management';

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/hr/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline">UBTI</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link to="/" className={navLinkClass('/')}>
                  Home
                </Link>
                <Link to="/jobs" className={navLinkClass('/jobs')}>
                  Browse Jobs
                </Link>
              </>
            ) : (
              <>
                <Link to="/hr/dashboard" className={navLinkClass('/hr/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/hr/jobs" className={navLinkClass('/hr/jobs')}>
                  Jobs
                </Link>
                <Link to="/hr/applicants" className={navLinkClass('/hr/applicants')}>
                  Applicants
                </Link>
                {isHR && (
                  <Link to="/hr/interviews" className={navLinkClass('/hr/interviews')}>
                    Interviews
                  </Link>
                )}

                {/* Create Job Button - Only for HR */}
                {isHR && (
                  <Link
                    to="/hr/jobs/new"  // Recommended: use /new route
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden lg:inline">Create Job</span>
                    <span className="lg:hidden">New</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user.full_name || user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-border pt-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="block px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/jobs"
                  className="block px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/hr/dashboard"
                  className="block px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/hr/jobs"
                  className="block px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Jobs
                </Link>
                <Link
                  to="/hr/applicants"
                  className="block px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Applicants
                </Link>
                {isHR && (
                  <Link
                    to="/hr/interviews"
                    className="block px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Interviews
                  </Link>
                )}

                {/* Create Job in Mobile */}
                {isHR && (
                  <Link
                    to="/hr/jobs/new"
                    className="block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-center flex items-center justify-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Plus className="w-4 h-4" />
                    Create Job
                  </Link>
                )}

                <div className="border-t border-border pt-2 mt-2">
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    {user.full_name || user.username} ({user.role})
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-secondary rounded-lg transition-colors text-destructive"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}