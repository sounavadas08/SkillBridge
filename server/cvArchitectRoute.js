/**
 * Backend Server API Endpoint Route Logic for Smart CV Architect
 * 
 * Express API Endpoint for receiving user CV data and optional uploaded template file,
 * extracting structure, and generating an ATS-optimized CV via AI/LLM (Gemini API).
 */

import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Core System Instructions for ATS Resume Architect
const ATS_SYSTEM_INSTRUCTION = `You are an expert ATS-resume architect. You will receive raw data for a student's Career Objective, Education, Skills & Competencies, Achievements & Activities, Interests, and Declaration. Your task is to rewrite and format this raw data into highly professional, action-oriented, ATS-friendly language. If a reference template structure is provided, format your output to match its flow and section ordering exactly. Do not invent missing data; enhance the provided input using strong action verbs.`;

/**
 * Extracts layout and structural flow from an uploaded template file buffer
 */
function extractTemplateStructure(file) {
  if (!file) return null;
  
  const textContent = file.buffer.toString('utf-8');
  
  // Extract major heading lines or section ordering from document text
  const lines = textContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const potentialHeadings = lines.filter(line => 
    line.length < 50 && (line === line.toUpperCase() || line.endsWith(':') || /^[A-Z0-9\s\-&]{3,}$/.test(line))
  );

  return {
    filename: file.originalname,
    mimeType: file.mimetype,
    detectedHeadings: potentialHeadings.length > 0 ? potentialHeadings : ['Header', 'Career Objective', 'Education', 'Skills', 'Achievements', 'Interests', 'Declaration'],
    rawSnippet: textContent.substring(0, 1000)
  };
}

/**
 * POST /api/cv-architect/generate
 * Payload: JSON or Multipart FormData
 */
router.post('/generate', upload.single('templateFile'), async (req, res) => {
  try {
    const rawData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const templateFile = req.file;

    // 1. Extract structure if template uploaded
    const templateStructure = extractTemplateStructure(templateFile);

    // 2. Build structured prompt
    const { objective, education, skills, achievements, interests, declaration } = rawData;

    let userPrompt = `Student Raw Data Submission:\n\n`;
    userPrompt += `--- CAREER OBJECTIVE ---\n${objective || 'Not provided'}\n\n`;
    userPrompt += `--- EDUCATION ---\nDegree: ${education?.degree || ''}\nInstitution: ${education?.institution || ''}\nYear: ${education?.year || ''}\nGrades/GPA: ${education?.grades || ''}\n\n`;
    userPrompt += `--- SKILLS & COMPETENCIES ---\nTechnical Skills: ${skills?.technical || ''}\nSoft Skills: ${skills?.soft || ''}\n\n`;
    userPrompt += `--- ACHIEVEMENTS & ACTIVITIES ---\n${achievements || 'Not provided'}\n\n`;
    userPrompt += `--- INTERESTS ---\n${interests || 'Not provided'}\n\n`;
    userPrompt += `--- DECLARATION ---\nStatement: ${declaration?.statement || 'I hereby declare that the information provided above is true to the best of my knowledge.'}\nSignature/Name: ${declaration?.signatureName || ''}\n\n`;

    if (templateStructure) {
      userPrompt += `--- REFERENCE TEMPLATE STRUCTURE ---\nFile: ${templateStructure.filename}\nDetected Flow & Section Ordering:\n${templateStructure.detectedHeadings.join(' -> ')}\n\nTemplate Reference Snippet:\n${templateStructure.rawSnippet}\n\nPlease format the generated resume to match the reference template's structural flow and section hierarchy exactly.`;
    } else {
      userPrompt += `--- REFERENCE TEMPLATE STRUCTURE ---\nNo reference template provided. Use standard high-impact ATS section layout: CAREER OBJECTIVE -> EDUCATION -> SKILLS & COMPETENCIES -> ACHIEVEMENTS & ACTIVITIES -> INTERESTS -> DECLARATION.`;
    }

    // 3. Call AI/LLM Service (Google Gemini API)
    const apiKey = process.env.GEMINI_API_KEY || req.headers['x-api-key'];
    
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent([
        { text: ATS_SYSTEM_INSTRUCTION },
        { text: userPrompt }
      ]);

      const generatedCvText = result.response.text();

      return res.json({
        success: true,
        cvText: generatedCvText,
        templateApplied: !!templateStructure,
        templateInfo: templateStructure ? { name: templateStructure.filename, flow: templateStructure.detectedHeadings } : null
      });
    }

    // Fallback if no server API key provided
    return res.json({
      success: true,
      cvText: synthesizeFallbackCv(rawData, templateStructure),
      templateApplied: !!templateStructure,
      isFallback: true
    });

  } catch (error) {
    console.error('Error generating Smart CV:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to generate CV' });
  }
});

/**
 * Fallback ATS CV Synthesizer for offline / local testing
 */
function synthesizeFallbackCv(data, templateStructure) {
  const { objective, education, skills, achievements, interests, declaration } = data;
  const name = declaration?.signatureName || 'STUDENT NAME';

  return `================================================================================
                                ${name.toUpperCase()}
================================================================================

CAREER OBJECTIVE
--------------------------------------------------------------------------------
${objective || 'Enthusiastic and results-driven student seeking to leverage technical proficiency and problem-solving skills in a dynamic professional environment to drive impactful solutions.'}

EDUCATION
--------------------------------------------------------------------------------
${education?.institution ? education.institution.toUpperCase() : 'UNIVERSITY / COLLEGE'}
Degree: ${education?.degree || 'Bachelor of Science in Computer Science'}
Graduation Year: ${education?.year || '2025'} | Grades/GPA: ${education?.grades || '3.8 / 4.0'}
• Focused coursework in Software Engineering, Data Structures, Algorithms, and System Design.

SKILLS & COMPETENCIES
--------------------------------------------------------------------------------
• Technical Skills: ${skills?.technical || 'JavaScript, React, HTML5/CSS3, Git, Node.js, REST APIs'}
• Soft Skills: ${skills?.soft || 'Problem Solving, Team Collaboration, Agile Methodologies, Technical Communication'}

ACHIEVEMENTS & ACTIVITIES
--------------------------------------------------------------------------------
${achievements ? achievements.split('\n').map(a => a.startsWith('•') ? a : `• ${a}`).join('\n') : '• Spearheaded student technology projects with high performance outcomes.\n• Recognized for academic excellence and active participation in competitive hackathons.'}

INTERESTS
--------------------------------------------------------------------------------
${interests || 'Open Source Contribution, Cloud Computing Technologies, Competitive Programming, UI/UX Design'}

DECLARATION
--------------------------------------------------------------------------------
${declaration?.statement || 'I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief.'}

Signature / Authorized Name: ${declaration?.signatureName || name}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
================================================================================`;
}

export default router;
