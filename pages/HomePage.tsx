import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '../components/Header';
import { TestInput } from '../components/TestInput';
import { LiveMarketDashboard } from '../components/AgentDashboard';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { VisualDashboard } from '../components/VisualDashboard';
import { AdvancedFeaturesPanel } from '../components/AdvancedFeaturesPanel';
import { CrewAIConcepts } from '../components/CrewAIConcepts';
import { AgentType, AgentStatus, AgentState, TestResult, AdvancedModule, ModalType } from '../types';
import { runOrchestratorSimulation, runAgentSimulation, generateFinalReport, runRealTest } from '../services/geminiService';
import { SupportModal } from '../components/modals/SupportModal';
import { ResearchModal } from '../components/modals/ResearchModal';
import { CodeReviewModal } from '../components/modals/CodeReviewModal';
import { MaintenanceModal } from '../components/modals/MaintenanceModal';
import { YourIdeaModal } from '../components/modals/YourIdeaModal';


const initialAgentState: Record<Exclude<AgentType, AgentType.Orchestrator>, AgentState> = {
  [AgentType.UI]: { status: AgentStatus.Idle, logs: [] },
  [AgentType.Functional]: { status: AgentStatus.Idle, logs: [] },
  [AgentType.DB]: { status: AgentStatus.Idle, logs: [] },
};

const initialOrchestratorState: AgentState = {
  status: AgentStatus.Idle, logs: []
};

const initialModulesState: Record<AdvancedModule, boolean> = {
  [AdvancedModule.ShadowRunner]: true,
  [AdvancedModule.CausalTraceback]: true,
  [AdvancedModule.PDATO]: true,
  [AdvancedModule.LocatorGenie]: true,
  [AdvancedModule.DBContract]: true,
  [AdvancedModule.TemporalFuzzing]: true,
  [AdvancedModule.AutoTicketing]: true,
  [AdvancedModule.ProvableCoverage]: true,
};

