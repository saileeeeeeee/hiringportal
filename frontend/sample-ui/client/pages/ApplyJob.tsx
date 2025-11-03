'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Upload, CheckCircle, Loader2, X } from 'lucide-react';
import { jobsAPI, applicantsAPI } from '@/lib/api';
import { Job } from '@shared/api';
import Navbar from '@/components/Navbar';

const validationSchema = Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().matches(/^\d{10}$/, 'Phone must be 10 digits').required('Phone required'),
  experience_years: Yup.number().min(0).max(50).required('Required'),
  notice_period_days: Yup.number().min(0).max(90).required('Required'),
  resume: Yup.mixed<File>().required('Resume is required'),
});

export default function ApplyJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (!jobId || isNaN(Number(jobId))) {
      navigate('/jobs');
      return;
    }
    fetchJob();
  }, [jobId, navigate]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data } = await jobsAPI.getJobById(Number(jobId));
      setJob(data);
    } catch (err) {
      console.error('Job fetch error:', err);
      navigate('/jobs');
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
      experience_years: 0,
      notice_period_days: 30,
      resume: null as File | null,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!resumeFile || !jobId) return;

      const formData = new FormData();
      formData.append('first_name', values.first_name);
      formData.append('last_name', values.last_name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);
      formData.append('experience_years', values.experience_years.toString());
      formData.append('notice_period_days', values.notice_period_days.toString());
      formData.append('job_id', jobId);
      formData.append('source', 'Website');
      formData.append('application_status', 'applied');
      formData.append('resume', resumeFile);

      try {
        setSubmitting(true);
        setSubmitting(true);
        await applicantsAPI.submitApplication(formData);
        setSuccess(true);
        setTimeout(() => navigate('/jobs'), 3000);
      } catch (err: any) {
        const msg = err?.response?.data?.detail || err.message || 'Submission failed';
        alert(`Error: ${msg}`);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFile = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (file.size > maxSize) return alert('File too large (max 5MB)');
    if (!allowed.includes(file.type)) return alert('Only PDF, DOC, DOCX allowed');

    setResumeFile(file);
    formik.setFieldValue('resume', file);
    formik.setFieldTouched('resume', true);
  };

  const removeFile = () => {
    setResumeFile(null);
    formik.setFieldValue('resume', null);
  };

  if (loading) return <Loading />;
  if (!job) return <NotFound navigate={navigate} />;
  if (success) return <SuccessScreen />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Job
        </button>

        {/* Job Header */}
        <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <span>{job.department}</span>
            <span>•</span>
            <span>{job.location}</span>
            {job.salary_range && (
              <>
                <span>•</span>
                <span>{job.salary_range}</span>
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-8 text-center">Apply Now</h2>

          {/* Personal Info */}
          <Section title="Personal Information">
            <Input name="first_name" label="First Name *" formik={formik} />
            <Input name="last_name" label="Last Name *" formik={formik} />
            <Input name="email" label="Email Address *" type="email" formik={formik} />
            <Input name="phone" label="Phone Number *" formik={formik} />
          </Section>

          {/* Experience */}
          <Section title="Professional Details">
            <Input
              name="experience_years"
              label="Years of Experience *"
              type="number"
              formik={formik}
              placeholder="e.g. 5"
            />
            <Input
              name="notice_period_days"
              label="Notice Period (days) *"
              type="number"
              formik={formik}
              placeholder="e.g. 30"
            />
          </Section>

          {/* Resume Upload */}
          <Section title="Upload Resume *">
            {!resumeFile ? (
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop your resume here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 cursor-pointer transition"
                >
                  Choose File
                </label>
              </div>
            ) : (
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-foreground">{resumeFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            {formik.touched.resume && formik.errors.resume && (
              <p className="text-red-500 text-sm mt-2">{formik.errors.resume}</p>
            )}
          </Section>

          {/* Submit */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting || !resumeFile || formik.isSubmitting}
              className="flex-1 bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-secondary text-foreground py-4 rounded-xl font-bold hover:bg-secondary/80 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-10">
    <h3 className="text-xl font-semibold text-foreground mb-5">{title}</h3>
    <div className="space-y-6">{children}</div>
  </div>
);

const Input: React.FC<{
  name: string;
  label: string;
  type?: string;
  formik: any;
  placeholder?: string;
}> = ({ name, label, type = 'text', formik, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      {label}
    </label>
    <input
      {...formik.getFieldProps(name)}
      type={type}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition ${
        formik.touched[name] && formik.errors[name]
          ? 'border-red-500'
          : 'border-border'
      }`}
    />
    {formik.touched[name] && formik.errors[name] && (
      <p className="text-red-500 text-sm mt-1">{formik.errors[name]}</p>
    )}
  </div>
);

// Screens
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading job details...</p>
    </div>
  </div>
);

const NotFound = ({ navigate }: { navigate: (path: string) => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center max-w-md">
      <h1 className="text-4xl font-bold text-foreground mb-4">Job Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The job you're looking for doesn't exist or has been removed.
      </p>
      <button
        onClick={() => navigate('/jobs')}
        className="text-primary hover:underline flex items-center gap-2 mx-auto"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Jobs
      </button>
    </div>
  </div>
);

const SuccessScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center max-w-md animate-fade-in">
      <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
      <h1 className="text-4xl font-bold text-foreground mb-4">
        Application Submitted!
      </h1>
      <p className="text-lg text-muted-foreground mb-2">
        Thank you for applying. We'll review your profile and get back soon.
      </p>
      <p className="text-sm text-muted-foreground">
        Redirecting to jobs in 3 seconds...
      </p>
    </div>
  </div>
);