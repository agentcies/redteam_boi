
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  ExternalLink,
  Target,
  Copy,
  Check,
  Skull,
  MousePointer2,
  Monitor,
  Search,
  Code,
  Globe,
  Zap,
  Server,
  Fingerprint,
  Cpu,
  Layers,
  Terminal as TermIcon,
  Play,
  SkipForward,
  CheckCircle2
} from 'lucide-react';
import { ToolMode, TerminalLine, RedTeamReport } from './types';
import { generateRedTeamIntelligence } from './services/gemini';
import { TOOL_CONFIGS } from './config/tools';
import Terminal from './components/Terminal';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ToolMode>(ToolMode.RECON);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<RedTeamReport | null>(null);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { text: "RTK-CORE v7.3.0 // SEQUENTIAL_ENGAGEMENT_READY", type: 'success' },
    { text: "CHAINING_PROTOCOL: ENABLED", type: 'info' },
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  const engagementSequence = [
    ToolMode.RECON,
    ToolMode.INFRA,
    ToolMode.VULN,
    ToolMode.BREACH,
    ToolMode.EVASION,
    ToolMode.PAYLOAD,
    ToolMode.REPORT
  ];

  const addTerminalLine = (text: string, type: TerminalLine['type']) => {
    setTerminalLines(prev => [...prev.slice(-30), { text, type }]);
  };

  const mergeReports = (existing: RedTeamReport | null, fresh: RedTeamReport): RedTeamReport => {
    if (!existing) return fresh;
    return {
      ...fresh,
      recon: {
        endpoints: Array.from(new Set([...existing.recon.endpoints, ...fresh.recon.endpoints])),
        technology_stack: Array.from(new Set([...existing.recon.technology_stack, ...fresh.recon.technology_stack])),
        manifest_secrets_detected: Array.from(new Set([...existing.recon.manifest_secrets_detected, ...fresh.recon.manifest_secrets_detected])),
      },
      vulnerabilities: [
        ...existing.vulnerabilities,
        ...fresh.vulnerabilities.filter(v => !existing.vulnerabilities.some(ev => ev.description === v.description))
      ],
      active_payloads: [
        ...existing.active_payloads,
        ...fresh.active_payloads.filter(p => !existing.active_payloads.some(ep => ep.payload === p.payload))
      ],
      sources: [...(existing.sources || []), ...(fresh.sources || [])]
    };
  };

  const handleFullEngagement = async () => {
    if (!input.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setReport(null);
    addTerminalLine(`INITIATING FULL ENGAGEMENT SEQUENCE: ${input}`, 'cmd');
    addTerminalLine(`KINETIC_CHAIN_ESTABLISHED. PREPARING RECON...`, 'info');

    let currentReport: RedTeamReport | null = null;

    for (let i = 0; i < engagementSequence.length; i++) {
      const mode = engagementSequence[i];
      setCurrentStepIndex(i);
      setActiveMode(mode);
      addTerminalLine(`ENTERING PHASE [${i+1}/${engagementSequence.length}]: ${mode}`, 'info');
      
      try {
        const data = await generateRedTeamIntelligence(input, mode, () => {});
        currentReport = mergeReports(currentReport, data);
        setReport({ ...currentReport });
        addTerminalLine(`PHASE ${mode} COMPLETE. VECTORS IDENTIFIED: ${data.vulnerabilities.length}`, 'success');
      } catch (err) {
        addTerminalLine(`PHASE ${mode} RECOVERY: BYPASSING LOGIC_WALL...`, 'error');
        // Continue to next phase anyway for resilience
      }
      
      // Slight delay for visual progression
      await new Promise(r => setTimeout(r, 800));
    }

    addTerminalLine(`FULL ENGAGEMENT COMPLETE. FINAL DOSSIER SEALED.`, 'success');
    setIsAnalyzing(false);
    setCurrentStepIndex(-1);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#000] text-neutral-300 font-sans selection:bg-red-950/50 overflow-hidden">
      {/* Sidebar Nav */}
      <nav className="w-full md:w-20 lg:w-72 border-r border-red-950/20 bg-[#050505] flex flex-col z-30 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-red-900 p-2 rounded shadow-[0_0_20px_rgba(153,27,27,0.4)] border border-red-600/20">
            <Skull size={24} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-black text-xl tracking-tighter uppercase italic text-red-600">Crimson Edge</h1>
            <p className="text-[8px] text-red-900 font-mono tracking-widest uppercase font-black">Chained Suite v7.3</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {engagementSequence.map((mode, index) => {
            const config = TOOL_CONFIGS[mode];
            const Icon = config.icon;
            const isCompleted = currentStepIndex > index;
            const isCurrent = activeMode === mode && isAnalyzing;

            return (
              <div key={mode} className="relative">
                <button
                  onClick={() => !isAnalyzing && setActiveMode(mode)}
                  disabled={isAnalyzing}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-200 border ${
                    activeMode === mode ? 'bg-red-950/20 text-red-500 border-red-900/40 shadow-inner' : 'text-neutral-700 border-transparent hover:bg-neutral-900/50'
                  } ${isAnalyzing ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <div className={`p-2 rounded ${activeMode === mode ? 'bg-red-900/20' : 'bg-neutral-900'}`}>
                    {isCompleted ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Icon size={18} />}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em]">{config.label}</div>
                    {isCurrent && <div className="text-[7px] text-red-600 animate-pulse font-mono font-bold mt-1">PROCESSING...</div>}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#020202] relative">
        <header className="h-16 border-b border-red-950/20 flex items-center justify-between px-8 bg-black/80 backdrop-blur-xl z-40">
          <div className="flex items-center gap-4">
            <Activity size={14} className="text-red-900 animate-pulse" />
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">
              Siege_Chain: <span className={isAnalyzing ? "text-red-600 animate-pulse" : "text-neutral-400"}>
                {isAnalyzing ? `PHASE_${activeMode}` : "IDLE"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex gap-6 border-r border-neutral-900 pr-6">
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-neutral-800 uppercase tracking-widest">Protocol</span>
                  <span className="text-[10px] font-mono text-red-900 italic">AUTO_ENGAGE_v3</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-neutral-800 uppercase tracking-widest">Sequence</span>
                  <span className="text-[10px] font-mono text-neutral-500">{currentStepIndex >= 0 ? `${currentStepIndex + 1}/7` : 'READY'}</span>
                </div>
             </div>
             <div className="px-4 py-1 bg-red-950/10 border border-red-900/20 rounded-full flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-red-600 animate-pulse"></div>
               <span className="text-[8px] text-red-700 font-black uppercase tracking-widest">Sequential_Logic_Active</span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-12 pb-32 scrollbar-hide">
          {/* Target Control */}
          <section className="max-w-5xl mx-auto w-full">
            <div className="bg-[#050505] border border-red-950/30 p-8 rounded shadow-2xl relative">
              <div className="absolute -top-3 left-6 px-3 bg-black border border-red-950/30 text-[8px] font-black text-red-800 uppercase tracking-widest">
                Automated_Engagement_Engine
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFullEngagement()}
                  placeholder="DOMAIN_IDENTIFIER (E.G. TARGET.COM)"
                  className="w-full bg-black border border-neutral-900 rounded pl-6 pr-56 py-5 focus:outline-none focus:border-red-900 transition-all text-xl font-mono text-white placeholder:text-neutral-950 uppercase tracking-tighter shadow-inner"
                />
                <button 
                  disabled={isAnalyzing || !input.trim()}
                  onClick={handleFullEngagement}
                  className="absolute right-2 top-2 bottom-2 px-8 bg-red-800 hover:bg-red-700 disabled:bg-neutral-950 disabled:text-neutral-800 text-white rounded font-black uppercase text-[10px] tracking-[0.2em] transition-all border border-red-600/20 active:scale-95 shadow-lg flex items-center gap-3"
                >
                  {isAnalyzing ? <SkipForward className="animate-spin" size={14} /> : <Play size={14} />}
                  {isAnalyzing ? "SEQUENCING..." : "START FULL ENGAGEMENT"}
                </button>
              </div>
            </div>
          </section>

          {/* Progress Tracker */}
          {isAnalyzing && (
            <section className="max-w-5xl mx-auto w-full">
              <div className="bg-[#050505] border border-neutral-900 p-4 rounded-lg flex items-center justify-between">
                <div className="flex gap-2 flex-1 mr-8">
                  {engagementSequence.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        i < currentStepIndex ? 'bg-emerald-600' : 
                        i === currentStepIndex ? 'bg-red-600 animate-pulse' : 
                        'bg-neutral-900'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-neutral-600 uppercase">Phase:</span>
                  <span className="text-[10px] font-mono text-white bg-red-950/30 px-2 py-1 rounded border border-red-900/20">
                    {engagementSequence[currentStepIndex]}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Report Display */}
          {report && (
            <section className="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Surface Topology */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#050505] border border-red-950/30 rounded shadow-2xl">
                    <div className="bg-red-950/10 p-4 border-b border-red-950/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-700">
                        <Globe size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Cumulative_Topology</span>
                      </div>
                      <span className="text-[8px] font-mono text-neutral-800 uppercase">Status: Live</span>
                    </div>
                    <div className="p-6 space-y-8">
                      <div>
                        <h4 className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-4">Master_Node_Registry</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                          {report.recon.endpoints.map((ep, i) => (
                            <div key={i} className="px-3 py-2.5 bg-black border border-neutral-900 font-mono text-[10px] text-red-600/80 hover:border-red-900/40 transition-all">
                              {ep}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-4">Tech_Fingerprint_Aggregation</h4>
                        <div className="flex flex-wrap gap-2">
                          {report.recon.technology_stack.map((tech, i) => (
                            <span key={i} className="px-2.5 py-1.5 bg-red-950/10 border border-red-950/40 text-[9px] font-black text-red-800 rounded uppercase">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Terminal lines={terminalLines} />
                </div>

                {/* Vector Analysis */}
                <div className="lg:col-span-8 space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <Zap size={20} className="text-red-600" />
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white">Consolidated_Attack_Surface</h3>
                      </div>
                      <div className="h-px flex-1 mx-8 bg-red-950/20"></div>
                      <span className="text-[9px] font-black text-neutral-700 uppercase">Vectors: {report.vulnerabilities.length}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.vulnerabilities.map((v, i) => (
                        <div key={i} className="bg-[#050505] border border-red-950/30 rounded p-6 space-y-4 hover:border-red-700/30 transition-all">
                          <div className="flex justify-between items-start">
                            <span className={`px-2 py-1 text-[8px] font-black rounded ${
                              v.severity === 'CRITICAL' ? 'bg-red-900 text-white' : 
                              v.severity === 'HIGH' ? 'bg-red-700/20 text-red-500' : 
                              'bg-neutral-900 text-neutral-500'
                            }`}>
                              {v.severity}
                            </span>
                            <span className="text-[9px] font-mono text-neutral-800 italic">{v.cve_id || 'KINETIC_VECTOR'}</span>
                          </div>
                          <div>
                            <h4 className="text-[11px] font-black text-neutral-200 uppercase tracking-widest mb-2">{v.type}</h4>
                            <p className="text-[10px] text-neutral-500 leading-relaxed">{v.description}</p>
                          </div>
                          <div className="bg-black/80 rounded border border-neutral-900 p-4 space-y-2">
                            <span className="text-[8px] font-black text-red-950 uppercase tracking-widest block">Functional_Bypass_Logic</span>
                            <p className="text-[10px] font-mono text-red-700/80 italic break-all leading-tight">{v.reconstruction_logic}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payload Vault */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <Code size={20} className="text-red-600" />
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white">Aggregated_Payload_Vault</h3>
                      </div>
                      <div className="h-px flex-1 mx-8 bg-red-950/20"></div>
                    </div>

                    <div className="space-y-4">
                      {report.active_payloads.map((p, i) => (
                        <div key={i} className="bg-black border border-red-950/20 rounded overflow-hidden flex flex-col md:flex-row shadow-2xl">
                          <div className="p-6 md:w-1/3 bg-[#080808] border-b md:border-b-0 md:border-r border-red-950/20">
                            <span className="text-[8px] font-black text-red-900 uppercase tracking-widest block mb-1">{p.type}</span>
                            <h5 className="text-[12px] font-black text-white uppercase tracking-wider mb-4">{p.name}</h5>
                            <div className="pt-4 border-t border-neutral-900/50">
                               <span className="text-[8px] font-black text-neutral-800 uppercase block mb-1">Target_Surface</span>
                               <span className="text-[9px] font-mono text-neutral-600 italic uppercase">{p.execution_context}</span>
                            </div>
                          </div>
                          <div className="p-6 flex-1 bg-black/60 relative group">
                            <button 
                              onClick={() => copyToClipboard(p.payload, i)}
                              className="absolute top-4 right-4 p-2 bg-neutral-900 hover:bg-red-900 transition-all rounded text-neutral-400 hover:text-white border border-neutral-800"
                            >
                              {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                            <code className="text-[11px] font-mono text-red-600/90 break-all leading-relaxed block max-h-40 overflow-y-auto pr-8">
                              {p.payload}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Idle State */}
          {!report && !isAnalyzing && (
            <section className="max-w-4xl mx-auto py-32 text-center space-y-10">
               <div className="inline-block p-8 bg-red-950/5 border border-red-900/10 rounded-full animate-pulse">
                  <Fingerprint size={80} className="text-red-950/40" />
               </div>
               <div className="space-y-4">
                 <h2 className="text-sm font-black text-neutral-800 uppercase tracking-[0.6em]">Awaiting_Target_Acquisition</h2>
                 <p className="text-[10px] text-neutral-900 font-mono uppercase tracking-widest italic">RTC-CORE v7.3 READY // CLICK START TO RUN FULL SEQUENCE</p>
               </div>
            </section>
          )}

          {/* Initial Analyzing Placeholder (only used if steps haven't started yet) */}
          {isAnalyzing && !report && (
            <section className="max-w-4xl mx-auto py-32 text-center space-y-16">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-red-600 blur-[80px] opacity-10 animate-pulse"></div>
                  <Cpu size={100} className="text-red-800 animate-[spin_4s_linear_infinite]" />
               </div>
               <div className="space-y-6">
                 <div className="flex flex-col items-center gap-3">
                    <span className="text-[11px] font-black text-red-700 uppercase tracking-[0.4em]">Establishing_Breach_Chain</span>
                    <div className="h-1.5 w-64 bg-neutral-950 rounded-full overflow-hidden border border-red-950/20 shadow-inner">
                       <div className="h-full bg-red-600 animate-[progress_2s_ease-in-out_infinite]"></div>
                    </div>
                 </div>
                 <p className="text-[9px] text-neutral-700 font-mono uppercase italic tracking-widest">Waking kinetic modules and syncing registry...</p>
               </div>
            </section>
          )}
        </div>
      </main>

      <style>{`
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
