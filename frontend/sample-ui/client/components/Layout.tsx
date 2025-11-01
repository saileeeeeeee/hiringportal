import { Link } from "react-router-dom";
import { Briefcase, Users, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Briefcase className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">UBTI Hiring</span>
          </Link>

          <nav className="flex items-center gap-1 md:gap-2">
            <NavLink href="/" icon={<Home className="w-4 h-4" />} label="Dashboard" />
            <NavLink href="/jobs" icon={<Briefcase className="w-4 h-4" />} label="Jobs" />
            <NavLink href="/applicants" icon={<Users className="w-4 h-4" />} label="Applicants" />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function NavLink({ href, icon, label }: NavLinkProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        "hover:bg-secondary text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
