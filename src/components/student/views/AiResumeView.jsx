import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Wand2, 
  CheckCircle2, 
  Copy, 
  Download, 
  FileCheck, 
  X, 
  Sparkles, 
  GraduationCap, 
  Target, 
  Award, 
  HeartHandshake, 
  ShieldCheck, 
  RotateCcw,
  Layout,
  Printer,
  Eye,
  Code
} from 'lucide-react';
import { generateSmartCV } from '../../../services/cvArchitectService';

const SAMPLE_STUDENT_DATA = {
  objective: 'Motivated Computer Science student with expertise in React, JavaScript, and Web Technologies. Seeking a Software Engineer Internship to leverage technical abilities and problem-solving skills in building scalable software applications.',
  education: {
    degree: 'B.Tech in Computer Science & Engineering',
    institution: 'Institute of Technology & Management',
    year: '2026',
    grades: 'CGPA 8.7 / 10.0'
  },
  skills: {
    technical: 'JavaScript (ES6+), React.js, HTML5, CSS3/Tailwind, Node.js, Git, REST APIs, SQL',
    soft: 'Problem Solving, Agile Team Collaboration, Analytical Communication, Time Management'
  },
  achievements: '• Secured 1st Rank in Annual University Coding Hackathon 2025.\n• Developed & Deployed Open-Source Student Portfolio Builder used by 500+ peers.\n• Certified AWS Certified Cloud Practitioner & Google UX Basics.',
  interests: 'Open Source Development, Competitive Programming, Artificial Intelligence & Web3',
  declaration: {
    statement: 'I hereby declare that all the information provided above is true, complete, and correct to the best of my knowledge and belief.',
    signatureName: 'Alex Chen'
  }
};