export const HomePage: React.FC = () => {
  const [url, setUrl] = useState<string>('https://gemini.google.com');
  const [budget, setBudget] = useState<number>(1000);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [agentData, setAgentData] = useState(initialAgentState);
  const [marketData, setMarketData] = useState<AgentState>(initialOrchestratorState);
  const [results, setResults] = useState<TestResult | null>(null);
  const [resultsPersisted, setResultsPersisted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [advancedModules, setAdvancedModules] = useState(initialModulesState);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  // Recovery mechanism on component mount
  useEffect(() => {
    const savedResults = localStorage.getItem('lastTestResults');
    const savedTimestamp = localStorage.getItem('lastTestTimestamp');

    if (savedResults && !results) {
      try {
        const parsedResults = JSON.parse(savedResults);
        const timestamp = savedTimestamp ? parseInt(savedTimestamp) : 0;
        const isRecent = Date.now() - timestamp < 5 * 60 * 1000; // 5 minutes

        if (isRecent) {
          console.log('🔄 Recovered recent results from localStorage:', parsedResults);
          setResults(parsedResults);
          setTestCompleted(true);
          setResultsPersisted(true);
        } else {
          console.log('🗑️ Clearing old results from localStorage');
          localStorage.removeItem('lastTestResults');
          localStorage.removeItem('lastTestTimestamp');
        }
      } catch (e) {
        console.warn('Failed to recover results:', e);
        localStorage.removeItem('lastTestResults');
        localStorage.removeItem('lastTestTimestamp');
      }
    }
  }, [results]);

  const resetState = () => {
    console.log('🔄 Resetting test state...');
    setAgentData(initialAgentState);
    setMarketData(initialOrchestratorState);
    setResults(null);
    setTestCompleted(false);
    setResultsPersisted(false);
    setError(null);

    // Clear localStorage on manual reset
    localStorage.removeItem('lastTestResults');
    localStorage.removeItem('lastTestTimestamp');
  };

  const handleConceptCardClick = (modalType: ModalType | 'scroll') => {
    if (modalType === 'scroll') {
      const conceptsSection = document.getElementById('concepts');
      conceptsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setActiveModal(modalType);
    }
  };


  const handleStartTest = useCallback(async () => {
    if (!url.trim()) return;

    setIsTesting(true);
    resetState();

    try {
      const activeModules = Object.entries(advancedModules)
        .filter(([, isActive]) => isActive)
        .map(([name]) => name as AdvancedModule);

      // Set Market Controller to Running at start
      setMarketData(prev => ({ ...prev, status: AgentStatus.Running }));

      // Add initial orchestrator log
      setTimeout(() => {
        setMarketData(prev => ({
          ...prev,
          logs: [...prev.logs, `Starting test session for ${url} with budget ${budget} compute units`]
        }));
      }, 500);

      // Try real testing first, with fallback to simulation
      const finalReport = await runRealTest(url, budget, activeModules, (update) => {
        if (update.type === 'log') {
          const agentName = update.agent.toLowerCase();

          if (agentName === 'orchestrator') {
            setMarketData(prev => ({ ...prev, logs: [...prev.logs, update.message] }));
          } else if (agentName === 'ui' || agentName === 'functional' || agentName === 'db') {
            const agentKey = agentName === 'ui' ? AgentType.UI :
              agentName === 'functional' ? AgentType.Functional : AgentType.DB;

            setAgentData(prev => {
              const currentAgent = prev[agentKey];
              const newLogs = [...currentAgent.logs, update.message];

              // Auto-set status to Running when first log appears
              let newStatus = currentAgent.status;
              if (currentAgent.status === AgentStatus.Idle && newLogs.length === 1) {
                newStatus = AgentStatus.Running;
              }
              // Auto-set status to Completed when agent says it's complete
              if (update.message.toLowerCase().includes('complete') ||
                update.message.toLowerCase().includes('finished') ||
                update.message.toLowerCase().includes('task complete')) {
                newStatus = AgentStatus.Completed;
              }

              return {
                ...prev,
                [agentKey]: { ...currentAgent, logs: newLogs, status: newStatus }
              };
            });
          }
        } else if (update.type === 'agent_status') {
          if (update.agent === 'orchestrator') {
            setMarketData(prev => ({ ...prev, status: update.status }));
          } else {
            const agentKey = update.agent === 'UI' ? AgentType.UI :
              update.agent === 'Functional' ? AgentType.Functional : AgentType.DB;
            setAgentData(prev => ({
              ...prev,
              [agentKey]: { ...prev[agentKey], status: update.status }
            }));
          }
        } else if (update.type === 'test_complete') {
          console.log('🎉 TEST COMPLETED - Processing results...');
          console.log('📊 Results received:', update.results);
          console.log('🐛 Issues count:', update.results?.issues?.length || 0);
          console.log('📋 Issues details:', update.results?.issues);

          // Set all agents to completed when test finishes
          setAgentData(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
              if (updated[key].logs.length > 0) {
                updated[key] = { ...updated[key], status: AgentStatus.Completed };
              }
            });
            return updated;
          });

          setMarketData(prev => ({ ...prev, status: AgentStatus.Completed }));

          // Validate and set results with multiple safeguards
          if (update.results) {
            console.log('✅ Setting results with', update.results.issues?.length || 0, 'issues');

            // Store in localStorage immediately as backup
            try {
              localStorage.setItem('lastTestResults', JSON.stringify(update.results));
              localStorage.setItem('lastTestTimestamp', Date.now().toString());
              console.log('💾 Results backed up to localStorage');
            } catch (e) {
              console.warn('Failed to backup results:', e);
            }

            // Set results with state persistence
            setResults(update.results);
            setTestCompleted(true);

            // Force multiple re-renders to ensure UI updates
            setTimeout(() => {
              console.log('🔄 Forcing UI refresh 1...');
              setResults(prev => prev ? { ...prev } : update.results);
            }, 100);

            setTimeout(() => {
              console.log('🔄 Forcing UI refresh 2...');
              setResults(prev => prev ? { ...prev } : update.results);
            }, 500);

          } else {
            console.error('❌ No results in test completion');
            // Try to recover from localStorage
            const savedResults = localStorage.getItem('lastTestResults');
            if (savedResults) {
              try {
                const parsedResults = JSON.parse(savedResults);
                console.log('🔄 Recovered results from localStorage');
                setResults(parsedResults);
                setTestCompleted(true);
              } catch (e) {
                console.error('Failed to recover results:', e);
              }
            }
          }
        }
      });

      // Note: Test completion is now handled via the test_complete update callback above
      // The finalReport return is just for backup/debugging

    } catch (e) {
      console.error("Test process failed:", e);
      setError("An error occurred during the testing process. Please check the console for details.");
    } finally {
      setIsTesting(false);
    }
  }, [url, budget, advancedModules]);

  return (
    <>
      <Header />
      <TestInput
        url={url}
        setUrl={setUrl}
        budget={budget}
        setBudget={setBudget}
        onStart={handleStartTest}
        isTesting={isTesting}
      />
      <AdvancedFeaturesPanel
        modules={advancedModules}
        setModules={setAdvancedModules}
        isTesting={isTesting}
      />
      {error && (
        <div className="max-w-7xl mx-auto mb-8 p-4 bg-red-900/50 border border-red-500/30 text-red-400 rounded-lg text-center">
          {error}
        </div>
      )}
      <LiveMarketDashboard agentData={agentData} marketData={marketData} />
      {(testCompleted || resultsPersisted) && results && (
        <div>
          <div className="max-w-7xl mx-auto mb-6 p-4 bg-green-900/30 border border-green-500/40 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-medium">Test Completed Successfully</span>
                {resultsPersisted && (
                  <span className="text-xs text-green-400 bg-green-900/50 px-2 py-1 rounded">
                    Results Recovered
                  </span>
                )}
              </div>
              <div className="text-sm text-green-400">
                <span className="font-semibold">{results.issues?.length || 0}</span> issues detected
              </div>
            </div>
            <div className="mt-2 text-xs text-green-500">
              Coverage: {results.summary?.coveragePercent || 0}% |
              Tests Passed: {results.summary?.testsPassed || 0} |
              Tests Failed: {results.summary?.testsFailed || 0}
            </div>
          </div>
          <ResultsDashboard results={results} />
        </div>
      )}
      {(testCompleted || resultsPersisted) && results && <VisualDashboard testResults={results} />}
      <CrewAIConcepts onCardClick={handleConceptCardClick} />

      {activeModal === ModalType.Support && <SupportModal onClose={() => setActiveModal(null)} />}
      {activeModal === ModalType.Research && <ResearchModal onClose={() => setActiveModal(null)} />}
      {activeModal === ModalType.CodeReview && <CodeReviewModal onClose={() => setActiveModal(null)} />}
      {activeModal === ModalType.Maintenance && <MaintenanceModal onClose={() => setActiveModal(null)} />}
      {activeModal === ModalType.YourIdea && <YourIdeaModal onClose={() => setActiveModal(null)} />}
    </>
  );
};




