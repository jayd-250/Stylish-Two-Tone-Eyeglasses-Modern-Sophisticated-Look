
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../App';
import { t } from '../i18n';
import { Language, JobPost, SkillAd, JobApplication } from '../types';
import { DISTRICTS } from '../constants/rwanda';
import { 
  Briefcase, Users, Search, Filter, MapPin, 
  Clock, DollarSign, CheckCircle, Plus, MessageSquare, 
  User, Award, FileText, ChevronRight, X, Send, 
  ArrowRight, Heart, Star, ShieldCheck, LogIn,
  ClipboardList, Calendar, Info
} from 'lucide-react';

const MOCK_JOBS: JobPost[] = [
  { id: 'j1', employerId: 'e1', companyName: 'Kigali Marriott', title: 'Receptionist', description: 'Experienced receptionist needed for a 5-star hotel. Fluency in English and Kinyarwanda is mandatory.', category: 'Hospitality', salaryRange: '300,000 - 450,000 Frw', location: 'Kigali (Nyarugenge)', type: 'Full-time', deadline: '2024-06-30', status: 'active' },
  { id: 'j2', employerId: 'e2', companyName: 'BuildRW Ltd', title: 'Professional Electrician', description: 'Looking for a certified electrician for a large construction project in Musanze.', category: 'Construction', salaryRange: '20,000 Frw / Day', location: 'Northern Province (Musanze)', type: 'Contract', deadline: '2024-06-15', status: 'active' },
  { id: 'j3', employerId: 'e3', companyName: 'TechHub Rwanda', title: 'Full-stack Developer', description: 'React/Node.js expert needed for a fin-tech startup.', category: 'IT', salaryRange: '1,200,000+ Frw', location: 'Kigali (Gasabo)', type: 'Freelance', deadline: '2024-07-10', status: 'active' },
];

const MOCK_SKILLS: SkillAd[] = [
  { id: 's1', userId: 'u1', fullName: 'Uwamahoro Jeanette', category: 'Services', title: 'Professional Tailor & Designer', description: 'Expert in Igitenge and modern designs. 10 years experience.', priceEstimate: 15000, location: 'Kigali (Kicukiro)', yearsExperience: 10, verified: true, status: 'active' },
  { id: 's2', userId: 'u2', fullName: 'Niyonsenga Bosco', category: 'Transport', title: 'Licensed Heavy Truck Driver', description: 'Experienced cross-border driver (East Africa). Safe driving record.', priceEstimate: 500000, location: 'Western Province (Rubavu)', yearsExperience: 7, verified: true, status: 'active' },
  { id: 's3', userId: 'u3', fullName: 'Manzi Eric', category: 'IT', title: 'Graphic Designer & Photographer', description: 'Branding, logos, and event photography.', priceEstimate: 50000, location: 'Kigali (Gasabo)', yearsExperience: 3, verified: false, status: 'active' },
];