export function AiResumeView({ user }) {
  const defaultName = user?.name || user?.email?.split('@')[0] || 'Alex Chen';
  const defaultEmail = user?.email || 'alex.chen@university.edu';

  // Form State
  const [objective, setObjective] = useState(SAMPLE_STUDENT_DATA.objective);
  const [education, setEducation] = useState(SAMPLE_STUDENT_DATA.education);
  const [skills, setSkills] = useState(SAMPLE_STUDENT_DATA.skills);
  const [achievements, setAchievements] = useState(SAMPLE_STUDENT_DATA.achievements);
  const [interests, setInterests] = useState(SAMPLE_STUDENT_DATA.interests);
  const [declaration, setDeclaration] = useState({
    statement: SAMPLE_STUDENT_DATA.declaration.statement,
    signatureName: defaultName
  });

  // View Mode: 'pdf' (Formatted Interview Resume Sheet) vs 'raw' (ATS Markdown Text)
  const [viewMode, setViewMode] = useState('pdf');

  // Template Upload State
  const [templateFile, setTemplateFile] = useState(null);
  const [templateMeta, setTemplateMeta] = useState(null);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCv, setGeneratedCv] = useState('');
  const [templateApplied, setTemplateApplied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTemplateFile(file);
    setTemplateMeta({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || 'Document Template'
    });
  };

  const handleRemoveTemplate = () => {
    setTemplateFile(null);
    setTemplateMeta(null);
  };

  // Populate Sample Data
  const handleFillSampleData = () => {
    setObjective(SAMPLE_STUDENT_DATA.objective);
    setEducation(SAMPLE_STUDENT_DATA.education);
    setSkills(SAMPLE_STUDENT_DATA.skills);
    setAchievements(SAMPLE_STUDENT_DATA.achievements);
    setInterests(SAMPLE_STUDENT_DATA.interests);
    setDeclaration({
      statement: SAMPLE_STUDENT_DATA.declaration.statement,
      signatureName: defaultName
    });
  };

  // Generate CV Handler
  const handleGenerateCv = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        objective,
        education,
        skills,
        achievements,
        interests,
        declaration
      };

      const result = await generateSmartCV(payload, templateFile);
      
      if (result && result.success) {
        setGeneratedCv(result.cvText);
        setTemplateApplied(result.templateApplied);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }
    } catch (error) {
      console.error("Failed to generate ATS CV:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to Clipboard
  const handleCopyCv = () => {
    if (!generatedCv) return;
    navigator.clipboard.writeText(generatedCv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export Raw Markdown
  const handleDownloadMd = () => {
    if (!generatedCv) return;
    const blob = new Blob([generatedCv], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${declaration.signatureName || 'Student'}_ATS_Resume.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate & Download Interview-Ready PDF
  const handleDownloadPdf = () => {
    const studentName = declaration.signatureName || defaultName;
    const printWindow = window.open('', '_blank', 'width=900,height=1100');

    if (!printWindow) {
      alert("Please allow popups to export your PDF resume.");
      return;
    }

    const achievementsListHtml = achievements
      ? achievements.split('\n').filter(Boolean).map(item => `<li>${item.replace(/^[•\-\*]\s*/, '')}</li>`).join('')
      : '<li>Demonstrated strong leadership and technical problem solving in university projects.</li>';

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${studentName} - Professional Resume</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              color: #1a1a1a;
              background: #ffffff;
              margin: 0;
              padding: 24px 32px;
              line-height: 1.45;
              font-size: 10.5pt;
            }
            .resume-header {
              text-align: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .candidate-name {
              font-size: 24pt;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #0f172a;
              margin: 0 0 6px 0;
            }
            .contact-info {
              font-size: 9.5pt;
              color: #475569;
              font-weight: 500;
            }
            .section-title {
              font-size: 11pt;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #0f172a;
              border-bottom: 1.5px solid #cbd5e1;
              padding-bottom: 3px;
              margin-top: 16px;
              margin-bottom: 8px;
            }
            .objective-text {
              color: #334155;
              text-align: justify;
              margin: 0;
            }
            .edu-header {
              display: flex;
              justify-content: space-between;
              font-weight: 700;
              color: #0f172a;
            }
            .edu-sub {
              font-size: 9.5pt;
              color: #475569;
              margin-top: 2px;
            }
            .skills-list p {
              margin: 4px 0;
            }
            ul {
              margin: 4px 0 8px 0;
              padding-left: 20px;
            }
            li {
              margin-bottom: 4px;
              color: #334155;
            }
            .declaration-box {
              margin-top: 18px;
              padding-top: 8px;
              border-top: 1px dashed #cbd5e1;
              font-size: 9.5pt;
              color: #475569;
            }
            .signature-row {
              display: flex;
              justify-content: space-between;
              margin-top: 16px;
              font-weight: 600;
              color: #0f172a;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="resume-header">
            <h1 class="candidate-name">${studentName}</h1>
            <div class="contact-info">
              ${defaultEmail} &nbsp;|&nbsp; +1 (555) 019-2834 &nbsp;|&nbsp; github.com/student &nbsp;|&nbsp; linkedin.com/in/student
            </div>
          </div>

          <div class="section-title">Career Objective</div>
          <p class="objective-text">${objective || 'Motivated student seeking entry-level role.'}</p>

          <div class="section-title">Education</div>
          <div class="edu-header">
            <span>${education.institution || 'Tech Institute'}</span>
            <span>Class of ${education.year || '2026'}</span>
          </div>
          <div class="edu-sub">
            <strong>${education.degree || 'Degree Program'}</strong> &nbsp;•&nbsp; Academic Standing: ${education.grades || 'GPA 3.8/4.0'}
          </div>

          <div class="section-title">Skills & Competencies</div>
          <div class="skills-list">
            <p><strong>Technical Skills:</strong> ${skills.technical || 'JavaScript, React, HTML/CSS, Git, Node.js, SQL'}</p>
            <p><strong>Soft & Professional Skills:</strong> ${skills.soft || 'Problem Solving, Team Collaboration, Communication'}</p>
          </div>

          <div class="section-title">Achievements & Activities</div>
          <ul>
            ${achievementsListHtml}
          </ul>

          <div class="section-title">Interests</div>
          <p class="objective-text">${interests || 'Open Source Software, Artificial Intelligence, Web Engineering'}</p>

          <div class="section-title">Declaration</div>
          <div class="declaration-box">
            <p style="font-style: italic; margin: 0;">"${declaration.statement || 'I hereby declare that all information provided is accurate to the best of my knowledge.'}"</p>
            <div class="signature-row">
              <span>Date: ${currentDate}</span>
              <span>Signature: <strong>${studentName}</strong></span>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-12 transition-all duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Smart CV Architect</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            AI-powered ATS Resume Builder with optional structural reference template matching & Interview PDF Export.
          </p>
        </div>

        <button
          onClick={handleFillSampleData}
          className="flex items-center gap-2 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-lg border border-border transition-colors shrink-0"
        >
          <RotateCcw size={14} /> Fill Sample Data
        </button>
      </header>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl flex items-center justify-between gap-3 text-sm font-medium shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>
              Smart ATS Resume successfully generated! Ready for real interview PDF export.
            </span>
          </div>
        </div>
      )}

      {/* Main Form + Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Forms & Template Upload */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Section 1: Template Upload Zone */}
          <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout size={18} className="text-primary" />
                <h3 className="font-semibold text-base text-foreground">Template Upload Zone</h3>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Optional</span>
              </div>
              {templateMeta && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <FileCheck size={14} /> Template Active
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Upload a reference CV template (PDF, DOCX, or TXT). The AI will analyze its layout and section hierarchy to structure your final output.
            </p>

            {!templateMeta ? (
              <label className="border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 hover:bg-muted/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                <Upload size={26} className="text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                <span className="text-xs font-semibold text-foreground group-hover:text-primary">
                  Click to upload reference template
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">
                  Supports PDF, DOCX, TXT, or MD format
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-foreground truncate">{templateMeta.name}</p>
                    <p className="text-[11px] text-muted-foreground">{templateMeta.size} • {templateMeta.type}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveTemplate}
                  className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Remove template"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Structured Data Input Fields */}
          <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-base border-b border-border pb-3 text-foreground flex items-center gap-2">
              <FileText size={18} className="text-primary" /> Structured Data Input
            </h3>

            {/* CAREER OBJECTIVE */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Target size={14} className="text-primary" /> Career Objective
              </label>
              <textarea
                rows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="State your career goals, target role, and key strengths..."
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all resize-y"
              />
            </div>

            {/* EDUCATION */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <GraduationCap size={14} className="text-primary" /> Education
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block mb-1">Degree / Qualification</span>
                  <input
                    type="text"
                    value={education.degree}
                    onChange={(e) => setEducation({ ...education, degree: e.target.value })}
                    placeholder="e.g. B.Tech in Computer Science"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block mb-1">Institution Name</span>
                  <input
                    type="text"
                    value={education.institution}
                    onChange={(e) => setEducation({ ...education, institution: e.target.value })}
                    placeholder="e.g. Tech University"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block mb-1">Graduation Year</span>
                  <input
                    type="text"
                    value={education.year}
                    onChange={(e) => setEducation({ ...education, year: e.target.value })}
                    placeholder="e.g. 2026"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block mb-1">Grades / GPA</span>
                  <input
                    type="text"
                    value={education.grades}
                    onChange={(e) => setEducation({ ...education, grades: e.target.value })}
                    placeholder="e.g. CGPA 8.7 / 10"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* SKILLS & COMPETENCIES */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" /> Skills & Competencies
              </label>
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block mb-1">Technical Skills</span>
                <input
                  type="text"
                  value={skills.technical}
                  onChange={(e) => setSkills({ ...skills, technical: e.target.value })}
                  placeholder="e.g. React, JavaScript, Node.js, Python, Git, SQL"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <span className="text-[11px] font-medium text-muted-foreground block mb-1">Soft Skills</span>
                <input
                  type="text"
                  value={skills.soft}
                  onChange={(e) => setSkills({ ...skills, soft: e.target.value })}
                  placeholder="e.g. Leadership, Problem Solving, Communication, Teamwork"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* ACHIEVEMENTS & ACTIVITIES */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-primary" /> Achievements & Activities
              </label>
              <textarea
                rows={3}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Hackathon wins, project highlights, leadership roles, certifications..."
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all resize-y"
              />
            </div>

            {/* INTERESTS */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <HeartHandshake size={14} className="text-primary" /> Interests
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. Open Source, Cloud Tech, UI/UX, AI Innovations"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
              />
            </div>

            {/* DECLARATION */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" /> Declaration
              </label>
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={declaration.statement}
                  onChange={(e) => setDeclaration({ ...declaration, statement: e.target.value })}
                  placeholder="Standard declaration statement..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                />
                <div>
                  <span className="text-[11px] font-medium text-muted-foreground block mb-1">Full Name / Signature</span>
                  <input
                    type="text"
                    value={declaration.signatureName}
                    onChange={(e) => setDeclaration({ ...declaration, signatureName: e.target.value })}
                    placeholder="Your Full Name"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateCv}
              disabled={isGenerating}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 shadow-md transition-all disabled:opacity-50 text-sm mt-3"
            >
              <Wand2 size={18} className={isGenerating ? "animate-spin" : ""} />
              {isGenerating ? "Architecting ATS Resume..." : "Generate ATS CV"}
            </button>
          </div>
        </div>

        {/* Right Column: Real Interview Resume Document Preview & PDF Export */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="border border-border bg-card rounded-xl p-5 shadow-sm flex flex-col flex-1 min-h-[620px] relative">
            
            {/* Header Actions & Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 mb-4 gap-3">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-primary" />
                <h3 className="font-semibold text-base text-foreground">Interview Resume Sheet</h3>
              </div>

              <div className="flex items-center gap-2">
                {/* View Switcher Tabs */}
                <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
                  <button
                    onClick={() => setViewMode('pdf')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'pdf' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Eye size={12} /> Executive PDF
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'raw' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Code size={12} /> Raw ATS Text
                  </button>
                </div>

                {/* Print / Download PDF Button */}
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all shrink-0"
                  title="Download / Print Interview PDF"
                >
                  <Printer size={14} /> Download PDF
                </button>
              </div>
            </div>

            {/* Generated Resume Content Display */}
            {generatedCv || true ? (
              viewMode === 'pdf' ? (
                /* Executive A4 Document View for Real Interviews */
                <div className="flex-1 bg-white text-gray-900 rounded-lg p-6 md:p-8 border border-gray-300 shadow-xl overflow-y-auto font-sans leading-normal max-h-[640px] text-xs">
                  {/* Candidate Header */}
                  <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                    <h2 className="text-2xl font-extrabold uppercase tracking-wider text-slate-900">
                      {declaration.signatureName || defaultName}
                    </h2>
                    <p className="text-[11px] text-slate-600 mt-1 font-medium">
                      {defaultEmail} &nbsp;•&nbsp; +1 (555) 019-2834 &nbsp;•&nbsp; github.com/student &nbsp;•&nbsp; linkedin.com/in/student
                    </p>
                  </div>

                  {/* CAREER OBJECTIVE */}
                  <div className="mb-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-gray-300 pb-0.5 mb-1.5">
                      Career Objective
                    </h4>
                    <p className="text-slate-700 text-justify leading-relaxed">
                      {objective || 'Enthusiastic student eager to contribute technical skills and analytical problem solving in a software development environment.'}
                    </p>
                  </div>

                  {/* EDUCATION */}
                  <div className="mb-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-gray-300 pb-0.5 mb-1.5">
                      Education
                    </h4>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{education.institution || 'Technology University'}</span>
                      <span>Class of {education.year || '2026'}</span>
                    </div>
                    <div className="text-slate-700 mt-0.5">
                      <span className="font-semibold">{education.degree || 'B.Tech in Computer Science'}</span> &nbsp;•&nbsp; Grades: {education.grades || 'GPA 3.8 / 4.0'}
                    </div>
                  </div>

                  {/* SKILLS & COMPETENCIES */}
                  <div className="mb-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-gray-300 pb-0.5 mb-1.5">
                      Skills & Competencies
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Technical Skills:</strong> {skills.technical || 'JavaScript, React, Node.js, HTML5/CSS3, Git, SQL'}<br />
                      <strong className="text-slate-900">Soft Skills:</strong> {skills.soft || 'Problem Solving, Team Collaboration, Technical Communication'}
                    </p>
                  </div>

                  {/* ACHIEVEMENTS & ACTIVITIES */}
                  <div className="mb-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-gray-300 pb-0.5 mb-1.5">
                      Achievements & Activities
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      {achievements
                        ? achievements.split('\n').filter(Boolean).map((ach, idx) => (
                            <li key={idx}>{ach.replace(/^[•\-\*]\s*/, '')}</li>
                          ))
                        : (
                          <>
                            <li>Secured 1st Place in University Hackathon 2025.</li>
                            <li>Built open-source web application utilized by 500+ active students.</li>
                          </>
                        )
                      }
                    </ul>
                  </div>

                  {/* INTERESTS */}
                  <div className="mb-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-gray-300 pb-0.5 mb-1.5">
                      Interests
                    </h4>
                    <p className="text-slate-700">
                      {interests || 'Open Source Development, Artificial Intelligence, Web Engineering'}
                    </p>
                  </div>

                  {/* DECLARATION */}
                  <div className="pt-2 border-t border-dashed border-gray-300 text-[11px] text-slate-600">
                    <p className="italic">
                      "{declaration.statement || 'I hereby declare that all details provided are true and correct to the best of my knowledge.'}"
                    </p>
                    <div className="flex justify-between items-center mt-3 pt-2 font-semibold text-slate-900">
                      <span>Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <span>Signature: {declaration.signatureName || defaultName}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Raw Markdown View */
                <div className="flex-1 bg-muted/20 border border-border rounded-lg p-5 font-mono text-xs text-foreground overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner max-h-[640px]">
                  {generatedCv || 'Click "Generate ATS CV" to produce the raw text formatting...'}
                </div>
              )
            ) : (
              <div className="flex-1 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-8 text-center bg-muted/10 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted mb-3 text-muted-foreground">
                  <Wand2 size={32} />
                </div>
                <h4 className="font-semibold text-sm text-foreground">Ready to Architect</h4>
                <p className="text-xs max-w-xs mt-1">
                  Fill in your details or upload an optional reference template, then click <strong>"Generate ATS CV"</strong>.
                </p>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                {templateApplied ? (
                  <>
                    <CheckCircle2 size={13} className="text-primary shrink-0" />
                    <span>Reference template hierarchy applied</span>
                  </>
                ) : (
                  <span>Format: Official Interview A4 Document</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCv}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
                >
                  <Copy size={13} /> {copied ? "Copied" : "Copy Raw"}
                </button>
                <button
                  onClick={handleDownloadMd}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
                >
                  <Download size={13} /> Markdown
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
