"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowRight, HiShieldCheck, HiDatabase, HiLightningBolt, HiUsers } from "react-icons/hi";
import { FaWrench, FaCctv, FaTools, FaBuilding } from "react-icons/fa";

export default function LandingPage() {
  const features = [
    {
      title: "Job Management",
      desc: "Assign tasks to technicians instantly and track status in real-time.",
      icon: <FaTools className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Worker Attendance",
      desc: "1-tap check-in/out for your field staff with optional GPS tracking.",
      icon: <HiUsers className="w-8 h-8 text-orange-500" />,
    },
    {
      title: "Finance & Billing",
      desc: "Generate professional service invoices and track earnings effortlessly.",
      icon: <HiLightningBolt className="w-8 h-8 text-yellow-500" />,
    },
    {
      title: "Inventory Control",
      desc: "Track materials used on jobs and get low-stock alerts automatically.",
      icon: <HiDatabase className="w-8 h-8 text-green-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-full px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">WEXO</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-600 font-semibold px-4 py-2">Login</Link>
            <Link href="/signup" className="btn-3d bg-blue-600 text-white font-bold px-6 py-2 rounded-full shadow-blue-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-blue-100">
              <HiShieldCheck /> Trusted by 10,000+ Businesses
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
              Empower Your <span className="text-blue-600">Field Workforce</span> with WEXO
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
              The ultimate management platform for electricians, plumbers, and service businesses. Scale your operations, track attendance, and automate billing in one simple app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="btn-3d bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 text-lg">
                Register Your Business <HiArrowRight />
              </Link>
              <button className="btn-3d bg-white text-slate-800 font-bold px-8 py-4 rounded-2xl border border-slate-200 text-lg">
                Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* 3D Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400 rounded-full blur-[100px] opacity-20 -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400 rounded-full blur-[100px] opacity-20 -z-10"></div>

            <div className="glass rounded-[3rem] p-4 p-8 shadow-2xl relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-3xl">
                  <FaWrench />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Technician App</h3>
                  <p className="text-slate-500 font-medium">Simplified for Field Use</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-1 w-2 h-10 bg-green-500 rounded-full"></div>
                    <span className="font-bold text-slate-700">Check-in Success</span>
                  </div>
                  <span className="text-slate-400 text-sm">9:00 AM Today</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-1 w-2 h-10 bg-blue-500 rounded-full"></div>
                    <span className="font-bold text-slate-700">Job Assigned: AC Repair</span>
                  </div>
                  <HiLightningBolt className="text-yellow-500" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Everything You Need to Scale</h2>
            <p className="text-xl text-slate-500 font-medium">Built for the unique needs of Indian service businesses.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 card-3d"
              >
                <div className="mb-6 p-4 bg-white rounded-2xl inline-block shadow-sm">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solutions" className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-12 lg:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20"></div>

          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
                Ready for the <span className="text-blue-400">Next Level?</span>
              </h2>
              <div className="space-y-6">
                {[
                  "Multi-User Team Management",
                  "Real-time Workforce Tracking",
                  "WhatsApp Billing Integration",
                  "Detailed Financial Insights"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-white font-bold text-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <HiShieldCheck className="text-blue-400" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-dark p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-8">
                <FaBuilding className="text-blue-400 text-4xl" />
                <div>
                  <h4 className="text-white font-bold text-xl">Enterprise Dashboard</h4>
                  <p className="text-slate-400">Full Business Control</p>
                </div>
              </div>
              <div className="h-40 bg-slate-800/50 rounded-2xl flex items-center justify-center">
                <span className="text-slate-500 font-mono italic">Graph Visualization Coming Soon...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8">Join the WEXO revolution today.</h2>
          <p className="text-xl text-slate-500 mb-12 font-medium">Stop managing with registers and start using WEXO. It takes less than 2 minutes to get started.</p>
          <Link href="/signup" className="btn-3d bg-blue-600 text-white font-bold px-12 py-5 rounded-2xl text-2xl inline-block shadow-2xl">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 text-center text-slate-400 font-medium">
        <p>© 2024 WEXO Technologies. Built for India's service economy.</p>
      </footer>
    </div>
  );
}
