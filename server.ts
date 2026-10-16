import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY is available
let aiClient: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('[Server] Failed to initialize GoogleGenAI client:', err);
  }
}

// -----------------------------------------------------------------------------
// CENTRAL SCHOOL AI API ENDPOINTS
// -----------------------------------------------------------------------------

// 1. Health & AI status check
app.get('/api/school-ai/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiEnabled: Boolean(aiClient),
    model: 'gemini-3.8-flash',
    school: 'Little Roses Academy Nakuru',
    motto: 'Much from Little',
  });
});

// 2. Central Multi-Portal School AI Query (RAG + Role Enforced)
app.post('/api/school-ai/query', async (req: Request, res: Response) => {
  try {
    const {
      role,
      userId,
      userName,
      query,
      context, // authorized school data context (pupil marks, child profile, teacher schemes, etc.)
      activeChildUpi,
      assignedGrade,
      assignedSubject,
    } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required.' });
      return;
    }

    // If Gemini client is not configured, signal offline/local fallback
    if (!aiClient) {
      res.json({
        fallback: true,
        message: 'Cloud AI service is offline or unconfigured. Local heuristic RAG active.',
      });
      return;
    }

    const systemInstruction = `You are Little Roses School AI, the official central educational assistant for Little Roses Academy in Nakuru, Kenya (Motto: "Much from Little").
You serve four distinct portals: Admin, Teacher, Parent/Guardian, and Learner.

CURRENT USER ROLE: ${role || 'guest'}
CURRENT USER: ${userName || 'Authorized User'} (ID: ${userId || 'unknown'})
${activeChildUpi ? `ACTIVE CHILD UPI: ${activeChildUpi}` : ''}
${assignedGrade ? `ASSIGNED GRADE: ${assignedGrade}` : ''}
${assignedSubject ? `ASSIGNED SUBJECT: ${assignedSubject}` : ''}

CRITICAL RULES:
1. ONLY answer using facts provided in the authorized context or verified Kenyan CBC primary curriculum facts (Grades 1-6).
2. NEVER invent marks, learners, parent records, documents, or teacher assignments.
3. If information is not in the context or unknown, clearly state: "This information is not recorded in the school records."
4. Tone & Language:
   - For Admin: concise, authoritative, administrative, action-oriented.
   - For Teachers: professional CBC pedagogical guidance, lesson planning, formative rubric insights.
   - For Parents: warm, encouraging, plain English explanations of their child's specific marks and strengths.
   - For Learners: friendly, age-appropriate, encouraging, bite-sized explanations.
5. Assessment breakdown rule: Formative Assignments count for 40%, Continuous Assessment Tests (CATs) count for 60%.`;

    const promptText = `AUTHORIZED SCHOOL CONTEXT:\n${JSON.stringify(context || {}, null, 2)}\n\nUSER QUESTION:\n${query}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.3, // low temperature for high fidelity to ground truth
      },
    });

    res.json({
      success: true,
      answer: response.text || 'No response generated.',
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('[SchoolAI Query Error]:', error);
    res.status(500).json({
      error: error.message || 'Failed to process AI query',
      fallback: true,
    });
  }
});

// 3. Smart Document Classification & Mismatch Detection
app.post('/api/school-ai/analyze-document', async (req: Request, res: Response) => {
  try {
    const {
      fileName,
      fileType,
      declaredGrade,
      declaredSubject,
      declaredCategory,
      extractedText,
    } = req.body;

    if (!extractedText || extractedText.length < 10) {
      res.json({
        hasMismatch: false,
        confidence: 0,
        explanation: 'Document content could not be extracted or is empty.',
        suggestedGrade: declaredGrade || 'Grade 1',
        suggestedSubject: declaredSubject || 'General',
        suggestedCategory: declaredCategory || 'Other',
      });
      return;
    }

    if (!aiClient) {
      // Local fallback handled by client
      res.json({ fallback: true });
      return;
    }

    const systemInstruction = `You are the Little Roses Academy Document Intelligence Engine for Kenyan CBC Primary (Grades 1-6).
Analyze the provided document text and compare it with the uploaded metadata:
- Declared Grade: ${declaredGrade}
- Declared Subject: ${declaredSubject}
- Declared Category: ${declaredCategory}
- File Name: ${fileName}

Identify:
1. Detected Grade (PP1, PP2, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6)
2. Detected Subject (e.g. Mathematics, English Language, Kiswahili, Science and Technology, Social Studies, Agriculture, Creative Arts, Religious Education)
3. Detected Resource Type (Scheme of Work, Lesson Plan, Lesson Notes, Class Notes, Assignment, CAT, Revision Exam, Reading Material, Record of Work, Rubric)
4. Detected Strand and Sub-strand
5. Whether there is a MISMATCH between what was declared/filename and the actual content (e.g., file says Grade 2 Math, but content teaches Grade 4 fractions).
6. Explain the mismatch clearly in 1-2 sentences with evidence.
7. Recommend the correct classification.`;

    const promptText = `DOCUMENT TEXT EXCERPT (first 4000 characters):\n${extractedText.slice(0, 4000)}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      analysis: parsed,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('[Document Analysis Error]:', error);
    res.status(500).json({ error: error.message, fallback: true });
  }
});

