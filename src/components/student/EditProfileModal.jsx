import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  User, 
  GraduationCap, 
  Globe, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
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

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&auto=format";

export function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const fileInputRef = useRef(null);
  const modalContentRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    organization: '',
    grad_year: '',
    specialization: '',
    bio: '',
    avatar: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || user.email?.split('@')[0] || 'Alex Chen',
        department: user.department || 'Computer Science Major',
        organization: user.organization || 'Tech University',
        grad_year: user.grad_year || '2021 - 2025',
        specialization: user.specialization || 'Software Engineering Specialization',
        bio: user.bio || 'Passionate frontend developer with a strong foundation in modern JavaScript frameworks. I specialize in building accessible, high-performance user interfaces and enjoy solving complex UX challenges. Currently focused on mastering TypeScript and learning about scalable system design.',
        avatar: user.avatar || DEFAULT_AVATAR,
        github_url: user.github_url || 'https://github.com',
        linkedin_url: user.linkedin_url || 'https://linkedin.com',
        portfolio_url: user.portfolio_url || 'https://alexchen.dev'
      });
      setErrorMsg('');
    }
  }, [isOpen, user]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPEG, WebP, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 5MB');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleChange('avatar', event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Full name cannot be blank.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalContentRef}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles size={18} className="text-primary" /> Edit Student Profile
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your personal identity, academic milestones, and portfolio presence.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: Avatar Upload */}
          <div className="p-4 rounded-xl border border-border bg-muted/10">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Profile Picture
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div 
                className={`relative group size-24 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                  dragActive ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-primary/50 hover:border-primary'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                title="Click or drop file to change avatar"
              >
                <img 
                  src={formData.avatar || DEFAULT_AVATAR} 
                  alt="Profile Avatar Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-medium">
                  <Camera size={18} className="mb-0.5" />
                  <span>Upload</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleFileInputChange}
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-2xs"
                  >
                    <Upload size={13} /> Select Image File
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('avatar', DEFAULT_AVATAR)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-border bg-background text-xs font-medium rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <RotateCcw size={12} /> Reset Default
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Supports PNG, JPG, or WebP up to 5MB. Drag and drop directly onto the circle to preview.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Identity & Academic Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
              <User size={14} className="text-primary" /> Identity & Academic Milestones
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Major / Department Headline</label>
                <input 
                  type="text" 
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="e.g. Computer Science Major"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Degree Program</label>
                <input 
                  type="text" 
                  value={formData.specialization ? formData.specialization : ''}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                  placeholder="e.g. Software Engineering Specialization"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">University / College</label>
                <input 
                  type="text" 
                  value={formData.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                  placeholder="e.g. Tech University"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Graduation Timeline / Period</label>
                <input 
                  type="text" 
                  value={formData.grad_year}
                  onChange={(e) => handleChange('grad_year', e.target.value)}
                  placeholder="e.g. 2021 - 2025"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Professional Bio */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
              <FileText size={14} className="text-primary" /> Professional Bio
            </h4>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Write a concise overview of your technical focus, passions, and background..."
              className="w-full bg-background border border-border rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y leading-relaxed"
            />
          </div>

          {/* SECTION 4: Links & Web Presence */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
              <Globe size={14} className="text-primary" /> Online Presence & Portfolio
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <GithubIcon size={16} className="text-muted-foreground shrink-0" />
                <input 
                  type="url" 
                  value={formData.github_url}
                  onChange={(e) => handleChange('github_url', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <LinkedinIcon size={16} className="text-muted-foreground shrink-0" />
                <input 
                  type="url" 
                  value={formData.linkedin_url}
                  onChange={(e) => handleChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <Globe size={16} className="text-muted-foreground shrink-0" />
                <input 
                  type="url" 
                  value={formData.portfolio_url}
                  onChange={(e) => handleChange('portfolio_url', e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-medium border border-border rounded-xl bg-card hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <CheckCircle2 size={14} /> Save Profile Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