const JobsPortal: React.FC = () => {
  const { language, user, showLogin } = useAuth();
  const [activeView, setActiveView] = useState<'find_work' | 'find_talent'>('find_work');
  const [workSubView, setWorkSubView] = useState<'listings' | 'applications'>('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    // Mock initial applications for demo purposes if logged in
    if (user && applications.length === 0) {
      setApplications([
        { id: 'app1', jobId: 'j1', applicantId: user.id, applicantName: user.fullName, status: 'shortlisted', appliedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 'app2', jobId: 'j2', applicantId: user.id, applicantName: user.fullName, status: 'pending', appliedAt: new Date(Date.now() - 86400000 * 5).toISOString() }
      ]);
    }
  }, [user]);

  const filteredJobs = useMemo(() => MOCK_JOBS.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.category.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);
  const filteredSkills = useMemo(() => MOCK_SKILLS.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.fullName.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);

  const handleAction = (callback: () => void) => {
    if (!user) {
      showLogin();
      return;
    }
    callback();
  };

  const handleApply = (job: JobPost) => {
    handleAction(() => {
      // Check if already applied
      if (applications.find(a => a.jobId === job.id)) {
        alert(language === Language.RW ? "Mwasabye iri kaza kare!" : "You have already applied for this job!");
        return;
      }

      const newApp: JobApplication = {
        id: `APP-${Math.random().toString(36).substr(2, 5)}`,
        jobId: job.id,
        applicantId: user!.id,
        applicantName: user!.fullName,
        status: 'pending',
        appliedAt: new Date().toISOString()
      };
      
      setApplications(prev => [newApp, ...prev]);
      alert(language === Language.RW ? "Ubusabe bwanyu bwakiriwe neza!" : "Your application has been submitted successfully!");
      setWorkSubView('applications');
    });
  };

  const getJobById = (id: string) => MOCK_JOBS.find(j => j.id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 pb-24">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('jobs_portal', language)}</h1>
          <p className="text-gray-500 font-medium">{language === Language.RW ? 'Huza n\'amahirwe y\'akazi cyangwa ubumenyi bukenewe.' : 'Connect with job opportunities or discover the skills you need.'}</p>
        </div>
        <button 
          onClick={() => handleAction(() => setIsPostingModalOpen(true))}
          className="flex items-center gap-3 bg-green-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-green-100 hover:bg-green-700 active:scale-95 transition"
        >
          <Plus size={20}/> {activeView === 'find_work' ? t('advertise_skill', language) : t('post_job', language)}
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm shrink-0">
          <button 
            onClick={() => setActiveView('find_work')}
            className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] font-bold text-sm transition-all ${activeView === 'find_work' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Briefcase size={18}/> {t('find_work', language)}
          </button>
          <button 
            onClick={() => setActiveView('find_talent')}
            className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] font-bold text-sm transition-all ${activeView === 'find_talent' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Users size={18}/> {t('find_talent', language)}
          </button>
        </div>

        <div className="relative flex-grow">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input 
            type="text" 
            placeholder={activeView === 'find_work' ? t('search_placeholder', language) : (language === Language.RW ? 'Shaka ubumenyi...' : 'Search for skills...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-green-500 outline-none text-gray-900 shadow-sm font-medium"
          />
        </div>
      </div>

      {/* Sub-navigation for Find Work */}
      {activeView === 'find_work' && user && (
        <div className="flex gap-4 mb-8 border-b border-gray-100 pb-1">
          <button 
            onClick={() => setWorkSubView('listings')}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${workSubView === 'listings' ? 'text-green-600' : 'text-gray-400'}`}
          >
            {language === Language.RW ? 'Imyanya y\'akazi' : 'Job Listings'}
            {workSubView === 'listings' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-full" />}
          </button>
          <button 
            onClick={() => setWorkSubView('applications')}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${workSubView === 'applications' ? 'text-green-600' : 'text-gray-400'}`}
          >
            {t('my_applications', language)}
            {applications.length > 0 && <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[9px]">{applications.length}</span>}
            {workSubView === 'applications' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-full" />}
          </button>
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {activeView === 'find_work' ? (
          workSubView === 'listings' ? (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col group">
                <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Briefcase size={28} className="text-green-600"/>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-green-600 transition">{job.title}</h3>
                      <p className="text-sm font-bold text-gray-400">{job.companyName}</p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {job.type}
                  </span>
                </div>
                
                <div className="p-8 flex-grow">
                  <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-3">{job.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <MapPin size={16} className="text-gray-300"/> {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                      <DollarSign size={16} className="text-green-300"/> {job.salaryRange}
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  <button 
                    onClick={() => handleApply(job)}
                    className="w-full bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    {user ? (
                      applications.find(a => a.jobId === job.id) ? 
                      <><CheckCircle size={16}/> {language === Language.RW ? 'Mwarasabye' : 'Applied'}</> : 
                      t('apply_now', language)
                    ) : <><LogIn size={16}/> {t('login_to_apply', language)}</>} <ArrowRight size={16}/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* MY APPLICATIONS VIEW */
            <div className="col-span-1 lg:col-span-2 space-y-4 animate-in fade-in duration-500">
              {applications.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100 shadow-inner">
                   <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ClipboardList size={40}/>
                   </div>
                   <h3 className="text-xl font-black text-gray-900 mb-2">{language === Language.RW ? 'Nta busabe bw\'akazi mufite' : 'No applications yet'}</h3>
                   <p className="text-gray-400 text-sm mb-8">{language === Language.RW ? 'Tangira ushaka imyanya y\'akazi ikubereye.' : 'Start searching for jobs that match your skills.'}</p>
                   <button onClick={() => setWorkSubView('listings')} className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100">Browse Jobs</button>
                </div>
              ) : (
                applications.map(app => {
                  const job = getJobById(app.jobId);
                  return (
                    <div key={app.id} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-green-100 transition-all duration-300">
                       <div className="flex items-center gap-6 w-full">
                          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                             <Briefcase size={32} className="text-gray-300"/>
                          </div>
                          <div className="flex-grow">
                             <h4 className="text-lg font-black text-gray-900">{job?.title || 'Unknown Position'}</h4>
                             <p className="text-sm font-bold text-gray-400">{job?.companyName || 'Unknown Company'}</p>
                             <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                   <Calendar size={12}/> Applied {new Date(app.appliedAt).toLocaleDateString()}
                                </span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider text-center w-full sm:w-auto ${
                            app.status === 'hired' ? 'bg-green-100 text-green-700' :
                            app.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status}
                          </span>
                          <button className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest flex items-center gap-1">
                             <Info size={12}/> View Details
                          </button>
                       </div>
                    </div>
                  );
                })
              )}
            </div>
          )
        ) : (
          /* FIND TALENT VIEW */
          filteredSkills.map(skill => (
            <div key={skill.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
              <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                    <User size={28} className="text-blue-600"/>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition">{skill.title}</h3>
                    <p className="text-sm font-bold text-gray-400">{skill.fullName}</p>
                  </div>
                </div>
                {skill.verified && (
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck size={14}/> {t('verified_skill', language)}
                  </div>
                )}
              </div>
              
              <div className="p-8">
                <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-3">{skill.description}</p>
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                   <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{language === Language.RW ? 'Igiciro gitangiriraho' : 'Starting from'}</span>
                   <span className="text-lg font-black text-blue-700">{skill.priceEstimate.toLocaleString()} Frw</span>
                </div>
              </div>

              <div className="p-8 pt-0 flex gap-3">
                <button 
                  onClick={() => handleAction(() => alert("Chat opened!"))}
                  className="flex-1 bg-white border border-gray-100 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16}/> Chat
                </button>
                <button 
                  onClick={() => handleAction(() => alert("Hiring process started!"))}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  {t('hire_talent', language)}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Posting Modal */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <button 
              onClick={() => setIsPostingModalOpen(false)}
              className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition"
            >
              <X size={28}/>
            </button>
            <h2 className="text-3xl font-black mb-8">{activeView === 'find_work' ? t('advertise_skill', language) : t('post_job', language)}</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); setIsPostingModalOpen(false); alert("Posted successfully!"); }} className="space-y-6">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{activeView === 'find_talent' ? 'Job Title' : 'Your Professional Title'}</label>
                  <input type="text" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-900" placeholder="e.g. Master Tailor, Web Developer..."/>
               </div>
               
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea rows={4} required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-medium text-gray-700" placeholder="Describe the role or your expertise..."/>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{activeView === 'find_talent' ? 'Salary Range' : 'Service Price (Frw)'}</label>
                    <input type="text" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                    <select className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 outline-none">
                       {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
               </div>

               <div className="pt-6 border-t border-gray-100 flex gap-4">
                  <button type="button" onClick={() => setIsPostingModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" className="flex-[2] bg-green-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-green-100 hover:bg-green-700 transition">
                    Publish Now
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPortal;
