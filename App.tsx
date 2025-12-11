import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Presentation, 
  ChevronRight, 
  Loader2, 
  Copy, 
  CheckCircle2,
  Terminal,
  Lightbulb,
  Layout,
  Gavel,
  Workflow,
  BarChart3,
  Cpu,
  Database,
  ZoomIn,
  Info,
  Layers,
  MonitorPlay,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, AnalysisStatus } from './types';

// --- Types & Constants ---

const TABS = [
  { id: 'overview', label: 'Problem Overview', icon: Info },
  { id: 'breakdown', label: 'Detailed Breakdown', icon: ZoomIn },
  { id: 'dataset', label: 'Dataset Requirements', icon: Database },
  { id: 'solution', label: 'Expected Solution', icon: BarChart3 },
  { id: 'genai', label: 'GenAI Use Cases', icon: BrainCircuit },
  { id: 'scenario', label: 'Real-Life Scenario', icon: MonitorPlay },
  { id: 'flowcharts', label: 'Flows & Architecture', icon: Workflow },
  { id: 'jury', label: 'Jury Questions', icon: Gavel },
  { id: 'ppt', label: 'PPT Summary', icon: Presentation },
];

// --- Components ---

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-md 
        bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 ml-auto"
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ 
  isActive, 
  onClick, 
  icon: Icon, 
  label 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
      ${isActive 
        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
      }`}
  >
    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
    <span>{label}</span>
    {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
  </button>
);

// --- Visual Generation Components ---

const ImageCard: React.FC<{ prompt: string; isVisible: boolean }> = ({ prompt, isVisible }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const generate = async () => {
    if (loading || image) return;
    setLoading(true);
    setError(false);
    
    try {
      if (!process.env.API_KEY) throw new Error("No API Key");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Generate a clear, high-quality, professional visualization, diagram, or illustration for the following concept. Do not include text inside the image if possible, focus on visual representation: ${prompt}` }]
        },
      });

      let found = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setImage(`data:image/png;base64,${part.inlineData.data}`);
            found = true;
            break;
          }
        }
      }
      if (!found) throw new Error("No image generated");
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
      setHasAttempted(true);
    }
  };

  useEffect(() => {
    // Only generate when the tab becomes visible to avoid rate limiting all tabs at once
    if (isVisible && !hasAttempted && !image) {
      generate();
    }
  }, [isVisible, hasAttempted, image, prompt]);

  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex flex-col">
      <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
        {image ? (
          <div className="relative w-full h-full group">
            <img src={image} alt="Generated visual" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a href={image} download="visual.png" className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                <Maximize2 className="w-5 h-5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 w-full">
            {loading ? (
              <div className="flex flex-col items-center">
                 <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-2" />
                 <span className="text-xs text-brand-500/80 animate-pulse">Generating visual...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center">
                 <p className="text-red-400 text-xs mb-2">Generation Failed</p>
                 <button 
                   onClick={() => { setHasAttempted(false); generate(); }}
                   className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-700 font-medium"
                 >
                   Retry
                 </button>
              </div>
            ) : (
              // Waiting state before visibility or trigger
              <div className="flex flex-col items-center text-slate-600">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs">Waiting to generate...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const VisualSection = ({ 
  title, 
  content, 
  type = "text",
  isVisible
}: { 
  title: string; 
  content?: string; 
  type?: "text" | "code";
  isVisible: boolean;
}) => {
  // Extract prompts: [VISUAL_PROMPT: ...]
  const parsedContent = useMemo(() => {
    if (!content) return { text: '', prompts: [] };
    
    // Improved regex to handle multi-line prompts and ensure tags don't leak into text
    const promptRegex = /\[VISUAL_PROMPT:\s*([\s\S]*?)\]/g;
    const prompts: string[] = [];
    const text = content.replace(promptRegex, (match, prompt) => {
      prompts.push(prompt.trim());
      return ''; // Remove prompt from text display
    }).trim();

    return { text, prompts };
  }, [content]);

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden shadow-sm h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between sticky top-0 z-10 shrink-0">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center">
          {title}
        </h3>
        {parsedContent.text && <CopyButton text={parsedContent.text} />}
      </div>
      
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
        {/* Visuals Grid */}
        {parsedContent.prompts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {parsedContent.prompts.map((prompt, idx) => (
              <ImageCard key={idx} prompt={prompt} isVisible={isVisible} />
            ))}
          </div>
        )}

        {/* Text Content */}
        {type === 'code' ? (
          <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
            {parsedContent.text}
          </pre>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
            {parsedContent.text}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Parsers ---

const parseResponse = (text: string): AnalysisResult => {
  const getSection = (start: string, end?: string) => {
    const s = text.indexOf(start);
    if (s === -1) return "";
    const contentStart = s + start.length;
    const contentEnd = end ? text.indexOf(end, contentStart) : text.length;
    return (contentEnd === -1 ? text.substring(contentStart) : text.substring(contentStart, contentEnd)).trim();
  };

  return {
    problemOverview: getSection("==== 1. PROBLEM OVERVIEW ====", "==== 2. DETAILED BREAKDOWN ===="),
    detailedBreakdown: getSection("==== 2. DETAILED BREAKDOWN ====", "==== 3. DATASET REQUIREMENTS ===="),
    datasetRequirements: getSection("==== 3. DATASET REQUIREMENTS ====", "==== 4. EXPECTED SOLUTION ===="),
    expectedSolution: getSection("==== 4. EXPECTED SOLUTION ====", "==== 5. GENAI USE CASES ===="),
    genAiUseCases: getSection("==== 5. GENAI USE CASES ====", "==== 6. REAL-LIFE SCENARIO ===="),
    realLifeScenario: getSection("==== 6. REAL-LIFE SCENARIO ====", "==== 7. FLOWCHARTS & ARCHITECTURE ===="),
    flowcharts: getSection("==== 7. FLOWCHARTS & ARCHITECTURE ====", "==== 8. JURY QUESTIONS ===="),
    juryQuestions: getSection("==== 8. JURY QUESTIONS ====", "==== 9. PPT SUMMARY GENERATOR ===="),
    pptSummary: getSection("==== 9. PPT SUMMARY GENERATOR ====")
  };
};

export default function App() {
  const [problem, setProblem] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [problem]);

  const handleAnalyze = async () => {
    if (!problem.trim()) return;
    
    setStatus(AnalysisStatus.LOADING);
    setResult(null);
    setActiveTab('overview');

    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemPrompt = `You are an elite AI Solutions Architect and Visualization Expert.
Your task is to take a user's Problem Statement and generate a comprehensive 9-section project blueprint.

VISUALIZATION RULE (MANDATORY):
In EVERY section, you MUST strictly include at least 2 visual descriptions enclosed in [VISUAL_PROMPT: description] tags.
These prompts will be used by an AI image generator to create UI mockups, diagrams, illustrations, or scene visualizations.
Do not describe the image in the text body; use the tag.

Example:
"The user logs in...
[VISUAL_PROMPT: A sleek mobile login screen with biometric authentication icons and a dark blue gradient background]
Then they see the dashboard...
[VISUAL_PROMPT: A comprehensive analytics dashboard showing real-time crop prices with a line chart and green up-trending arrows]"

OUTPUT FORMAT (STRICT):
Output exactly 9 sections using the headers below.

==== 1. PROBLEM OVERVIEW ====
- Explanation (ELI5)
- Importance & End Users
- [VISUAL_PROMPT: A conceptual illustration of the problem scenario]
- [VISUAL_PROMPT: An infographic showing the user pain points]

==== 2. DETAILED BREAKDOWN ====
- Actors, Inputs, Outputs, Constraints
- [VISUAL_PROMPT: A flowchart diagram style illustration showing actors and inputs]
- [VISUAL_PROMPT: A real-life photo-style scene of the user facing the constraint]

==== 3. DATASET REQUIREMENTS ====
- Schema, Fields, Types, Sources
- [VISUAL_PROMPT: A visual representation of a database schema or data table structure]
- [VISUAL_PROMPT: A data pipeline diagram showing ingestion from sources]

==== 4. EXPECTED SOLUTION ====
- MVP & Advanced Features, KPIs
- [VISUAL_PROMPT: A modern UI mockup of the main application landing page]
- [VISUAL_PROMPT: A mobile app screen showing the core feature in action]

==== 5. GENAI USE CASES ====
- Querying, Insights, Automation
- [VISUAL_PROMPT: A chat interface showing a user asking a question and getting a smart response]
- [VISUAL_PROMPT: An automated report document with AI-generated summary highlights]

==== 6. REAL-LIFE SCENARIO ====
- Before vs After Narrative
- [VISUAL_PROMPT: A split screen comparison illustration: chaotic manual process vs streamlined digital process]
- [VISUAL_PROMPT: A happy user successfully using the solution in their environment]

==== 7. FLOWCHARTS & ARCHITECTURE ====
- ASCII Flowcharts & Architecture
- [VISUAL_PROMPT: A high-level system architecture diagram with cloud components]
- [VISUAL_PROMPT: A user journey map visualization with icons]

==== 8. JURY QUESTIONS ====
- 15 Tough Questions & Answers
- [VISUAL_PROMPT: A boardroom meeting scene with executives discussing strategy]
- [VISUAL_PROMPT: A technical risk matrix diagram]

==== 9. PPT SUMMARY GENERATOR ====
- Pitch Deck Outline
- [VISUAL_PROMPT: A professional pitch deck cover slide design with the app title]
- [VISUAL_PROMPT: A slide showing the business growth trajectory chart]

BEHAVIOUR:
- Adapt to the specific domain.
- Be technical yet accessible.
- Ensure Visual Prompts are detailed and descriptive (colors, style, mood).
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: `Here is the PROBLEM STATEMENT: ${problem}` }] }
        ]
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = parseResponse(responseText);
        setResult(parsed);
        setStatus(AnalysisStatus.SUCCESS);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden h-screen">
      {/* Top Navigation / Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center px-6 shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-500/10 p-2 rounded-lg border border-brand-500/20">
            <Layers className="h-6 w-6 text-brand-400" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Hackathon Architect
          </span>
        </div>
        <div className="ml-auto flex items-center space-x-4">
           {status === AnalysisStatus.SUCCESS && (
             <span className="text-xs font-mono text-green-400 flex items-center bg-green-900/20 px-3 py-1 rounded-full border border-green-900/30">
               <CheckCircle2 className="w-3 h-3 mr-2" />
               Blueprint Ready
             </span>
           )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-2">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </div>
          
          <div className="mt-auto p-6 border-t border-slate-800 text-xs text-slate-600">
            <p className="mb-2">Powered by</p>
            <div className="flex items-center space-x-2 text-slate-500 font-mono">
              <Cpu className="w-4 h-4" />
              <span>Gemini 2.5 Flash</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 relative">
          
          {/* Analysis Not Started State */}
          {status === AnalysisStatus.IDLE && (
             <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                <div className="max-w-2xl space-y-8">
                  <h2 className="text-5xl font-extrabold tracking-tight text-white">
                    Visualize your <span className="text-brand-400">Winning Idea</span>
                  </h2>
                  <p className="text-xl text-slate-400">
                    Describe your problem. We'll generate the solution, architecture, data specs, and even the pitch deck.
                  </p>
                  
                  <div className="bg-slate-900/80 backdrop-blur-sm p-2 rounded-2xl border border-slate-800 shadow-2xl focus-within:ring-2 focus-within:ring-brand-500/50 transition-all text-left">
                    <textarea
                      ref={textareaRef}
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="What problem are you solving? (e.g. Small farmers can't predict crop prices due to lack of real-time market data...)"
                      className="w-full bg-transparent text-slate-100 placeholder-slate-500 rounded-xl p-6 text-lg border-0 focus:ring-0 resize-none min-h-[120px]"
                      style={{ overflow: 'hidden' }}
                    />
                    <div className="px-4 pb-4 pt-2 flex justify-between items-center border-t border-slate-800/50 mt-2">
                      <span className="text-xs text-slate-500 font-medium">
                        {problem.length} chars
                      </span>
                      <button
                        onClick={handleAnalyze}
                        disabled={!problem.trim()}
                        className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Blueprint</span>
                      </button>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {/* Loading State */}
          {status === AnalysisStatus.LOADING && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 z-10 bg-slate-950/80 backdrop-blur-sm">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-brand-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-brand-500" />
                </div>
              </div>
              <p className="text-slate-400 animate-pulse font-medium">Architecting visual solution...</p>
            </div>
          )}

          {/* Results View */}
          {status === AnalysisStatus.SUCCESS && result && (
            <div className="flex-1 overflow-hidden p-6 relative z-10 flex flex-col">
              {/* Context Bar */}
              <div className="mb-6 flex items-center justify-between">
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 max-w-2xl truncate">
                  <span className="text-slate-500 text-xs uppercase tracking-wider font-bold mr-3">Current Problem</span>
                  <span className="text-slate-300 text-sm">{problem}</span>
                </div>
                <button 
                  onClick={() => setStatus(AnalysisStatus.IDLE)}
                  className="text-xs text-slate-500 hover:text-white transition-colors underline"
                >
                  New Project
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 min-h-0 relative">
                {/* 
                  We map over all tabs and render them with display:none when inactive.
                  This preserves the generated images in the ImageCards so they don't regenerate on tab switch.
                */}
                {TABS.map(tab => {
                   let content = '';
                   let type: 'text' | 'code' = 'text';
                   
                   switch(tab.id) {
                     case 'overview': content = result.problemOverview; break;
                     case 'breakdown': content = result.detailedBreakdown; break;
                     case 'dataset': content = result.datasetRequirements; break;
                     case 'solution': content = result.expectedSolution; break;
                     case 'genai': content = result.genAiUseCases; break;
                     case 'scenario': content = result.realLifeScenario; break;
                     case 'flowcharts': content = result.flowcharts; type = 'code'; break;
                     case 'jury': content = result.juryQuestions; break;
                     case 'ppt': content = result.pptSummary; type = 'code'; break;
                   }
                   
                   return (
                     <div 
                       key={tab.id} 
                       className={`absolute inset-0 transition-opacity duration-300 ${activeTab === tab.id ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                     >
                        <VisualSection 
                          title={tab.label} 
                          content={content} 
                          type={type} 
                          isVisible={activeTab === tab.id}
                        />
                     </div>
                   );
                })}
              </div>
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}