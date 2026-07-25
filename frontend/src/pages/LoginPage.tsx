import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Input, Checkbox, Card, Divider } from '@/components/ui';
import { useLoginMutation } from '@/services/authApi';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/store/slices/authSlice';

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
      const token = response.access_token;
      
      // Save token and dispatch to Redux store
      dispatch(
        setCredentials({
          token,
          user: {
            id: 'user-id',
            email: data.email,
            role: 'QA_ANALYST',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
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
    <div className="min-h-screen w-full flex bg-[#F8FAFC] font-sans antialiased text-[#0F172A] animate-fadeIn">
      {/* LEFT BRAND PANEL (45% Desktop, 40% Tablet, Hidden Mobile) */}
      <div className="hidden md:flex md:w-[40%] lg:w-[45%] bg-[#2563EB] text-white flex-col justify-between p-10 lg:p-14 select-none">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-2xl tracking-tight text-white block leading-none">AIVOA</span>
            <span className="text-[10px] text-blue-100 font-semibold uppercase tracking-wider block mt-1">
              Pharma Quality AI
            </span>
          </div>
        </div>

        {/* Brand Message */}
        <div className="my-auto py-8">
          <h1 className="text-3xl lg:text-[36px] font-bold tracking-tight leading-tight text-white max-w-md mb-4">
            AI-Powered Pharmaceutical Complaint Management
          </h1>
          <p className="text-blue-100 text-base leading-relaxed mb-8 max-w-sm">
            Streamline complaint processing with AI-assisted extraction, review, and regulatory audit support.
          </p>

          {/* Feature List */}
          <ul className="space-y-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center space-x-3 text-sm font-medium text-white">
                <CheckCircle2 className="w-5 h-5 text-blue-200 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Panel Footer */}
        <div className="flex items-center justify-between text-xs text-blue-200 border-t border-white/10 pt-4">
          <span>Enterprise QA Portal</span>
          <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white text-[11px]">v1.0</span>
        </div>
      </div>

      {/* RIGHT LOGIN PANEL (55% Desktop, 60% Tablet, 100% Mobile) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 bg-[#F8FAFC]">
        <div className="hidden sm:block"></div>

        {/* Centered Login Card Container */}
        <div className="flex justify-center items-center my-auto w-full">
          <Card className="w-full max-w-[440px] p-8 sm:p-10 bg-white border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.08)]">
            {/* Header Logo & Titles */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <ShieldCheck className="w-7 h-7 text-[#2563EB]" />
                <span className="font-bold text-xl text-[#0F172A] tracking-tight">AIVOA</span>
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Welcome Back</h2>
              <p className="text-sm text-[#64748B] mt-1">Sign in to your quality assurance account</p>
            </div>

            {/* Inline Error Alert */}
            {apiError && (
              <div
                role="alert"
                className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-xs text-red-800"
              >
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span className="font-medium">{apiError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Email Address"
                type="email"
                placeholder="qa.analyst@pharma.com"
                autoFocus
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-between pt-1">
                <Checkbox id="remember-me" label="Remember me" defaultChecked />
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs font-medium text-[#2563EB] hover:underline focus:outline-none focus:ring-1 focus:ring-[#2563EB] rounded"
                >
                  Forgot password?
                </a>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  disabled={isLoading}
                  size="lg"
                >
                  Sign In
                </Button>
              </div>
            </form>

            <Divider className="my-6" />

            <p className="text-center text-xs text-[#64748B]">
              Need access or technical support?{' '}
              <a href="#support" onClick={(e) => e.preventDefault()} className="text-[#2563EB] font-medium hover:underline">
                Contact Systems Admin
              </a>
            </p>
          </Card>
        </div>

        {/* Footer Copyright */}
        <div className="text-center text-xs text-[#64748B] mt-6">
          © 2026 AIVOA. All rights reserved.
        </div>
      </div>
    </div>
  );
};
