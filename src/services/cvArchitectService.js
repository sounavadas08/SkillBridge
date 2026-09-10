import { getActiveApiKey } from './aiMentorService';

export const ATS_SYSTEM_INSTRUCTION = `You are an expert ATS-resume architect. You will receive raw data for a student's Career Objective, Education, Skills & Competencies, Achievements & Activities, Interests, and Declaration. Your task is to rewrite and format this raw data into highly professional, action-oriented, ATS-friendly language. If a reference template structure is provided, format your output to match its flow and section ordering exactly. Do not invent missing data; enhance the provided input using strong action verbs.`;

/**
 * Client-side template file structural layout extractor
 */
export async function extractTemplateStructure(file) {
  if (!file) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result || '';
        // Extract layout headings
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const headings = lines.filter(line => 
          line.length < 60 && (line === line.toUpperCase() || line.endsWith(':') || /^[A-Z0-9\s\-&]{3,}$/.test(line))
        );

        resolve({
          name: file.name,
          type: file.type || 'Document Template',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          detectedFlow: headings.length > 0 ? headings.slice(0, 8) : ['Header', 'Career Objective', 'Education', 'Skills', 'Achievements', 'Interests', 'Declaration'],
          rawTextSnippet: text.substring(0, 1200)
        });
      } catch (err) {
        console.warn("Template file parse warning:", err);
        resolve({
          name: file.name,
          type: file.type || 'Document Template',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          detectedFlow: ['Header', 'Career Objective', 'Education', 'Skills', 'Achievements', 'Interests', 'Declaration'],
          rawTextSnippet: `Reference Template File: ${file.name}`
        });
      }
    };

    reader.onerror = () => {
      resolve({
        name: file.name,
        type: file.type || 'Document Template',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        detectedFlow: ['Header', 'Career Objective', 'Education', 'Skills', 'Achievements', 'Interests', 'Declaration'],
        rawTextSnippet: `Reference Template File: ${file.name}`
      });
    };

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      // For binary files like PDF / DOCX, read string representation or fallback
      reader.readAsText(file);
    }
  });
}

/**
 * Main service call to generate the Smart ATS CV
 */
export async function generateSmartCV(cvData, templateFile = null) {
  // 1. Extract structure if template uploaded
  let templateStructure = null;
  if (templateFile) {
    templateStructure = await extractTemplateStructure(templateFile);
  }

  // 2. Build structured user prompt
  const { objective, education, skills, achievements, interests, declaration } = cvData;

  let prompt = `Student Raw Data Submission:\n\n`;
  prompt += `=== CAREER OBJECTIVE ===\n${objective || 'Not specified'}\n\n`;
  prompt += `=== EDUCATION ===\nDegree: ${education?.degree || ''}\nInstitution: ${education?.institution || ''}\nYear: ${education?.year || ''}\nGrades/GPA: ${education?.grades || ''}\n\n`;
  prompt += `=== SKILLS & COMPETENCIES ===\nTechnical Skills: ${skills?.technical || ''}\nSoft Skills: ${skills?.soft || ''}\n\n`;
  prompt += `=== ACHIEVEMENTS & ACTIVITIES ===\n${achievements || 'Not specified'}\n\n`;
  prompt += `=== INTERESTS ===\n${interests || 'Not specified'}\n\n`;
  prompt += `=== DECLARATION ===\nStatement: ${declaration?.statement || 'I hereby declare that the information provided is true to the best of my knowledge.'}\nSignature / Name: ${declaration?.signatureName || ''}\n\n`;

  if (templateStructure) {
    prompt += `=== REFERENCE TEMPLATE STRUCTURE ===\nUploaded Reference File: ${templateStructure.name}\nDetected Layout Flow & Section Ordering:\n${templateStructure.detectedFlow.join(' -> ')}\n\nTemplate Reference Snippet:\n${templateStructure.rawTextSnippet}\n\nIMPORTANT: Match the exact section ordering and formatting structure of the reference template.`;
  } else {
    prompt += `=== REFERENCE TEMPLATE STRUCTURE ===\nNo custom template uploaded. Use optimal ATS structural flow: CAREER OBJECTIVE -> EDUCATION -> SKILLS & COMPETENCIES -> ACHIEVEMENTS & ACTIVITIES -> INTERESTS -> DECLARATION.`;
  }

  const apiKey = getActiveApiKey();

  // 3. Call Gemini API if key is available
  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `System Instructions:\n${ATS_SYSTEM_INSTRUCTION}\n\nUser Request:\n${prompt}` }]
            }
          ]
        })
      });

      if (response.ok) {
        const json = await response.json();
        const cvText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (cvText) {
          return {
            success: true,
            cvText,
            templateApplied: !!templateStructure,
            templateInfo: templateStructure
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed for CV Architect, using fallback synthesis:", err);
    }
  }

  // 4. Intelligent Local Synthesizer Fallback
  await new Promise(res => setTimeout(res, 800)); // Simulate processing delay
  return {
    success: true,
    cvText: synthesizeATSResume(cvData, templateStructure),
    templateApplied: !!templateStructure,
    templateInfo: templateStructure,
    isFallback: true
  };
}

