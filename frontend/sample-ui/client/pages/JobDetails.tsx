'use client';

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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!jobId) {
      setError('No job ID in URL');
      setLoading(false);
      return;
    }

    const id = Number(jobId);
    if (isNaN(id)) {
      setError('Invalid job ID');
      setLoading(false);
      return;
    }

    fetchJobDetails(id);
  }, [jobId]);

  const fetchJobDetails = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await jobsAPI.getJobById(id);
      setJob(data);
    } catch (err: any) {
      console.error('API error:', err);
      setError(err?.response?.data?.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-lg font-medium text-foreground mb-4">
              {error || 'Job not found'}
            </p>
            <button onClick={() => navigate('/jobs')} className="text-primary font-medium hover:underline">
              ← Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-primary hover:gap-3 transition-all mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        <div className="bg-card border border-border rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{job.title}</h1>
              <p className="text-muted-foreground">Job Code: {job.job_code}</p>
            </div>
            <span className={`px-4 py-2 rounded-lg font-medium ${job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {job.status?.toUpperCase() || 'OPEN'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {job.department && (
              <div><Briefcase className="w-4 h-4 inline mr-2" />{job.department}</div>
            )}
            {job.location && (
              <div><MapPin className="w-4 h-4 inline mr-2" />{job.location}</div>
            )}
            {job.employment_type && (
              <div>{job.employment_type}</div>
            )}
            {job.openings && (
              <div><Users className="w-4 h-4 inline mr-2" />{job.openings} openings</div>
            )}
            {job.salary_range && (
              <div><DollarSign className="w-4 h-4 inline mr-2" />{job.salary_range}</div>
            )}
            {job.experience_required && (
              <div>{job.experience_required}</div>
            )}
            {job.posted_date && (
              <div><Calendar className="w-4 h-4 inline mr-2" />
                {new Date(job.posted_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {job.jd && (
              <div className="bg-card border border-border rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-4">About This Role</h2>
                <p className="text-muted-foreground whitespace-pre-line">{job.jd}</p>
              </div>
            )}

            {job.key_skills && (
              <div className="bg-card border border-border rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {job.key_skills.split(',').map((s, i) => (
                    <span key={i} className="bg-primary/10 text-primary px-4 py-2 rounded-lg">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary to-accent text-white rounded-xl p-8 shadow-lg sticky top-24">
              <h3 className="text-2xl font-bold mb-3">Ready to Join Us?</h3>
              <p className="text-sm opacity-90 mb-6">
                Take the first step toward your next career move.
              </p>
              <Link
                to={`/apply/${job.job_id}`}
                className="w-full bg-white text-primary py-3 rounded-lg font-bold hover:scale-105 transition-transform block text-center shadow-md"
              >
                Apply Now
              </Link>
              <p className="text-xs mt-3 opacity-80 text-center">
                Takes less than 3 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}