import { useState, useEffect } from "react";
import { Plus, MapPin, Briefcase, Calendar, Edit2, Trash2, Filter, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Job, JobCreate } from "@shared/api";
import { jobsAPI } from "@/lib/api";

interface FormData extends JobCreate {
  closing_date?: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    created_by: 1001,
    title: "",
    department: "",
    location: "",
    employment_type: "Full-time",
    experience_required: "",
    salary_range: "",
    jd: "",
    key_skills: "",
    additional_skills: "",
    openings: 1,
    status: "open",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/hr/jobs");
      const data = (await res.json()) as { active_jobs?: Job[] };
      setJobs(data.active_jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "openings" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/hr/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          created_by: 1001,
          title: "",
          department: "",
          location: "",
          employment_type: "Full-time",
          experience_required: "",
          salary_range: "",
          jd: "",
          key_skills: "",
          additional_skills: "",
          openings: 1,
          status: "open",
        });
        setShowForm(false);
        await fetchJobs();
      }
    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await jobsAPI.deleteJob(jobId);
        await fetchJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job");
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Postings</h1>
            <p className="text-muted-foreground mt-1">Create and manage job listings</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            New Job
          </button>
        </div>

        {/* Job Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4 animate-slide-up">
            <h2 className="text-xl font-semibold">Create New Job Posting</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Job Code</label>
                  <input
                    type="text"
                    name="job_code"
                    value={formData.job_code || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., SE-001"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., Engineering"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employment Type</label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Experience Required</label>
                  <input
                    type="text"
                    name="experience_required"
                    value={formData.experience_required}
                    onChange={handleInputChange}
                    placeholder="e.g., 3-5 years"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salary Range</label>
                  <input
                    type="text"
                    name="salary_range"
                    value={formData.salary_range}
                    onChange={handleInputChange}
                    placeholder="e.g., 100k-150k"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Openings</label>
                  <input
                    type="number"
                    name="openings"
                    value={formData.openings}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Key Skills (comma-separated)</label>
                <input
                  type="text"
                  name="key_skills"
                  value={formData.key_skills}
                  onChange={handleInputChange}
                  placeholder="e.g., Python, React, SQL"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Additional Skills (comma-separated)</label>
                <input
                  type="text"
                  name="additional_skills"
                  value={formData.additional_skills}
                  onChange={handleInputChange}
                  placeholder="e.g., Leadership, Communication"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Job Description</label>
                <textarea
                  name="jd"
                  value={formData.jd}
                  onChange={handleInputChange}
                  placeholder="Describe the role and responsibilities..."
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Job"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No job postings yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Create First Job
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow animate-slide-up"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                    {job.job_code && <p className="text-sm text-muted-foreground">Code: {job.job_code}</p>}
                  </div>
                  <span className={`px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    job.status === "open"
                      ? "bg-accent/10 text-accent"
                      : job.status === "on_hold"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  {job.department && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      {job.department}
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                  )}
                  {job.employment_type && (
                    <div className="text-muted-foreground">{job.employment_type}</div>
                  )}
                  {job.posted_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(job.posted_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {job.key_skills && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Key Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.key_skills.split(",").map((skill, idx) => (
                        <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.jd && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.jd}</p>
                )}

                {job.openings && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {job.openings} position{job.openings !== 1 ? "s" : ""} available
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.job_id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
