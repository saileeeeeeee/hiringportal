import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { jobsAPI, applicantsAPI } from '@/lib/api';
import { Job } from '@shared/api';
import Navbar from '@/components/Navbar';

const validationSchema = Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string(),
  linkedin_url: Yup.string().url('Invalid URL'),
  experience_years: Yup.number()
    .min(0, 'Experience must be 0 or more')
    .required('Experience is required'),
  education: Yup.string(),
  current_company: Yup.string(),
  current_role: Yup.string(),
  expected_ctc: Yup.number().min(0, 'Expected CTC must be positive'),
  notice_period_days: Yup.number()
    .min(0, 'Notice period must be 0 or more')
    .required('Notice period is required'),
  skills: Yup.string(),
  location: Yup.string(),
  resume: Yup.mixed().required('Resume is required'),
});

export default function ApplyJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobsAPI.getJobById(Number(jobId));
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      linkedin_url: '',
      experience_years: 0,
      education: '',
      current_company: '',
      current_role: '',
      expected_ctc: 0,
      notice_period_days: 30,
      skills: '',
      location: '',
      resume: null,
    },
    validationSchema,
    onSubmit: async () => {
      if (!resumeFile) {
        alert('Please upload a resume');
        return;
      }

      try {
        setSubmitting(true);
        const formData = new FormData();
        formData.append('first_name', formik.values.first_name);
        formData.append('last_name', formik.values.last_name);
        formData.append('email', formik.values.email);
        formData.append('phone', formik.values.phone || '');
        formData.append('linkedin_url', formik.values.linkedin_url || '');
        formData.append('experience_years', String(formik.values.experience_years));
        formData.append('education', formik.values.education || '');
        formData.append('current_company', formik.values.current_company || '');
        formData.append('current_role', formik.values.current_role || '');
        formData.append('expected_ctc', String(formik.values.expected_ctc || 0));
        formData.append('notice_period_days', String(formik.values.notice_period_days));
        formData.append('skills', formik.values.skills || '');
        formData.append('location', formik.values.location || '');
        formData.append('job_id', jobId!);
        formData.append('source', 'Website');
        formData.append('application_status', 'applied');
        formData.append('resume', resumeFile);

        await applicantsAPI.submitApplication(formData);
        setSubmitSuccess(true);

        setTimeout(() => {
          navigate('/jobs');
        }, 2000);
      } catch (error) {
        console.error('Error submitting application:', error);
        alert('Error submitting application. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResumeChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Resume must be less than 5MB');
      return;
    }

    const validTypes = ['application/pdf', 'application/msword', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      alert('Resume must be PDF, DOC, or TXT');
      return;
    }

    setResumeFile(file);
    formik.setFieldValue('resume', file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleResumeChange(e.dataTransfer.files[0]);
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
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 mt-20">
          <CheckCircle className="w-16 h-16 text-accent mx-auto" />
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h1>
            <p className="text-muted-foreground">
              Thank you for applying. We'll review your application and get back to you soon.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">Redirecting to jobs page...</p>
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
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="flex items-center gap-2 text-primary hover:gap-3 transition-all mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Job
        </button>

        {/* Job Info Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
          <p className="text-muted-foreground mt-2">{job.department} • {job.location}</p>
        </div>

        {/* Application Form */}
        <div className="bg-card border border-border rounded-xl p-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-6">Application Form</h2>

          <form onSubmit={formik.handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('first_name')}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formik.touched.first_name && formik.errors.first_name
                        ? 'border-destructive focus:ring-destructive'
                        : 'border-border focus:ring-primary'
                    }`}
                    placeholder="John"
                  />
                  {formik.touched.first_name && formik.errors.first_name && (
                    <p className="mt-1 text-sm text-destructive">{formik.errors.first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('last_name')}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formik.touched.last_name && formik.errors.last_name
                        ? 'border-destructive focus:ring-destructive'
                        : 'border-border focus:ring-primary'
                    }`}
                    placeholder="Doe"
                  />
                  {formik.touched.last_name && formik.errors.last_name && (
                    <p className="mt-1 text-sm text-destructive">{formik.errors.last_name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...formik.getFieldProps('email')}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formik.touched.email && formik.errors.email
                        ? 'border-destructive focus:ring-destructive'
                        : 'border-border focus:ring-primary'
                    }`}
                    placeholder="john@example.com"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-sm text-destructive">{formik.errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    {...formik.getFieldProps('phone')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Company */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Company
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('current_company')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Acme Inc."
                  />
                </div>

                {/* Current Role */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Role
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('current_role')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Senior Developer"
                  />
                </div>

                {/* Experience Years */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    {...formik.getFieldProps('experience_years')}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formik.touched.experience_years && formik.errors.experience_years
                        ? 'border-destructive focus:ring-destructive'
                        : 'border-border focus:ring-primary'
                    }`}
                    min="0"
                  />
                  {formik.touched.experience_years && formik.errors.experience_years && (
                    <p className="mt-1 text-sm text-destructive">{formik.errors.experience_years}</p>
                  )}
                </div>

                {/* Notice Period */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notice Period (days) *
                  </label>
                  <input
                    type="number"
                    {...formik.getFieldProps('notice_period_days')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    {...formik.getFieldProps('linkedin_url')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>

                {/* Expected CTC */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Expected CTC (Annual)
                  </label>
                  <input
                    type="number"
                    {...formik.getFieldProps('expected_ctc')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Additional Information</h3>
              <div className="space-y-4">
                {/* Education */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('education')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Bachelor's in Computer Science"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Skills (comma-separated)
                  </label>
                  <textarea
                    {...formik.getFieldProps('skills')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="React, TypeScript, Python, SQL..."
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps('location')}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Resume Upload *</h3>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">
                  Drag and drop your resume here
                </p>
                <p className="text-sm text-muted-foreground mb-4">or</p>
                <label className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Choose File
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleResumeChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-3">
                  PDF, DOC, or TXT • Max 5MB
                </p>
              </div>

              {resumeFile && (
                <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{resumeFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(resumeFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="bg-muted/50 border border-border rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                By submitting this application, you agree to our terms and conditions. 
                We'll review your application and get back to you if you're selected for the next round.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || !resumeFile}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/jobs/${jobId}`)}
                className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
