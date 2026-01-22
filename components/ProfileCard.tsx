import React from 'react';
import { Profile } from '../types';
import { Briefcase, MapPin, Calendar, Award, Code, Truck, Cpu } from 'lucide-react';

interface Props {
  profile: Profile;
}

const ProfileCard: React.FC<Props> = ({ profile }) => {
  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* Header */}
      <div className="border-b border-slate-700 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h1>
        <p className="text-cyber-500 font-mono text-sm mt-1">{profile.tagline}</p>
        
        <div className="flex flex-wrap gap-2 mt-3">
            {profile.skills.slice(0, 4).map(skill => (
                <span key={skill} className="px-2 py-1 bg-cyber-800 border border-cyber-700 rounded text-[10px] text-cyber-400">
                    {skill}
                </span>
            ))}
        </div>
      </div>

      {/* Experience Timeline */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
            <Briefcase className="w-4 h-4 mr-2" /> 
            Mission History
        </h2>
        
        <div className="space-y-6 border-l-2 border-slate-800 ml-2 pl-4">
          {profile.jobs.map((job, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-cyber-900 border-2 border-cyber-500 group-hover:bg-cyber-500 transition-colors"></div>
              
              <div className="glass-panel p-3 rounded-lg hover:border-cyber-500 transition-colors duration-300">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-white font-bold text-sm">{job.role}</h3>
                    <span className="text-[10px] font-mono bg-cyber-900 px-1 py-0.5 rounded text-slate-400">{job.period.split('-')[0].trim()}</span>
                </div>
                <div className="text-cyber-400 text-xs mb-2 flex items-center">
                    <span className="font-semibold mr-2">{job.company}</span>
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {job.location}
                </div>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside opacity-80">
                    {job.description.map((desc, i) => (
                        <li key={i}>{desc}</li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Matrix */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
            <Cpu className="w-4 h-4 mr-2" /> 
            Skill Capabilities
        </h2>
        <div className="grid grid-cols-2 gap-2">
            <div className="glass-panel p-2 rounded">
                <div className="text-xs text-slate-500 mb-1">Development</div>
                <div className="flex flex-wrap gap-1">
                    <Code className="w-3 h-3 text-cyber-accent" />
                    <span className="text-xs">Python, React, PWA</span>
                </div>
            </div>
            <div className="glass-panel p-2 rounded">
                <div className="text-xs text-slate-500 mb-1">Logistics</div>
                <div className="flex flex-wrap gap-1">
                    <Truck className="w-3 h-3 text-warn" />
                    <span className="text-xs">Driving A/B/C/T/E</span>
                </div>
            </div>
        </div>
      </div>

       {/* Licenses */}
       <div className="glass-panel p-3 rounded-lg border-l-4 border-l-cyber-500 flex justify-between items-center">
            <div>
                <div className="text-[10px] uppercase text-slate-500">Driving License</div>
                <div className="font-mono text-lg font-bold text-white">A, B, C, T, E</div>
            </div>
            <Award className="w-8 h-8 text-cyber-500 opacity-50" />
       </div>

    </div>
  );
};

export default ProfileCard;