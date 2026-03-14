import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  BrainCircuit, 
  Database, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  Cpu, 
  LayoutDashboard 
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">AI BI <span className="text-indigo-400">Dash</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Login</Link>
          <Link to="/signup" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-8 animate-fade-in">
            <Sparkles className="w-3 h-3" />
            <span>Next Generation Business Intelligence</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            Talk to your data, <br />
            <span className="text-gradient">see the future.</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop writing complex SQL. Ask questions in plain English and let our AI generate production-ready dashboards in seconds.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/signup" className="group px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-xl font-bold transition-all flex items-center gap-2 shadow-xl">
              Start Building Now
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="px-8 py-4 glass hover:bg-white/10 rounded-xl font-bold transition-all">
              Explore Features
            </a>
          </div>

          {/* Feature Preview Card */}
          <div className="relative max-w-5xl mx-auto mt-20 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative glass-card rounded-2xl overflow-hidden border border-white/10">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                </div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Dashboard Preview</div>
              </div>
              <div className="aspect-[16/9] bg-[#0c0c10] p-8 flex items-center justify-center">
                 {/* This could be an image or a simplified layout mockup */}
                 <div className="grid grid-cols-4 gap-4 w-full h-full opacity-50">
                    <div className="col-span-1 h-32 glass rounded-lg"></div>
                    <div className="col-span-1 h-32 glass rounded-lg"></div>
                    <div className="col-span-1 h-32 glass rounded-lg"></div>
                    <div className="col-span-1 h-32 glass rounded-lg"></div>
                    <div className="col-span-2 h-48 glass rounded-lg"></div>
                    <div className="col-span-2 h-48 glass rounded-lg"></div>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="px-6 py-10 glass-card rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-indigo-500/30">
                        <BrainCircuit className="w-12 h-12 text-indigo-400 animate-float" />
                        <div className="text-center">
                            <h3 className="text-lg font-bold">AI Processing...</h3>
                            <p className="text-sm text-gray-400">Analyzing 50,000 records</p>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative z-10 bg-[#08080a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Everything you need to <br /><span className="text-indigo-400">master your data</span></h2>
            <p className="text-gray-400 max-w-lg mx-auto">Powerful tools designed for speed, security, and scalability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit className="w-6 h-6" />}
              title="Gemini 2.0 AI"
              desc="Powered by Google's latest LLMs to translate natural language into optimized PostgreSQL query logic."
            />
            <FeatureCard 
              icon={<Database className="w-6 h-6" />}
              title="SQL Safe Engine"
              desc="Built-in validation prevents destructive operations, ensuring your data remains secure and read-only."
            />
            <FeatureCard 
              icon={<LayoutDashboard className="w-6 h-6" />}
              title="Dynamic Viz"
              desc="Automatically selects the best chart type (Line, Bar, Pie, Scatter) based on the shape of your data."
            />
            <FeatureCard 
              icon={<Cpu className="w-6 h-6" />}
              title="Lightning Fast"
              desc="Optimized backend services process queries across 100k+ records in milliseconds."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Enterprise Auth"
              desc="Secure JWT-based authentication protects your dashboards and data uploads."
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6" />}
              title="Custom Uploads"
              desc="Upload your own CSV files and start querying instantly without any database configuration."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-indigo-500 w-5 h-5" />
            <span className="font-bold">AI BI Dash</span>
          </div>
          <div className="text-sm text-gray-500">
            &copy; 2025 AI BI Dash Inc. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/50 transition-all group">
    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
