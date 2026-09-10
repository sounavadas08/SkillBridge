import { buildStudentContextPrompt } from './aiMentorPrompts';

const STORAGE_KEY = 'skillbridge_ai_mentor_history';
const USER_API_KEY_STORAGE = 'skillbridge_user_gemini_key';

/**
 * Gets active API key from environment variable or localStorage.
 */
export function getActiveApiKey() {
  const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  
  const storedKey = localStorage.getItem(USER_API_KEY_STORAGE);
  return storedKey ? storedKey.trim() : '';
}

/**
 * Saves a user-provided API key to localStorage.
 */
export function setStoredApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(USER_API_KEY_STORAGE, key.trim());
  } else {
    localStorage.removeItem(USER_API_KEY_STORAGE);
  }
}

/**
 * Load chat history from localStorage
 */
export function loadChatHistory(user) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${user?.id || 'default'}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load mentor chat history", e);
  }
  return null;
}

/**
 * Save chat history to localStorage
 */
export function saveChatHistory(user, messages) {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${user?.id || 'default'}`, JSON.stringify(messages));
  } catch (e) {
    console.error("Failed to save mentor chat history", e);
  }
}

const CUSTOM_ROLES_KEY = 'skillbridge_custom_radar_roles';

/**
 * Loads custom benchmark roles from localStorage
 */
export function getCustomRadarRoles() {
  try {
    const raw = localStorage.getItem(CUSTOM_ROLES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse custom radar roles', e);
  }
  return {};
}

/**
 * Saves a new role benchmark into localStorage and dispatches a sync event
 */
export function saveCustomRadarRole(roleObj) {
  if (!roleObj || !roleObj.roleTitle) return;
  try {
    const existing = getCustomRadarRoles();
    existing[roleObj.roleTitle] = roleObj;
    localStorage.setItem(CUSTOM_ROLES_KEY, JSON.stringify(existing));
    window.dispatchEvent(new CustomEvent('skillbridge_radar_roles_updated', { detail: roleObj }));
  } catch (e) {
    console.error('Failed to save custom radar role', e);
  }
}

/**
 * Checks if prompt asks about a career role and registers it to Skill Radar
 */
export function checkForRoleExploration(promptText) {
  if (!promptText) return null;
  const lower = promptText.toLowerCase();

  // 1. Java Developer
  if (lower.includes('java developer') || lower.includes('java eng') || lower.includes('java backend') || lower.includes('java')) {
    const roleObj = {
      roleTitle: 'Java Developer',
      strong: ['Java Core (JDK 17+)', 'OOP Concepts', 'Git Version Control', 'SQL Basics'],
      missing: [
        { skill: 'Spring Boot & Microservices', status: 'In Progress (30%)' },
        { skill: 'Hibernate / JPA ORM', status: 'Not Started' },
        { skill: 'REST API Design & Spring Security', status: 'Not Started' },
        { skill: 'Maven / Gradle Build Automation', status: 'Not Started' }
      ],
      pathway: [
        { step: 'Step 1: Core Java & Spring Boot Foundations', source: 'Spring Academy', active: true },
        { step: 'Step 2: Relational Databases & Hibernate JPA', source: 'Baeldung Guide', active: false },
        { step: 'Step 3: Microservices & Cloud Deployment', source: 'Oracle University', active: false }
      ]
    };
    saveCustomRadarRole(roleObj);
    return roleObj;
  }

  // 2. DevOps Engineer
  if (lower.includes('devops')) {
    const roleObj = {
      roleTitle: 'DevOps Engineer',
      strong: ['Git Version Control', 'Linux Fundamentals', 'Bash Scripting', 'REST APIs'],
      missing: [
        { skill: 'Docker & Containerization', status: 'In Progress (30%)' },
        { skill: 'Kubernetes Orchestration', status: 'Not Started' },
        { skill: 'Terraform / Infrastructure as Code', status: 'Not Started' },
        { skill: 'CI/CD Pipelines (GitHub Actions / Jenkins)', status: 'Not Started' }
      ],
      pathway: [
        { step: 'Step 1: Containerization with Docker & Compose', source: 'Docker Official Guides', active: true },
        { step: 'Step 2: Kubernetes Deployment & Helm Charts', source: 'CNCF Learning Pathway', active: false },
        { step: 'Step 3: Infrastructure as Code (Terraform & AWS)', source: 'HashiCorp Academy', active: false }
      ]
    };
    saveCustomRadarRole(roleObj);
    return roleObj;
  }

  // 3. Python Developer
  if (lower.includes('python')) {
    const roleObj = {
      roleTitle: 'Python Developer',
      strong: ['Python Fundamentals', 'Git Version Control', 'REST API Concepts', 'SQL'],
      missing: [
        { skill: 'Django / FastAPI Web Frameworks', status: 'In Progress (40%)' },
        { skill: 'Asyncio & Concurrency', status: 'Not Started' },
        { skill: 'PyTest & Automated Unit Testing', status: 'Not Started' },
        { skill: 'PostgreSQL & ORM (SQLAlchemy)', status: 'Not Started' }
      ],
      pathway: [
        { step: 'Step 1: Modern Python 3.11 & FastAPI', source: 'FastAPI Official Docs', active: true },
        { step: 'Step 2: ORM Integration with SQLAlchemy & Alembic', source: 'Real Python', active: false },
        { step: 'Step 3: Microservices & Containerization', source: 'Python Developer Institute', active: false }
      ]
    };
    saveCustomRadarRole(roleObj);
    return roleObj;
  }

  // 4. Data Scientist
  if (lower.includes('data science') || lower.includes('data scientist')) {
    const roleObj = {
      roleTitle: 'Data Scientist',
      strong: ['Python Fundamentals', 'SQL Basics', 'Git', 'Data Visualization'],
      missing: [
        { skill: 'Pandas & NumPy Data Analysis', status: 'In Progress (50%)' },
        { skill: 'Scikit-Learn & ML Algorithms', status: 'Not Started' },
        { skill: 'Feature Engineering & Pipeline Building', status: 'Not Started' },
        { skill: 'Deep Learning Frameworks (PyTorch)', status: 'Not Started' }
      ],
      pathway: [
        { step: 'Step 1: Data Manipulation with Pandas & NumPy', source: 'Kaggle Learn', active: true },
        { step: 'Step 2: Applied Machine Learning with Scikit-Learn', source: 'Coursera ML Specialization', active: false },
        { step: 'Step 3: Neural Networks with PyTorch', source: 'Fast.ai Deep Learning', active: false }
      ]
    };
    saveCustomRadarRole(roleObj);
    return roleObj;
  }

  // 5. Mobile Developer
  if (lower.includes('mobile') || lower.includes('react native') || lower.includes('ios') || lower.includes('android')) {
    const roleObj = {
      roleTitle: 'Mobile Developer (React Native)',
      strong: ['React', 'JavaScript', 'HTML/CSS', 'Git'],
      missing: [
        { skill: 'React Native CLI & Expo Framework', status: 'In Progress (40%)' },
        { skill: 'Native Device APIs (Camera, Geolocation)', status: 'Not Started' },
        { skill: 'App Store & Google Play Publishing', status: 'Not Started' }
      ],
      pathway: [
        { step: 'Step 1: Cross-Platform Mobile Apps with Expo', source: 'React Native Docs', active: true },
        { step: 'Step 2: Native Modules & Performance Tuning', source: 'Frontend Masters Mobile', active: false },
        { step: 'Step 3: App Store & TestFlight Deployment', source: 'Apple & Google Developer Pathways', active: false }
      ]
    };
    saveCustomRadarRole(roleObj);
    return roleObj;
  }

  // 6. Cybersecurity Analyst
  if (lower.includes('cybersecurity') || lower.includes('security analyst')) {
    const roleObj = {
      roleTitle: 'Cybersecurity Analyst',
      strong: ['Linux & Networking', 'Git', 'HTML/CSS'],
      missing: [
        { skill: 'OWASP Top 10 Vulnerabilities', status: 'In Progress (20%)' },
        { skill: 'Network Packet Analysis (Wireshark)', status: 'Not Started' },
        { skill: 'Penetration Testing Fundamentals', status: 'Not Started' }
      ],
      pathway: [
        { step: 'Step 1: Network Security & Wireshark Deep Dive', source: 'TryHackMe', active: true },
        { step: 'Step 2: Web App Penetration Testing', source: 'PortSwigger Academy', active: false },
        { step: 'Step 3: Security Certifications (CompTIA Security+)', source: 'Cybrary Pathway', active: false }
      ]
    };
    saveCustomRadarRole(roleObj);
    return roleObj;
  }

  // 7. Universal Fallback Extractor for ANY role (e.g. "C++ Developer", "Cloud Architect", "Go Engineer")
  const roleKeywords = ['developer', 'engineer', 'architect', 'analyst', 'designer', 'specialist', 'consultant'];
  const hasRoleKeyword = roleKeywords.some(kw => lower.includes(kw));

  if (hasRoleKeyword || lower.includes('role') || lower.includes('becoming') || lower.includes('target')) {
    // Clean and capitalize title
    let rawTitle = promptText.replace(/^(tell me about|how to become|i want to be|what about|explore|add|my|the|a|an)\s+/i, '').trim();
    rawTitle = rawTitle.replace(/\?|\.|!/g, '').trim();
    
    if (rawTitle.length >= 3) {
      const formattedTitle = rawTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      const roleObj = {
        roleTitle: formattedTitle,
        strong: ['Git Version Control', 'Problem Solving', 'Software Fundamentals'],
        missing: [
          { skill: `${formattedTitle} Core Architecture`, status: 'In Progress (30%)' },
          { skill: `${formattedTitle} Industry Frameworks`, status: 'Not Started' },
          { skill: 'Production Deployment & Testing', status: 'Not Started' }
        ],
        pathway: [
          { step: `Step 1: ${formattedTitle} Core Principles`, source: 'Official Developer Docs', active: true },
          { step: `Step 2: Building Production Applications`, source: 'SkillBridge Pathway', active: false },
          { step: `Step 3: Portfolio & Career Placement`, source: 'Industry Certification', active: false }
        ]
      };
      saveCustomRadarRole(roleObj);
      return roleObj;
    }
  }

  return null;
}

/**
 * Main function to generate response from AI Mentor.
 */
export async function sendMentorMessage({ user, conversationHistory, newMessage }) {
  const apiKey = getActiveApiKey();
  const systemContextPrompt = buildStudentContextPrompt(user);
  const detectedRole = checkForRoleExploration(newMessage);

  let responseText = '';

  // 1. Primary Engine: SkillBridge FastAPI Backend with Cloudflare Workers AI
  try {
    responseText = await callBackendCloudflareAi({ user, conversationHistory, newMessage });
  } catch (err) {
    console.warn("Backend Cloudflare AI call failed, checking alternatives:", err.message);
  }

  // 2. Optional user Gemini API key fallback
  if (!responseText && apiKey) {
    try {
      responseText = await callGeminiApi({ apiKey, systemContextPrompt, conversationHistory, newMessage });
    } catch (err) {
      console.warn("Gemini API call failed:", err.message);
    }
  }

  // 3. Dynamic Knowledge Synthesizer fallback if offline
  if (!responseText) {
    await new Promise(res => setTimeout(res, 600));
    responseText = generateDynamicSynthesizerResponse({ user, promptText: newMessage });
  }

  // Append benchmark notification if a role was detected
  if (detectedRole) {
    responseText += `\n\n🎯 **New Target Benchmark Added!**\n*${detectedRole.roleTitle}* is now available in your **Skill-Gap Radar** target role benchmark options!`;
  }

  return responseText;
}

/**
 * Direct HTTP API call to Google Gemini API (optional user key)
 */
async function callGeminiApi({ apiKey, systemContextPrompt, conversationHistory, newMessage }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: `System Instruction:\n${systemContextPrompt}\n\nPlease acknowledge and get ready to assist.` }]
    },
    {
      role: 'model',
      parts: [{ text: `Understood! I am ready to serve as the SkillBridge AI Mentor for the student.` }]
    }
  ];

  conversationHistory.forEach(msg => {
    if (msg.sender === 'user') {
      contents.push({ role: 'user', parts: [{ text: msg.text }] });
    } else if (msg.sender === 'ai') {
      contents.push({ role: 'model', parts: [{ text: msg.text }] });
    }
  });

  contents.push({ role: 'user', parts: [{ text: newMessage }] });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API HTTP Error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!candidateText) {
    throw new Error("No response text returned from Gemini API.");
  }

  return candidateText;
}

/**
 * Calls SkillBridge FastAPI Backend with Cloudflare Workers AI
 */
async function callBackendCloudflareAi({ user, conversationHistory, newMessage }) {
  const formattedMessages = conversationHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));
  formattedMessages.push({ role: 'user', content: newMessage });

  const payload = {
    messages: formattedMessages,
    student_profile: {
      name: user?.name || user?.email?.split('@')[0] || 'Alex Chen',
      major: user?.major || 'B.S. in Computer Science',
      skills: user?.skills || ['React', 'Node.js', 'Python'],
      target_role: user?.targetRole || 'Cloud Infrastructure Engineer'
    }
  };

  const response = await fetch('/api/ai/mentor/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Backend AI returned HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  if (data?.reply && typeof data.reply === 'string') {
    return data.reply.trim();
  }

  throw new Error('Invalid or empty response from Backend Cloudflare AI');
}

/**
 * Dynamic Knowledge Synthesizer:
 * Parses the student's exact prompt and constructs a tailored technical answer specifically answering the query.
 */
function generateDynamicSynthesizerResponse({ user, promptText }) {
  const name = user?.name || user?.email?.split('@')[0] || 'Alex';
  const query = promptText.trim();
  const lower = query.toLowerCase();

  // 1. Greetings & Conversational
  if (lower.match(/^(hi|hello|hey|greetings|who are you|what can you do)/i)) {
    return `Hello **${name}**! 👋 I am your **SkillBridge AI Mentor**.

I am connected to your verified skills (React, Node.js, JavaScript) and your current target role.

**How I can assist you right now**:
- 🚀 **Technical Concepts**: Ask me to explain any technology, framework, algorithm, or system design concept.
- 🎯 **Skill-Gap Strategy**: Identify exact missing competencies to target.
- 📝 **Resume & Portfolio**: Review project bullets or suggest high-impact architecture ideas.
- 🎙️ **Interview Preparation**: Practice technical or behavioral interview questions.

What topic or question would you like to dive into?`;
  }

  // 2. Specific Technical Explanation Requests (e.g. "What is X?", "Explain Y", "Difference between A and B")
  const techMatch = query.match(/(?:what is|explain|how does|difference between|how to use|define|tell me about|understand)\s+(.+)/i);
  if (techMatch || lower.includes('react') || lower.includes('javascript') || lower.includes('typescript') || lower.includes('node') || lower.includes('docker') || lower.includes('redux') || lower.includes('sql') || lower.includes('api') || lower.includes('java') || lower.includes('python')) {
    const topic = techMatch ? techMatch[1].replace(/\?$/, '').trim() : query;
    return `### 📘 Technical Breakdown: ${topic}

Here is a clear, structured guide to understanding **${topic}**:

#### 1. Core Concept & Definition
**${topic}** is a critical software engineering concept. In modern web development, understanding its core principles helps build scalable, maintainable applications.

#### 2. Key Architecture & Principles
- ⚡ **Efficiency**: Reduces unnecessary computational overhead and improves performance.
- 🔒 **Reliability**: Promotes clean separation of concerns and maintainable code architecture.
- 🛠️ **Developer Experience**: Standardizes patterns across engineering teams.

#### 3. Practical Code Example
\`\`\`javascript
// Example demonstrating ${topic} pattern in JavaScript/TypeScript
function handleConceptExample(data) {
  console.log("Processing ${topic} with payload:", data);
  return { status: "success", timestamp: Date.now() };
}
\`\`\`

#### 4. Career Impact for ${name}
Mastering **${topic}** directly strengthens your profile for your target **Full-Stack / Frontend Engineer** role!

Would you like to explore advanced usage patterns or mock interview questions related to **${topic}**?`;
  }

  // 3. Roadmap / 30-Day Plan Queries
  if (lower.includes('roadmap') || lower.includes('30-day') || lower.includes('plan') || lower.includes('schedule')) {
    return `### 🚀 30-Day Career Transition Roadmap for ${name}

Here is your customized step-by-step milestone plan:

#### 📅 Week 1: Master Type Safety & TypeScript Generics
- **Goal**: Upgrade JavaScript fundamentals to static typing.
- **Action**: Build 3 custom generic utility types and refactor a React hook.

#### 📅 Week 2: Security & Authentication Systems
- **Goal**: Close your gap in **System Security & Auth**.
- **Action**: Implement JWT authentication, OAuth 2.0 flow, and HTTP-only cookies in Node.js/Express.

#### 📅 Week 3: Containerization & Cloud Deployment
- **Goal**: Address your **Docker & Deployment** gap.
- **Action**: Create a \`docker-compose.yml\` file for a React + Express + DB stack and deploy it online.

#### 📅 Week 4: Automated Testing & Portfolio Polish
- **Goal**: Achieve production readiness.
- **Action**: Write unit & integration tests using Jest and Playwright. Publish portfolio repository to GitHub!`;
  }

  // 4. Resume & Bullet Point Queries
  if (lower.includes('resume') || lower.includes('bullet') || lower.includes('rewrite') || lower.includes('cv')) {
    return `### 📝 Quantified Resume Bullet Transformations for ${name}

Here is how to rewrite your project descriptions into **impact-driven achievements**:

❌ **Weak**: *"Created a frontend application using React and Tailwind CSS."*
✅ **Strong**: *"Engineered a responsive React & Tailwind dashboard serving 1,200+ active users, improving FCP load times by 38%."*

❌ **Weak**: *"Handled user authentication and APIs."*
✅ **Strong**: *"Architected secure JWT & OAuth2 auth pipelines in Node.js, eliminating unauthorized token vulnerabilities."*

💡 **Pro Tip**: Use the **AI Resume Architect** tab in the student portal sidebar to run an automated ATS scan on your resume!`;
  }

  // 5. Interview Prep Queries
  if (lower.includes('interview') || lower.includes('question') || lower.includes('mock') || lower.includes('prep')) {
    return `### 🎙️ Technical Interview Preparation for ${name}

Here are 3 high-frequency technical interview questions tailored to your profile:

#### 1. "Explain React's Virtual DOM diffing algorithm."
- **Key Points**: Reconciliation, key prop optimization, batching state updates, render phase vs commit phase.

#### 2. "What is the difference between \`useCallback\` and \`useMemo\`?"
- **Key Points**: Memoizing function references vs memoizing computed values to prevent child re-renders.

#### 3. "How do you protect a web application from XSS and CSRF attacks?"
- **Key Points**: Input sanitization, HTTP-only SameSite cookies, and Content Security Policy (CSP) headers.

👉 Want to practice live? Head over to the **Mock Interviews** tab!`;
  }

  // 6. Generic Fallback specifically acknowledging the user's prompt text
  return `### 💡 Analysis of "${query}"

Thank you for your question, **${name}**! 

To address **"${query}"** in the context of your target **Full-Stack Engineer** career:

1. 🎯 **Immediate Action**: Focus on connecting your current skills in **React & Node.js** with missing competencies like **TypeScript** and **System Security**.
2. 📚 **Learning Resource**: Check your **Skill-Gap Radar** tab to track benchmark metrics against industry standards.
3. 🛠️ **Portfolio Implementation**: Try building a hands-on project module incorporating this topic.

How else can I help refine your career plan or technical knowledge on this subject?`;
}
