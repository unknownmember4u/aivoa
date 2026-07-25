import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const features = [
    { title: "AI Processing", description: "Automated parsing and parsing validation" },
    { title: "FDA-ready Audit Trails", description: "Inspired by 21 CFR Part 11 concepts" },
    { title: "Grounded AI Assistant", description: "Contextual answers without hallucinations" }
  ];

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.setItem('access_token', 'mock_dev_jwt_token');
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] font-sans antialiased text-[#0F172A]">
      {/* Left Column (Branding & Feature Highlights) - Hidden on Mobile */}
      <div className="hidden md:flex md:w-[40%] lg:w-[45%] bg-slate-950 text-white flex-col justify-between p-12 lg:p-16 border-r border-slate-800">
        {/* Logo */}
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <div>
            <span className="font-bold text-xl tracking-tight text-white block leading-none">AIVOA</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mt-1">
              AI Complaint Management
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="my-auto py-12">
          <h1 className="text-[36px] font-bold tracking-tight leading-[1.15] text-white max-w-md mb-4">
            AI-Powered Pharmaceutical Complaint Management System
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Automate complaint intake, AI extraction, regulatory review, and investigation workflows.
          </p>

          {/* Feature Bullets */}
          <ul className="space-y-6">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start space-x-4">
                <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-100">{feature.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500">
          Validated Environment | 21 CFR Part 11 Design Concepts
        </div>
      </div>

      {/* Right Column (Centered Login Card) */}
      <div className="flex-1 flex flex-col justify-between p-8 bg-[#F8FAFC]">
        {/* Empty header block to align footer to bottom */}
        <div className="hidden md:block"></div>

        {/* Card Container */}
        <div className="flex justify-center items-center my-auto">
          <div className="w-full max-w-[420px] bg-white rounded-[20px] p-8 border border-[#E2E8F0] shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
            {/* Header */}
            <div className="mb-8">
              {/* Mobile-only logo */}
              <div className="flex items-center space-x-2 mb-6 md:hidden">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
                <span className="font-bold text-lg text-slate-900">AIVOA</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-sm text-[#64748B] mt-1.5">Sign in to your quality management account.</p>
            </div>

            {/* Form Placeholder */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  defaultValue="qa.analyst@pharma.com"
                  disabled
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#forgot" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  defaultValue="password"
                  disabled
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2.5 text-xs text-[#64748B] select-none">
                  Keep me signed in for 30 days
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                onClick={handleLoginClick}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2"
              >
                Log In
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#64748B] mt-8">
          © {new Date().getFullYear()} AIVOA. All rights reserved.
        </div>
      </div>
    </div>
  );
};
