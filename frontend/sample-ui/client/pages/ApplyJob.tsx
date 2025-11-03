'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Upload, CheckCircle, Loader2, X } from 'lucide-react';
import { jobsAPI, applicantsAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';

interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  experience_years: number;
  education: string;
  current_company: string;
  current_role: string;
  expected_ctc: number;
  notice_period_days: number;
  skills: string;
  location: string;
  resume: File | null;
}

const schema = Yup.object({
  first_name: Yup.string().required('Required'),
  last_name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid').required('Required'),
  phone: Yup.string().matches(/^\d{10}$/, '10 digits').required('Required'),
  linkedin_url: Yup.string().url('Invalid URL').nullable(),
  experience_years: Yup.number().min(0).max(50).required('Required'),
  education: Yup.string().required('Required'),
  current_company: Yup.string().required('Required'),
  current_role: Yup.string().required('Required'),
  expected_ctc: Yup.number().min(0).required('Required'),
  notice_period_days: Yup.number().min(0).max(90).required('Required'),
  skills: Yup.string().required('Required'),
  location: Yup.string().required('Required'),
  resume: Yup.mixed<File>().required('Resume required'),
});

export default function ApplyJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (!jobId || isNaN(Number(jobId))) return navigate('/jobs');
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const { data } = await jobsAPI.getJobById(Number(jobId));
      setJob(data);
    } catch {
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik<FormValues>({
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
    validationSchema: schema,
    onSubmit: async (values) => {
      if (!resumeFile || !jobId) return;

      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val !== null && val !== '') {
          formData.append(key, val instanceof File ? val : String(val));
        }
      });
      formData.append('job_id', jobId);
      formData.append('source', 'Website');
      formData.append('application_status', 'applied');

      try {
        setSubmitting(true);
        await applicantsAPI.submitApplication(formData);
        setSuccess(true);
        setTimeout(() => navigate('/jobs'), 3000);
      } catch (err: any) {
        alert(err?.response?.data?.detail || 'Failed. Try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFile = (file: File) => {
    const max = 5 * 1024 * 1024;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (file.size > max) return alert('Max 5MB');
    if (!allowed.includes(file.type)) return alert('PDF/DOC/DOCX only');
    setResumeFile(file);
    formik.setFieldValue('resume', file);
  };

  if (loading) return <Loading />;
  if (!job) return <NotFound />;
  if (success) return <SuccessScreen />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary mb-8">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="bg-card border rounded-xl p-8 mb-8 shadow">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground mt-2">{job.department} • {job.location}</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="bg-card border rounded-xl p-10 shadow-lg space-y-10">
          <h2 className="text-2xl font-bold text-center">Complete Application</h2>

          {/* Personal Info */}
          <Section title="Personal Information">
            <Input name="first_name" label="First Name *" formik={formik} />
            <Input name="last_name" label="Last Name *" formik={formik} />
            <Input name="email" label="Email *" type="email" formik={formik} />
            <Input name="phone" label="Phone (10 digits) *" formik={formik} />
            <Input name="linkedin_url" label="LinkedIn URL" formik={formik} placeholder="https://linkedin.com/in/..." />
            <Input name="location" label="Current Location *" formik={formik} placeholder="e.g. Bangalore" />
          </Section>

          {/* Education & Experience */}
          <Section title="Education & Experience">
            <Input name="education" label="Highest Education *" formik={formik} placeholder="e.g. B.Tech CSE" />
            <Input name="experience_years" label="Years of Experience *" type="number" formik={formik} />
            <Input name="current_company" label="Current Company *" formik={formik} />
            <Input name="current_role" label="Current Role *" formik={formik} />
          </Section>

          {/* Compensation */}
          <Section title="Compensation">
            <Input name="expected_ctc" label="Expected CTC (LPA) *" type="number" formik={formik} placeholder="e.g. 15" />
            <Input name="notice_period_days" label="Notice Period (days) *" type="number" formik={formik} />
          </Section>

          {/* Skills */}
          <Section title="Skills">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Key Skills *</label>
              <textarea
                {...formik.getFieldProps('skills')}
                rows={4}
                placeholder="e.g. Python, React, AWS, SQL"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
                  formik.touched.skills && formik.errors.skills ? 'border-red-500' : 'border-border'
                }`}
              />
              {formik.touched.skills && formik.errors.skills && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.skills}</p>
              )}
            </div>
          </Section>

          {/* Resume */}
          <Section title="Resume *">
            <div className="md:col-span-2">
              {!resumeFile ? (
                <div
                  onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">Drop your resume</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                    id="resume"
                  />
                  <label htmlFor="resume" className="inline-block px-6 py-3 bg-primary text-white rounded-lg mt-4 cursor-pointer">
                    Choose File
                  </label>
                </div>
              ) : (
                <div className="p-6 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold">{resumeFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(resumeFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setResumeFile(null); formik.setFieldValue('resume', null); }}>
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              )}
              {formik.touched.resume && formik.errors.resume && (
                <p className="text-red-500 text-sm mt-2">Resume is required</p>
              )}
            </div>
          </Section>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting || !resumeFile}
              className="flex-1 bg-primary text-white py-4 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" /> : 'Submit Application'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-secondary py-4 rounded-xl">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
    <div className="grid md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const Input: React.FC<{ name: keyof FormValues; label: string; type?: string; formik: any; placeholder?: string }> = ({
  name, label, type = 'text', formik, placeholder
}) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      {...formik.getFieldProps(name)}
      type={type}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary ${
        formik.touched[name] && formik.errors[name] ? 'border-red-500' : 'border-border'
      }`}
    />
    {formik.touched[name] && formik.errors[name] && (
      <p className="text-red-500 text-sm mt-1">
        {typeof formik.errors[name] === 'string' ? formik.errors[name] : 'Invalid'}
      </p>
    )}
  </div>
);

const Loading = () => <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
const NotFound = () => <div className="text-center py-20"><h1 className="text-3xl font-bold">Job Not Found</h1></div>;
const SuccessScreen = () => (
  <div className="min-h-screen flex items-center justify-center text-center">
    <div>
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-2">Applied Successfully!</h1>
      <p className="text-muted-foreground">We'll review and get back soon.</p>
    </div>
  </div>
);