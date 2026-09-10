import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Check, 
  ExternalLink, 
  Camera, 
  Pencil, 
  Globe, 
  GraduationCap, 
  Award,
  BookOpen
} from 'lucide-react';

const GithubIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { EditProfileModal } from '../EditProfileModal';
import { useToast } from '../../../context/ToastContext';

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&auto=format";

export function SkillVaultView({ user, onUpdateUser }) {
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [skills, setSkills] = useState(['React', 'JavaScript', 'HTML/CSS', 'Git', 'Tailwind CSS', 'Node.js', 'Figma']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Dynamic user attributes with fallbacks
  const userName = user?.name || user?.email?.split('@')[0] || 'Alex Chen';
  const userAvatar = user?.avatar || DEFAULT_AVATAR;
  const userDepartment = user?.department || 'Computer Science Major';
  const userOrg = user?.organization || 'Tech University';
  const userGradYear = user?.grad_year || '2021 - 2025';
  const userSpecialization = user?.specialization || 'Software Engineering Specialization';
  const userBio = user?.bio || 'Passionate frontend developer with a strong foundation in modern JavaScript frameworks. I specialize in building accessible, high-performance user interfaces and enjoy solving complex UX challenges. Currently focused on mastering TypeScript and learning about scalable system design.';
  const githubUrl = user?.github_url || 'https://github.com';
  const linkedinUrl = user?.linkedin_url || 'https://linkedin.com';
  const portfolioUrl = user?.portfolio_url || 'https://alexchen.dev';

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
      setIsAdding(false);
      showToast(`Skill "${newSkillInput.trim()}" added to verified vault!`, 'success');
    }
  };

  // Direct Avatar File Upload
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newAvatarData = event.target.result;
        if (onUpdateUser) {
          onUpdateUser({ ...user, avatar: newAvatarData });
        }
        showToast('Profile picture updated successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (formData) => {
    if (onUpdateUser) {
      await onUpdateUser({ ...user, ...formData });
      showToast('Profile details updated successfully!', 'success');
    }
  };

  return (
    <div className="space-y-6 pb-12 transition-all duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">SkillVault</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your dynamic professional identity, verified skills, and portfolio project repository.
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm self-start sm:self-auto"
        >
          <Pencil size={14} /> Edit Profile
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Identity Card */}
        <div className="md:col-span-1 border border-border bg-card p-6 rounded-2xl h-fit shadow-xs relative">
          <div className="flex flex-col items-center text-center">
            {/* Direct Avatar Click & Camera Hover Overlay */}
            <div 
              className="relative group size-32 rounded-full bg-muted border-2 border-primary overflow-hidden mb-4 shadow-md cursor-pointer transition-transform hover:scale-102"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload profile photo"
            >
              <img 
                src={userAvatar} 
                alt={`${userName}'s Profile`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                <Camera size={22} className="mb-1 text-white" />
                <span>Change Photo</span>
              </div>
            </div>

            {/* Hidden native file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleAvatarFileSelect}
              className="hidden" 
            />

            <h2 className="text-xl font-semibold tracking-tight">{userName}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{userDepartment}</p>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-lg font-medium transition-colors"
            >
              <Pencil size={12} /> Edit Details
            </button>

            <div className="w-full h-px bg-border my-5" />

            <div className="text-left w-full space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-primary" /> Education
                </h4>
                <p className="text-sm font-medium">{userSpecialization}</p>
                <p className="text-muted-foreground">{userOrg} ({userGradYear})</p>
              </div>

              <div>
                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Award size={13} className="text-primary" /> Target Role
                </h4>
                <p className="text-sm font-medium">{user?.targetRole || 'Cloud Infrastructure Engineer'}</p>
              </div>

              {/* Online Presence & Social Badges */}
              <div className="pt-2">
                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe size={13} className="text-primary" /> Online Presence
                </h4>
                <div className="flex flex-wrap gap-2">
                  {githubUrl && (
                    <a
                      href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-[11px] font-medium transition-colors"
                      title="GitHub Profile"
                    >
                      <GithubIcon size={13} /> GitHub <ExternalLink size={10} className="text-muted-foreground" />
                    </a>
                  )}
                  {linkedinUrl && (
                    <a
                      href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-[11px] font-medium transition-colors"
                      title="LinkedIn Profile"
                    >
                      <LinkedinIcon size={13} /> LinkedIn <ExternalLink size={10} className="text-muted-foreground" />
                    </a>
                  )}
                  {portfolioUrl && (
                    <a
                      href={portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-[11px] font-medium transition-colors"
                      title="Portfolio Website"
                    >
                      <Globe size={13} /> Portfolio <ExternalLink size={10} className="text-muted-foreground" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bio & Skills & Projects */}
        <div className="md:col-span-2 space-y-6">
          {/* Professional Bio Card */}
          <div className="border border-border bg-card p-6 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> Professional Bio
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Pencil size={12} /> Edit
              </button>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {userBio}
            </p>
          </div>

          {/* Verified Skills Card */}
          <div className="border border-border bg-card p-6 rounded-2xl shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Verified Skills</h3>
              <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2.5 py-1 rounded-full">
                {skills.length} Total Skills
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span 
                  key={skill} 
                  className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-medium rounded-lg flex items-center gap-1.5"
                >
                  <Check size={13} className="text-primary" />
                  {skill}
                </span>
              ))}

              {isAdding ? (
                <form onSubmit={handleAddSkill} className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Skill name..."
                    className="px-3 py-1 text-xs bg-background border border-primary rounded-lg outline-none focus:ring-1 focus:ring-primary w-32"
                  />
                  <button type="submit" className="px-2.5 py-1 bg-primary text-primary-foreground text-xs rounded-lg font-medium">Add</button>
                  <button type="button" onClick={() => setIsAdding(false)} className="px-2 py-1 text-xs text-muted-foreground">Cancel</button>
                </form>
              ) : (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="px-3 py-1.5 border border-dashed border-border text-muted-foreground text-xs font-medium rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Plus size={13} /> Add Skill
                </button>
              )}
            </div>
          </div>

          {/* Featured Projects Card */}
          <div className="border border-border bg-card p-6 rounded-2xl shadow-xs">
            <h3 className="font-semibold text-lg mb-4">Featured Projects</h3>
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      E-commerce Dashboard UI
                      <ExternalLink size={13} className="text-muted-foreground" />
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">React • Tailwind • Recharts</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-background rounded-full border border-border">Featured</span>
                </div>
                <p className="text-xs mt-2.5 text-muted-foreground leading-relaxed">
                  A responsive admin dashboard template with real-time data visualization components and state management.
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      AI Job Matcher Extension
                      <ExternalLink size={13} className="text-muted-foreground" />
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">JavaScript • Chrome Extension API • OpenAI</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-background rounded-full border border-border">Verified</span>
                </div>
                <p className="text-xs mt-2.5 text-muted-foreground leading-relaxed">
                  Browser extension that parses job descriptions and compares required keywords against your resume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={{
          name: userName,
          avatar: userAvatar,
          department: userDepartment,
          organization: userOrg,
          grad_year: userGradYear,
          specialization: userSpecialization,
          bio: userBio,
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          portfolio_url: portfolioUrl
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
