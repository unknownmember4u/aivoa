import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLoginMutation } from '@/services/authApi';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/store/slices/authSlice';
import './LoginPage.css';

// Zod Validation Schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  // Custom Zod resolver for React Hook Form
  const zodResolver = (data: Record<string, unknown>) => {
    const result = loginSchema.safeParse(data);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    result.error.errors.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0] as string] = { type: 'validation', message: err.message };
      }
    });
    return { values: {}, errors };
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const response = await login(data).unwrap();
      const token = response.access_token || response.token?.access_token;

      if (!token) {
        throw new Error('No access token returned from server.');
      }
      
      // Save token and dispatch user profile to Redux store
      dispatch(
        setCredentials({
          token,
          user: response.user,
        })
      );
      
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorObj = err as { status?: number | string; data?: { detail?: string } };
      if (errorObj?.status === 401) {
        setApiError('Invalid email or password. Please verify your credentials.');
      } else if (errorObj?.status === 422) {
        setApiError('Validation error. Please check your inputs.');
      } else if (errorObj?.status === 'FETCH_ERROR' || !errorObj?.status) {
        setApiError('Network failure. Unable to connect to the authentication server.');
      } else {
        setApiError(errorObj?.data?.detail || 'An unexpected error occurred during authentication.');
      }
    }
  };

  const features = [
    'AI Document Processing',
    'FDA-style Audit Trails',
    'Grounded AI Assistant',
  ];

  return (
    <div className="relative min-h-screen w-full flex font-sans antialiased text-[#0F172A] animate-fadeIn overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-20"
      >
        <source src="/bg-loginpage.mp4" type="video/mp4" />
      </video>
      {/* Subtle background overlay to keep video crisp and highly visible */}
      <div className="absolute inset-0 bg-slate-950/10 -z-10" />

      {/* LEFT BRAND PANEL (45% Desktop, 40% Tablet, Translucent Glass to show background) */}
      <div className="hidden md:flex md:w-[40%] lg:w-[45%] bg-white/20 backdrop-blur-md text-slate-900 border-r border-white/30 flex-col justify-between p-10 lg:p-14 select-none">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#151717] flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 block leading-none">AIVOA</span>
            <span className="text-[10px] text-[#151717] font-bold uppercase tracking-wider block mt-1">
              Pharma Quality AI
            </span>
          </div>
        </div>

        {/* Brand Message */}
        <div className="my-auto py-8">
          <h1 className="text-3xl lg:text-[36px] font-extrabold tracking-tight leading-tight text-slate-900 max-w-md mb-4 drop-shadow-xs">
            AI-Powered Pharmaceutical Complaint Management
          </h1>
          <p className="text-slate-800 text-base leading-relaxed mb-8 max-w-sm font-medium">
            Streamline complaint processing with AI-assisted extraction, review, and regulatory audit support.
          </p>

          {/* Feature List */}
          <ul className="space-y-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-3 text-sm font-bold text-slate-900">
                <CheckCircle2 className="w-5 h-5 text-[#151717] shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Panel Footer */}
        <div className="flex items-center justify-between text-xs text-slate-700 border-t border-slate-900/15 pt-4 font-semibold">
          <span>Enterprise QA Portal</span>
          <span className="font-mono bg-[#151717] text-white px-2 py-0.5 rounded text-[11px]">v1.0</span>
        </div>
      </div>

      {/* RIGHT LOGIN PANEL (55% Desktop, Translucent Glass to show background) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 bg-slate-950/5 backdrop-blur-[2px]">
        <div className="hidden sm:block"></div>

        {/* Centered Login Card Container */}
        <div className="flex justify-center items-center my-auto w-full">
          {/* Uiverse.io Form UI */}
          <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Inline Error Alert */}
            {apiError && (
              <div
                role="alert"
                className="p-3.5 bg-red-50/90 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800"
              >
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span className="font-medium">{apiError}</span>
              </div>
            )}

            <div className="flex-column">
              <label>Email</label>
            </div>
            <div className={`inputForm ${errors.email ? 'input-error' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 32 32" height="20" fill="#0F172A">
                <g data-name="Layer 3" id="Layer_3">
                  <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
                </g>
              </svg>
              <input
                placeholder="Enter your Email"
                className="input"
                type="text"
                autoComplete="email"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
            )}

            <div className="flex-column">
              <label>Password</label>
            </div>
            <div className={`inputForm ${errors.password ? 'input-error' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="-64 0 512 512" height="20" fill="#0F172A">
                <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
                <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969-16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
              </svg>
              <input
                placeholder="Enter your Password"
                className="input"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
            )}

            <div className="flex-row-end">
              <span className="span" onClick={(e) => e.preventDefault()}>Forgot password?</span>
            </div>

            <button type="submit" className="button-submit" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <p className="p">
              Don't have an account? <span className="span">Sign Up</span>
            </p>
          </form>
        </div>

        {/* Footer Copyright */}
        <div className="text-center text-xs text-[#0F172A] font-semibold mt-6">
          © 2026 AIVOA. All rights reserved.
        </div>
      </div>
    </div>
  );
};
