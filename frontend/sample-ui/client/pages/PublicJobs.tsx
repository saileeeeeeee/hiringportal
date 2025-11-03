'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronDown,
  MapPin,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import { jobsAPI } from '@/lib/api';
import { Job } from '@shared/api';
import Navbar from '@/components/Navbar';

export default function PublicJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const departments = [
    'all',
    'Engineering',
    'Sales',
    'Marketing',
    'HR',
    'Finance',
    'Operations',
  ];
  const locations = [
    'all',
    'New York',
    'San Francisco',
    'London',
    'Remote',
    'Toronto',
    'Sydney',
  ];

  /* -------------------------------------------------- FETCH -------------------------------------------------- */
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await jobsAPI.getPublicJobs();
      const list = data.active_jobs ?? [];
      setJobs(list);
      setFilteredJobs(list);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------- FILTER ------------------------------------------------- */
  useEffect(() => {
    let filtered = jobs.filter((job) => {
      const hay = `${job.title} ${job.department} ${job.location}`.toLowerCase();
      const matchesSearch = hay.includes(searchTerm.toLowerCase());
      const matchesDept =
        selectedDepartment === 'all' || job.department === selectedDepartment;
      const matchesLoc =
        selectedLocation === 'all' || job.location === selectedLocation;
      return matchesSearch && matchesDept && matchesLoc;
    });

    // Sort
    if (sortBy === 'recent') {
      filtered.sort(
        (a, b) =>
          new Date(b.posted_date ?? 0).getTime() -
          new Date(a.posted_date ?? 0).getTime()
      );
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedDepartment, selectedLocation, sortBy]);

  /* ------------------------------------------------- RENDER ------------------------------------------------- */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Job Opportunities
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect role for your next career move
          </p>
        </header>

        {/* Search + Filters */}
        <section className="bg-card border border-border rounded-xl p-6 mb-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by job title, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Department
              </label>
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="appearance-none w-full px-4 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d === 'all' ? 'All Departments' : d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="appearance-none w-full px-4 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                >
                  {locations.map((l) => (
                    <option key={l} value={l}>
                      {l === 'all' ? 'All Locations' : l}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sort By
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-full px-4 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card"
                >
                  <option value="recent">Most Recent</option>
                  <option value="title">Job Title (A-Z)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>
          </div>
        </section>

        {/* Loading / Empty / List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full" />
            </div>
            <p className="mt-4 text-muted-foreground">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground mb-2">
              No jobs found
            </p>
            <p className="text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <section>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredJobs.length} of {jobs.length} job
              {jobs.length !== 1 ? 's' : ''}
            </p>

            <div className="space-y-4">
              {filteredJobs.map((job) => {
                // Parse skills
                const skills = job.key_skills
                  ? job.key_skills.split(',').map((s) => s.trim()).filter(Boolean)
                  : [];

                // Use job_id as primary URL key
                const jobId = job.job_id?.toString().trim();
                const fallbackId = job.job_code?.trim() || `job-${Date.now()}`;

                // Final safe ID for URL
                const urlId = jobId && jobId !== 'undefined' && jobId !== 'null'
                  ? jobId
                  : fallbackId;

                return (
                  <Link
                    key={urlId}
                    to={`/jobs/${urlId}`}
                    className="block bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {job.title}
                        </h3>

                        <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
                          {job.department && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {job.department}
                            </div>
                          )}
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                          )}
                          {job.salary_range && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {job.salary_range}
                            </div>
                          )}
                        </div>

                        {job.jd && (
                          <p className="text-muted-foreground line-clamp-2 mb-3">
                            {job.jd}
                          </p>
                        )}

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {skills.slice(0, 3).map((skill, i) => (
                              <span
                                key={i}
                                className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {skills.length > 3 && (
                              <span className="text-xs text-muted-foreground pt-1">
                                +{skills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {job.employment_type && (
                          <span className="bg-accent/10 text-accent px-4 py-2 rounded-lg text-sm font-medium">
                            {job.employment_type}
                          </span>
                        )}
                        {job.openings != null && (
                          <span className="text-sm text-muted-foreground">
                            {job.openings} position{job.openings !== 1 ? 's' : ''} open
                          </span>
                        )}
                        <span className="text-primary font-medium text-sm mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Details
                          <ChevronDown className="w-4 h-4 rotate-0 group-hover:rotate-90 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}