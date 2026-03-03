/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Newspaper, 
  Search, 
  Megaphone, 
  ShieldCheck, 
  PenTool, 
  ArrowRight,
  X,
  CheckCircle2,
  Twitter,
  Send,
  MessageSquare,
  Users,
  Clock,
  ExternalLink,
  Copy,
  RefreshCw,
  Check,
  TrendingUp,
  Activity,
  LayoutGrid,
  Bell,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const weeklyData = [
  { name: 'Mon', visits: 12 },
  { name: 'Tue', visits: 15 },
  { name: 'Wed', visits: 13 },
  { name: 'Thu', visits: 28 },
  { name: 'Fri', visits: 11 },
  { name: 'Sat', visits: 18 },
  { name: 'Sun', visits: 24 },
];

interface Submission {
  id: number;
  vocation_id: string;
  vocation_title: string;
  user_contact: string;
  reason: string;
  created_at: string;
}

interface Vocation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const vocations: Vocation[] = [
  {
    id: 'developer',
    title: 'Developer',
    description: 'Build the future of the Verse ecosystem. Focus on smart contracts, frontend, or infrastructure.',
    icon: <Code className="w-6 h-6" />,
  },
  {
    id: 'correspondent',
    title: 'Correspondent',
    description: 'Report on the latest happenings within Verse. Bridge the gap between the core team and the community.',
    icon: <Newspaper className="w-6 h-6" />,
  },
  {
    id: 'researcher',
    title: 'Researcher',
    description: 'Deep dive into protocols, tokenomics, and market trends to provide actionable insights.',
    icon: <Search className="w-6 h-6" />,
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Spread the word. Create campaigns that resonate with both degens and institutions.',
    icon: <Megaphone className="w-6 h-6" />,
  },
  {
    id: 'moderator',
    title: 'Community Moderator',
    description: 'Maintain the health of our digital spaces. Ensure a safe and engaging environment for all.',
    icon: <ShieldCheck className="w-6 h-6" />,
  },
  {
    id: 'creator',
    title: 'Content Creator',
    description: 'Produce high-quality visual or audio content that tells the story of Verse.',
    icon: <PenTool className="w-6 h-6" />,
  },
];

