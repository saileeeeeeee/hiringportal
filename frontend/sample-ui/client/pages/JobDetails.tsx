import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Users, Calendar } from 'lucide-react';
import { jobsAPI } from '@/lib/api';
import { Job } from '@shared/api';
import Navbar from '@/components/Navbar';

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJobById(Number(jobId));
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-lg font-medium text-foreground mb-4">Job not found</p>
            <Link to="/jobs" className="text-primary font-medium hover:underline">
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-primary hover:gap-3 transition-all mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        {/* Job Header Card */}
        <div className="bg-card border border-border rounded-xl p-8 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{job.title}</h1>
              {job.job_code && (
                <p className="text-muted-foreground">Job Code: {job.job_code}</p>
              )}
            </div>
            <span
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                job.status === 'open'
                  ? 'bg-accent/10 text-accent'
                  : job.status === 'on_hold'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {job.status || 'Open'}
            </span>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {job.department && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Department
                </p>
                <p className="font-medium text-foreground">{job.department}</p>
              </div>
            )}

            {job.location && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </p>
                <p className="font-medium text-foreground">{job.location}</p>
              </div>
            )}

            {job.employment_type && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Employment Type</p>
                <p className="font-medium text-foreground">{job.employment_type}</p>
              </div>
            )}

            {job.openings && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Openings
                </p>
                <p className="font-medium text-foreground">{job.openings}</p>
              </div>
            )}

            {job.salary_range && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Salary Range
                </p>
                <p className="font-medium text-foreground">{job.salary_range}</p>
              </div>
            )}

            {job.experience_required && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Experience Required</p>
                <p className="font-medium text-foreground">{job.experience_required}</p>
              </div>
            )}

            {job.posted_date && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Posted Date
                </p>
                <p className="font-medium text-foreground">
                  {new Date(job.posted_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {job.closing_date && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Closing Date</p>
                <p className="font-medium text-foreground">
                  {new Date(job.closing_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            {job.jd && (
              <div className="bg-card border border-border rounded-xl p-8 animate-slide-up">
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Role</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.jd}</p>
                </div>
              </div>
            )}

            {/* Key Skills */}
            {job.key_skills && (
              <div className="bg-card border border-border rounded-xl p-8 animate-slide-up">
                <h2 className="text-2xl font-bold text-foreground mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {job.key_skills.split(',').map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Skills */}
            {job.additional_skills && (
              <div className="bg-card border border-border rounded-xl p-8 animate-slide-up">
                <h2 className="text-2xl font-bold text-foreground mb-4">Additional Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {job.additional_skills.split(',').map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-8 space-y-4 sticky top-24 animate-slide-up">
              <h3 className="text-xl font-bold text-foreground">Ready to Apply?</h3>
              <p className="text-muted-foreground">
                Submit your application to our recruiting team
              </p>
              <Link
                to={`/apply/${job.job_id}`}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-center block"
              >
                Apply Now
              </Link>
              <p className="text-xs text-muted-foreground text-center">
                It takes just a few minutes to apply
              </p>
            </div>

            {/* Share Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Share This Job</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
