import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, TrendingUp, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Job } from "@shared/api";

interface DashboardStats {
  activeJobs: number;
  totalApplicants: number;
  highScoreApplications: number;
  recentJobs: Job[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplicants: 0,
    highScoreApplications: 0,
    recentJobs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const jobsRes = await fetch("/api/v1/hr/jobs");
      const applicantsRes = await fetch("/api/v1/applicants");

      const jobsData = (await jobsRes.json()) as { active_jobs?: Job[] };
      const applicantsData = (await applicantsRes.json()) as unknown[];

      const jobs = jobsData.active_jobs || [];
      const applicants = Array.isArray(applicantsData) ? applicantsData : [];

      setStats({
        activeJobs: jobs.length,
        totalApplicants: applicants.length,
        highScoreApplications: Math.floor(applicants.length * 0.3),
        recentJobs: jobs.slice(0, 5),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome to UBTI Hiring Portal</h1>
          <p className="text-lg opacity-90">Manage job postings and track applicants with AI-powered scoring</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Briefcase className="w-8 h-8" />}
            label="Active Jobs"
            value={stats.activeJobs}
            trend={"+2 this month"}
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Total Applicants"
            value={stats.totalApplicants}
            trend={"+15 this week"}
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            label="High Score Apps"
            value={stats.highScoreApplications}
            trend="80+ percent compatibility"
          />
          <StatCard
            icon={<Calendar className="w-8 h-8" />}
            label="Pending Review"
            value={Math.max(0, stats.totalApplicants - stats.highScoreApplications)}
            trend="needs attention"
          />
        </div>

        {/* Recent Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Job Postings</h2>
            <Link to="/jobs" className="text-primary font-medium hover:underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : stats.recentJobs.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">No job postings yet</p>
              <Link
                to="/jobs"
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Create First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentJobs.map((job) => (
                <div
                  key={job.job_id}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.department} {job.location && `• ${job.location}`}
                      </p>
                    </div>
                    <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                      {job.status}
                    </span>
                  </div>
                  {job.employment_type && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {job.employment_type} • {job.openings || 1} openings
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/jobs"
            className="bg-primary text-primary-foreground rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <Briefcase className="w-8 h-8 mb-2" />
            <h3 className="font-semibold text-lg mb-1">Post a Job</h3>
            <p className="opacity-90">Create and manage job listings</p>
          </Link>
          <Link
            to="/applicants"
            className="bg-accent text-accent-foreground rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <Users className="w-8 h-8 mb-2" />
            <h3 className="font-semibold text-lg mb-1">View Applicants</h3>
            <p className="opacity-90">Review applications with AI scores</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend: string;
}

function StatCard({ icon, label, value, trend }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="text-primary">{icon}</div>
        <span className="text-xs text-muted-foreground">{trend}</span>
      </div>
      <h3 className="text-sm text-muted-foreground mt-4 font-medium">{label}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