export default function App() {
  const [view, setView] = useState<'vocations' | 'admin' | 'analytics'>('vocations');
  const [selectedVocation, setSelectedVocation] = useState<Vocation | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [interestReason, setInterestReason] = useState('');
  const [userContact, setUserContact] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('Upcoming');

  const handleInterestClick = (vocation: Vocation) => {
    setSelectedVocation(vocation);
    setIsSubmitted(false);
    setInterestReason('');
    setUserContact('');
    setSubmitError(null);
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const calculateStats = (data: Submission[]) => {
    const newStats: { [key: string]: number } = {};
    data.forEach(sub => {
      newStats[sub.vocation_title] = (newStats[sub.vocation_title] || 0) + 1;
    });
    setStats(newStats);
  };

  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const response = await fetch('/api/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
        calculateStats(data);
        localStorage.setItem('verse_submissions_backup', JSON.stringify(data));
      } else {
        const backup = localStorage.getItem('verse_submissions_backup');
        if (backup) {
          const data = JSON.parse(backup);
          setSubmissions(data);
          calculateStats(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      const backup = localStorage.getItem('verse_submissions_backup');
      if (backup) {
        const data = JSON.parse(backup);
        setSubmissions(data);
        calculateStats(data);
      }
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const deleteSubmission = async (id: number) => {
    try {
      const response = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        const updated = submissions.filter(s => s.id !== id);
        setSubmissions(updated);
        calculateStats(updated);
        localStorage.setItem('verse_submissions_backup', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Failed to delete submission:', error);
    }
  };

  const toggleAdmin = () => {
    if (view !== 'admin') {
      fetchSubmissions();
      setView('admin');
    } else {
      setView('vocations');
    }
  };

  const toggleAnalytics = () => {
    if (view !== 'analytics') {
      setView('analytics');
    } else {
      setView('vocations');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocation_id: selectedVocation?.id,
          vocation_title: selectedVocation?.title,
          user_contact: userContact,
          reason: interestReason,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setSelectedVocation(null);
          setIsSubmitted(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit interest:', error);
      setSubmitError('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-verse-bg selection:bg-verse-primary selection:text-white">
      {/* Hero Section */}
      <header className="pt-24 pb-16 px-6 text-center relative">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            V
          </div>
        </div>
        <div className="absolute top-8 right-8 flex gap-3">
          <button
            onClick={toggleAnalytics}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
              view === 'analytics' 
                ? 'bg-verse-primary/20 border-verse-primary/30 text-white' 
                : 'bg-white/5 border-white/5 text-verse-muted hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{view === 'analytics' ? 'Exit Analytics' : 'Analytics'}</span>
          </button>
          {view === 'admin' && (
            <button
              onClick={fetchSubmissions}
              disabled={isLoadingSubmissions}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-verse-muted hover:text-white transition-all border border-white/5 disabled:opacity-50"
              title="Refresh submissions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={toggleAdmin}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
              view === 'admin' 
                ? 'bg-verse-primary/20 border-verse-primary/30 text-white' 
                : 'bg-white/5 border-white/5 text-verse-muted hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{view === 'admin' ? 'Exit Admin' : 'Admin'}</span>
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            {view === 'admin' ? 'Ecosystem Interest' : view === 'analytics' ? 'Verse Analytics' : 'Find Your Place in Verse'}
          </h1>
          <p className="text-verse-muted text-lg md:text-xl max-w-2xl mx-auto">
            {view === 'admin' 
              ? 'Review the latest vocation interests from the community.' 
              : view === 'analytics'
              ? 'Real-time performance metrics and ecosystem engagement.'
              : 'Explore available vocations and choose your lane. The ecosystem grows with your contribution.'}
          </p>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        {view === 'analytics' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Analytics Header Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-2 text-verse-accent font-semibold">
                <BarChart3 className="w-5 h-5" />
                <span className="uppercase tracking-widest text-sm">Verse Analytics</span>
              </div>
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-black/80 transition-all">
                <Bell className="w-4 h-4" />
                Enable Notifications
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">+12%</span>
                </div>
                <p className="text-4xl font-bold mb-1">132</p>
                <p className="text-verse-muted text-sm uppercase tracking-wider font-medium">Total Reach</p>
              </div>

              <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Live</span>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">2</p>
                <p className="text-verse-muted text-sm uppercase tracking-wider font-medium">Active Nodes</p>
              </div>

              <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">5</p>
                <p className="text-verse-muted text-sm uppercase tracking-wider font-medium">Total Events</p>
              </div>
            </div>

            {/* Engagement Chart */}
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-verse-muted mb-1">Weekly Engagement</h3>
                  <p className="text-xs text-verse-muted/60">Last 7 Days</p>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#8E9299', fontSize: 12 }}
                      dy={10}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-black rounded-xl p-3 shadow-2xl border border-white/10">
                              <p className="text-white text-xs font-bold mb-1">{payload[0].payload.name}</p>
                              <p className="text-verse-muted text-xs">visits : <span className="text-white">{payload[0].value}</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="visits" 
                      radius={[6, 6, 6, 6]} 
                      barSize={40}
                    >
                      {weeklyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'Sun' ? '#3B82F6' : '#333333'} 
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabs Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2 bg-white/5 p-1.5 rounded-2xl w-fit mx-auto">
              {['Upcoming', 'Live', 'Past', 'All'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-black shadow-lg' 
                      : 'text-verse-muted hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Bottom Nav Mock */}
            <div className="max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center justify-between mt-12">
              <button className="p-3 text-verse-muted hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="flex items-center gap-8">
                <button className="text-verse-muted hover:text-white font-medium text-sm">Chat</button>
                <button className="bg-white text-black px-6 py-2 rounded-full font-medium text-sm shadow-lg">Preview</button>
              </div>
              <button className="p-3 text-verse-muted hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : view === 'admin' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Stats Overview */}
            {!isLoadingSubmissions && submissions.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(stats).map(([title, count]) => (
                  <div key={title} className="glass-card rounded-xl p-4 text-center">
                    <p className="text-xs text-verse-muted uppercase tracking-wider mb-1">{title}</p>
                    <p className="text-2xl font-bold text-verse-accent">{count}</p>
                  </div>
                ))}
              </div>
            )}

            {isLoadingSubmissions ? (
              <div className="text-center py-20 text-verse-muted">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-20 text-verse-muted glass-card rounded-2xl">
                No submissions yet. Be the first to express interest!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {submissions.map((sub) => (
                  <div key={sub.id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-start gap-6 group/item relative">
                    <button 
                      onClick={() => deleteSubmission(sub.id)}
                      className="absolute top-4 right-4 p-2 text-verse-muted hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                      title="Delete submission"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-verse-primary/10 flex items-center justify-center text-verse-accent">
                        {vocations.find(v => v.id === sub.vocation_id)?.icon || <Users className="w-6 h-6" />}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 pr-8">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-white">{sub.vocation_title}</h3>
                          <button 
                            onClick={() => copyToClipboard(sub.user_contact, sub.id)}
                            className="flex items-center gap-2 px-2 py-0.5 rounded bg-verse-primary/20 text-verse-accent text-xs font-mono hover:bg-verse-primary/30 transition-colors group/copy"
                          >
                            {sub.user_contact}
                            {copiedId === sub.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-verse-muted">
                          <Clock className="w-4 h-4" />
                          {new Date(sub.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-verse-muted bg-white/5 p-4 rounded-xl italic">
                        "{sub.reason}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vocations.map((vocation, index) => (
              <motion.div
                key={vocation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-8 group hover:border-verse-primary/50 transition-all duration-300 flex flex-col h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-verse-primary/10 flex items-center justify-center text-verse-accent mb-6 group-hover:scale-110 transition-transform duration-300">
                  {vocation.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{vocation.title}</h3>
                <p className="text-verse-muted mb-8 flex-grow">
                  {vocation.description}
                </p>
                <button
                  onClick={() => handleInterestClick(vocation)}
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-verse-primary text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  I'm Interested
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal / Form Overlay */}
      <AnimatePresence>
        {selectedVocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVocation(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-card rounded-3xl p-8 md:p-10 verse-glow"
            >
              <button
                onClick={() => setSelectedVocation(null)}
                className="absolute top-6 right-6 text-verse-muted hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {!isSubmitted ? (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-verse-primary/20 flex items-center justify-center text-verse-accent">
                      {selectedVocation.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedVocation.title}</h2>
                      <p className="text-verse-muted text-sm">Application Form</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-verse-muted mb-2">
                        Telegram Handle / Contact
                      </label>
                      <input
                        required
                        type="text"
                        value={userContact}
                        onChange={(e) => setUserContact(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-verse-primary transition-colors"
                        placeholder="@username or email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-verse-muted mb-2">
                        Why are you interested in this role?
                      </label>
                      <textarea
                        required
                        value={interestReason}
                        onChange={(e) => setInterestReason(e.target.value)}
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-verse-primary transition-colors resize-none"
                        placeholder="Tell us about your experience and motivation..."
                      />
                    </div>
                    {submitError && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {submitError}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl bg-verse-primary hover:bg-verse-accent disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all duration-300 shadow-lg shadow-verse-primary/20"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Interest'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">Received!</h2>
                  <p className="text-verse-muted">
                    Thank you for your interest in the {selectedVocation.title} role.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-4">Connect with Verse</h2>
            <p className="text-verse-muted mb-6 max-w-md">
              Join our growing ecosystem and stay updated with the latest developments.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-6">
              <a 
                href="https://t.me/GetVerse/177601" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-verse-muted hover:text-verse-accent transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>Telegram</span>
              </a>
              <a 
                href="https://x.com/VerseEcosystem" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-verse-muted hover:text-verse-accent transition-colors flex items-center gap-2"
              >
                <Twitter className="w-5 h-5" />
                <span>X / Twitter</span>
              </a>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-verse-primary/20 flex items-center justify-center text-verse-accent">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-verse-muted">Direct Contact</p>
                <p className="font-semibold">@Monntl</p>
              </div>
            </div>
            <a 
              href="https://t.me/Monntl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-2 rounded-lg bg-verse-primary hover:bg-verse-accent text-white text-sm font-medium transition-colors"
            >
              Message Now
            </a>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-verse-muted text-sm">
            © {new Date().getFullYear()} Verse Ecosystem. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
