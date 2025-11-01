import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronDown, MapPin, Briefcase, DollarSign } from 'lucide-react';
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

  const departments = ['all', 'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
  const locations = ['all', 'New York', 'San Francisco', 'London', 'Remote', 'Toronto', 'Sydney'];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getPublicJobs();
      const jobsList = response.data.active_jobs || [];
      setJobs(jobsList);
      setFilteredJobs(jobsList);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = jobs.filter((job) => {
      const searchStr = `${job.title} ${job.department} ${job.location}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
      const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;

      return matchesSearch && matchesDepartment && matchesLocation;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedDepartment, selectedLocation, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Job Opportunities</h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect role for your next career move
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 space-y-6 animate-fade-in">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by job title, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'all' ? 'All Locations' : loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="recent">Most Recent</option>
                <option value="title">Job Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
            </div>
            <p className="mt-4 text-muted-foreground">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground mb-2">No jobs found</p>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>

            {filteredJobs.map((job) => (
              <Link
                key={job.job_id}
                to={`/jobs/${job.job_id}`}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
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
                      <p className="text-muted-foreground line-clamp-2">{job.jd}</p>
                    )}

                    {job.key_skills && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.key_skills.split(',').slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                        {job.key_skills.split(',').length > 3 && (
                          <span className="text-xs text-muted-foreground pt-1">
                            +{job.key_skills.split(',').length - 3} more
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
                    {job.openings && (
                      <span className="text-sm text-muted-foreground">
                        {job.openings} position{job.openings !== 1 ? 's' : ''} open
                      </span>
                    )}
                    <span className="text-primary font-medium text-sm mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Details
                      <ChevronDown className="w-4 h-4 transform group-hover:rotate-90 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