// 4. CBC Assessment & Question Generator
app.post('/api/school-ai/generate-assessment', async (req: Request, res: Response) => {
  try {
    const {
      type, // 'assignment' | 'cat' | 'revision' | 'remedial'
      grade,
      subject,
      strand,
      substrand,
      sourceMaterial, // source text from teacher notes or scheme
      questionCount,
      difficulty,
    } = req.body;

    if (!aiClient) {
      res.json({ fallback: true });
      return;
    }

    const systemInstruction = `You are a curriculum specialist for Little Roses Academy, Nakuru, generating CBC-aligned formative assessments for Kenyan Primary Schools.
Assessment Guidelines:
- Assignments: 40% weighting
- CATs: 60% weighting
- Kenyan CBC 4-level rubric: Exceeding Expectations (4), Meeting Expectations (3), Approaching Expectations (2), Below Expectations (1)
- Generate age-appropriate questions directly grounded in the supplied source material.
- Output a complete assessment with Title, Grade, Subject, Strand, Substrand, Questions with Marks, and a comprehensive Teacher Marking Scheme.`;

    const promptText = `GENERATE A CBC ${type ? type.toUpperCase() : 'ASSESSMENT'}
Grade: ${grade}
Subject: ${subject}
Strand: ${strand || 'Core Competencies'}
Substrand: ${substrand || 'Key Concepts'}
Number of Questions: ${questionCount || 5}
Difficulty: ${difficulty || 'Standard CBC'}
SOURCE MATERIAL EXCERPT:
${sourceMaterial || 'Standard Kenya Primary CBC Curriculum Objectives'}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      success: true,
      content: response.text,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('[Assessment Generation Error]:', error);
    res.status(500).json({ error: error.message, fallback: true });
  }
});

// 5. CBC Lesson Plan Generator
app.post('/api/school-ai/generate-lesson-plan', async (req: Request, res: Response) => {
  try {
    const {
      grade,
      subject,
      strand,
      substrand,
      durationMinutes,
      learningResources,
    } = req.body;

    if (!aiClient) {
      res.json({ fallback: true });
      return;
    }

    const systemInstruction = `You are a Kenyan CBC Curriculum & Lesson Planning Specialist for Little Roses Academy, Nakuru.
Generate an official Kenyan Competency-Based Curriculum (CBC) Primary Lesson Plan for Grades 1–6.
Structure requirements:
1. Administrative Header: Grade, Learning Area (Subject), Strand, Sub-strand, Duration (e.g. 40 mins), Date placeholder.
2. Specific Learning Outcomes: By the end of the lesson, the learner should be able to: (Knowledge, Skills, Values/Attitudes).
3. Key Inquiry Question (KIQ): 1 thought-provoking question.
4. Core Competencies: e.g. Communication & Collaboration, Critical Thinking, Digital Literacy, Creativity.
5. Pertinent & Contemporary Issues (PCIs) & Values: e.g. Love, Respect, Integrity, Environmental awareness.
6. Learning Resources: Real classroom realia, charts, digital devices, flashcards.
7. Organization of Learning:
   - Introduction (5 mins): Hook, recall of previous lesson.
   - Lesson Development:
     * Step 1 (10 mins): Teacher modeling / concept demonstration.
     * Step 2 (15 mins): Collaborative learner group activity / hands-on exploration.
     * Step 3 (7 mins): Individual learner practice / reflection.
   - Conclusion (3 mins): Summary, check for understanding.
8. Assessment Rubric: 4 levels (Exceeding, Meeting, Approaching, Below Expectations).
9. Extended Activity / Home Link.`;

    const promptText = `GENERATE A CBC LESSON PLAN:
Grade: ${grade}
Subject: ${subject}
Strand: ${strand || 'Core Concepts'}
Sub-strand: ${substrand || 'Practical Skills'}
Duration: ${durationMinutes || 40} minutes
Learning Resources: ${learningResources || 'Standard classroom materials, realia, charts'}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.35,
      },
    });

    res.json({
      success: true,
      content: response.text,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('[Lesson Plan Generation Error]:', error);
    res.status(500).json({ error: error.message, fallback: true });
  }
});

// 6. Child Progress & CBC Parent Guidance Analyzer
app.post('/api/school-ai/analyze-child-progress', async (req: Request, res: Response) => {
  try {
    const {
      childName,
      grade,
      stream,
      marks,
      attendancePercent,
      parentQuestion,
    } = req.body;

    if (!aiClient) {
      res.json({ fallback: true });
      return;
    }

    const systemInstruction = `You are the Little Roses Academy Parent Academic Advisor.
The school motto is "Much from Little".
Explain the child's academic performance in warm, supportive, plain English for parents.
Explain what CBC rubrics mean:
- Exceeding Expectations (Level 4): Learner performs consistently above standard.
- Meeting Expectations (Level 3): Learner meets all grade-level CBC competencies.
- Approaching Expectations (Level 2): Learner understands core concepts with minor assistance.
- Below Expectations (Level 1): Learner needs dedicated remedial support.
Calculate formative assignments (40%) and CAT (60%) balance.
Highlight:
1. 2-3 specific strengths
2. 1-2 weak strands needing support
3. Practical, fun home learning activities the parent can do together with the child in Nakuru
4. NEVER invent marks not provided.`;

    const promptText = `CHILD RECORD:
Name: ${childName}
Grade: ${grade} (${stream || 'Roses'})
Attendance: ${attendancePercent || 96}%
Recorded Assessment Marks:
${JSON.stringify(marks || [], null, 2)}
Parent Inquiry: ${parentQuestion || 'Please provide an overall summary of my child\'s progress and what we can practice at home.'}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({
      success: true,
      content: response.text,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('[Child Progress Analysis Error]:', error);
    res.status(500).json({ error: error.message, fallback: true });
  }
});

// -----------------------------------------------------------------------------
// VITE INTEGRATION IN DEV & STATIC IN PRODUCTION
// -----------------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Mount Vite dev middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Little Roses Academy Server] running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Error]:', err);
});