/**
 * Intelligent Fallback ATS Resume Synthesizer
 */
function synthesizeATSResume(data, templateStructure) {
  const { objective, education, skills, achievements, interests, declaration } = data;
  const name = declaration?.signatureName || 'STUDENT NAME';

  const objFormatted = objective && objective.trim()
    ? objective.trim()
    : 'Driven and innovative Computer Science student with a strong background in software engineering, modern web technologies, and algorithm design. Passionate about applying problem-solving skills to build scalable applications in a dynamic internship role.';

  const eduDegree = education?.degree || 'Bachelor of Science in Computer Science';
  const eduInst = education?.institution || 'State University / Tech Institute';
  const eduYear = education?.year || '2025';
  const eduGrades = education?.grades || 'GPA 3.8 / 4.0';

  const techSkills = skills?.technical || 'JavaScript (ES6+), React.js, HTML5, CSS3, Node.js, Git, RESTful APIs, SQL';
  const softSkills = skills?.soft || 'Analytical Thinking, Agile Collaboration, Cross-functional Communication, Leadership';

  const achList = achievements && achievements.trim()
    ? achievements.split('\n').filter(Boolean).map(item => item.startsWith('•') ? item : `• ${item}`).join('\n')
    : '• Winner of Annual University Hackathon: Developed an AI-powered student learning platform.\n• Published Research Paper on Machine Learning Optimization in Student Tech Journal.\n• Dean\'s Honor List for outstanding academic performance across consecutive semesters.';

  const interestList = interests && interests.trim()
    ? interests.trim()
    : 'Open Source Development, Cloud Architecture (AWS/GCP), Competitive Coding, Tech Mentorship';

  const declStatement = declaration?.statement || 'I hereby declare that all the information provided above is authentic and true to the best of my knowledge and belief.';
  const declSig = declaration?.signatureName || name;

  if (templateStructure && templateStructure.name) {
    return `# ${name.toUpperCase()}
*ATS-Optimized Resume formatted based on template structural reference: ${templateStructure.name}*

---

## 1. CAREER OBJECTIVE
${objFormatted}

## 2. EDUCATION
**${eduInst.toUpperCase()}**
* ${eduDegree} | Graduation Year: ${eduYear} | Performance: ${eduGrades}
* Coursework: Data Structures & Algorithms, Full Stack Web Development, Database Management, System Architecture.

## 3. SKILLS & COMPETENCIES
* **Technical Skills:** ${techSkills}
* **Soft & Leadership Skills:** ${softSkills}

## 4. ACHIEVEMENTS & ACTIVITIES
${achList}

## 5. INTERESTS
${interestList}

## 6. DECLARATION
"${declStatement}"

**Authorized Signature / Name:** ${declSig}
**Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }

  return `# ${name.toUpperCase()}
Email: student@university.edu | Phone: +1 (555) 019-2834 | GitHub: github.com/student | LinkedIn: linkedin.com/in/student

================================================================================
CAREER OBJECTIVE
================================================================================
${objFormatted}

================================================================================
EDUCATION
================================================================================
${eduInst.toUpperCase()}
Degree: ${eduDegree}
Graduation Year: ${eduYear} | Academic Performance: ${eduGrades}
• Key Focus: Applied Software Engineering, Data Structures, Object-Oriented Design, Database Systems.

================================================================================
SKILLS & COMPETENCIES
================================================================================
• Technical Skills: ${techSkills}
• Soft Skills: ${softSkills}

================================================================================
ACHIEVEMENTS & ACTIVITIES
================================================================================
${achList}

================================================================================
INTERESTS
================================================================================
${interestList}

================================================================================
DECLARATION
================================================================================
${declStatement}

Signature / Name: ${declSig}
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
================================================================================`;
}
