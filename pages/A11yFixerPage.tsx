import React, { useState, useCallback } from 'react';
import { A11yDashboard } from '../components/A11yDashboard';
import { A11yReportDashboard } from '../components/A11yReport';
import { A11yAgentType, A11yAgentState, AgentStatus, A11yReport } from '../types';
import { runA11yAgentSimulation, generateA11yReport } from '../services/geminiService';

const initialAgentState: Record<A11yAgentType, A11yAgentState> = {
  [A11yAgentType.Scanner]: { status: AgentStatus.Idle, logs: [] },
  [A11yAgentType.Simulator]: { status: AgentStatus.Idle, logs: [] },
  [A11yAgentType.Fixer]: { status: AgentStatus.Idle, logs: [] },
  [A11yAgentType.Validator]: { status: AgentStatus.Idle, logs: [] },
  [A11yAgentType.Integrator]: { status: AgentStatus.Idle, logs: [] },
};

export const A11yFixerPage: React.FC = () => {
    const [url, setUrl] = useState<string>('https://gemini.google.com');
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanCompleted, setScanCompleted] = useState<boolean>(false);
    const [agentData, setAgentData] = useState(initialAgentState);
    const [report, setReport] = useState<A11yReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setAgentData(initialAgentState);
        setReport(null);
        setScanCompleted(false);
        setError(null);
    };

    const handleStartScan = useCallback(async () => {
        if (!url.trim()) return;

        setIsScanning(true);
        resetState();

        try {
            const agentFlow: A11yAgentType[] = [
                A11yAgentType.Scanner,
                A11yAgentType.Simulator,
                A11yAgentType.Fixer,
                A11yAgentType.Validator,
                A11yAgentType.Integrator
            ];

            let combinedLogs = "";

            for (const agentType of agentFlow) {
                setAgentData(prev => ({ ...prev, [agentType]: { ...prev[agentType], status: AgentStatus.Running } }));
                const agentLog = await runA11yAgentSimulation(agentType, url, (log) => {
                    setAgentData(prev => ({ ...prev, [agentType]: { ...prev[agentType], logs: [...prev[agentType].logs, log] } }));
                });
                combinedLogs += `--- ${agentType} Log ---\n${agentLog}\n`;
                setAgentData(prev => ({ ...prev, [agentType]: { ...prev[agentType], status: AgentStatus.Completed } }));
            }
            
            const finalReport = await generateA11yReport(combinedLogs, url);
            setReport(finalReport);
            setScanCompleted(true);

        } catch (e) {
            console.error("A11y process failed:", e);
            setError("An error occurred during the accessibility scan. Please check the console.");
        } finally {
            setIsScanning(false);
        }

    }, [url]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
          handleStartScan();
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-cyan-400 sm:text-4xl">Accessibility &amp; UX Repair Crew</h1>
                <p className="mt-2 text-lg text-gray-400 max-w-3xl mx-auto">
                    An autonomous agent crew that finds, fixes, and validates accessibility issues, then generates integration recommendations.
                </p>
            </div>
            
             <section className="mb-8 px-4">
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg focus-within:ring-2 focus-within:ring-cyan-500 transition-shadow">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                            disabled={isScanning}
                            className="w-full sm:flex-1 bg-transparent text-gray-200 placeholder-gray-500 px-4 py-2 focus:outline-none disabled:opacity-50"
                            aria-label="Target URL"
                        />
                        <button
                            type="submit"
                            disabled={isScanning || !url.trim()}
                            className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2 bg-cyan-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {isScanning ? 'Scanning...' : 'Start Scan & Fix'}
                        </button>
                    </div>
                </form>
            </section>

            {error && (
                <div className="max-w-7xl mx-auto mb-8 p-4 bg-red-900/50 border border-red-500/30 text-red-400 rounded-lg text-center">
                    {error}
                </div>
            )}

            <A11yDashboard agentData={agentData} />
            {scanCompleted && <A11yReportDashboard report={report} />}
        </div>
    );
};
