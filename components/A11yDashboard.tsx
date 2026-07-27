import React, { useRef, useEffect, useState } from 'react';
import { A11yAgentState, AgentStatus, A11yAgentType } from '../types';

// Icons defined inline for simplicity
const ScannerIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const SimulatorIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const FixerIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ValidatorIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IntegratorIcon = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;

const MaximizeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const MinimizeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6m12-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const agentDetails = {
    [A11yAgentType.Scanner]: { title: 'Scanner Agent', Icon: ScannerIcon, color: 'text-cyan-400' },
    [A11yAgentType.Simulator]: { title: 'Simulator Agent', Icon: SimulatorIcon, color: 'text-blue-400' },
    [A11yAgentType.Fixer]: { title: 'Fixer Agent', Icon: FixerIcon, color: 'text-yellow-400' },
    [A11yAgentType.Validator]: { title: 'Validator Agent', Icon: ValidatorIcon, color: 'text-green-400' },
    [A11yAgentType.Integrator]: { title: 'Integrator Agent', Icon: IntegratorIcon, color: 'text-purple-400' },
};

const StatusIndicator: React.FC<{ status: AgentStatus }> = ({ status }) => {
    const styles = {
        [AgentStatus.Running]: { color: 'bg-cyan-500', text: 'Running', animate: true },
        [AgentStatus.Completed]: { color: 'bg-green-500', text: 'Completed', animate: false },
        [AgentStatus.Error]: { color: 'bg-red-500', text: 'Error', animate: false },
        [AgentStatus.Idle]: { color: 'bg-gray-500', text: 'Idle', animate: false },
    };
    const { color, text, animate } = styles[status];
    return (
        <div className="flex items-center">
            <span className={`relative flex h-3 w-3 ${animate ? 'animate-pulse-fast': ''}`}>
                <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
            </span>
            <span className="ml-2 text-sm font-medium">{text}</span>
        </div>
    );
};

interface AgentCardProps {
  agentType: A11yAgentType;
  state: A11yAgentState;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  agentType, 
  state, 
  isMaximized = false, 
  onToggleMaximize 
}) => {
  const { title, Icon, color } = agentDetails[agentType];
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only auto-scroll within the log container, not the entire page
    if (logsEndRef.current) {
      const container = logsEndRef.current.closest('.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [state.logs]);

  const containerClasses = isMaximized 
    ? "fixed inset-4 z-50 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 flex flex-col animate-in fade-in-0 zoom-in-95 duration-300"
    : "bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 h-full flex flex-col transition-all duration-300";

  const logContainerClasses = isMaximized
    ? "p-6 flex-grow bg-gray-900/50 overflow-y-auto"
    : "p-4 flex-grow bg-gray-900/50 overflow-y-auto h-56 min-h-[14rem]";

  return (
    <>
      {isMaximized && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in-0 duration-300"
          onClick={onToggleMaximize}
        />
      )}
      <div className={containerClasses}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center">
            <Icon className={`w-6 h-6 mr-3 ${color}`} />
            <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
          </div>
          <div className="flex items-center space-x-3">
            <StatusIndicator status={state.status} />
            {onToggleMaximize && (
              <button
                onClick={onToggleMaximize}
                className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? (
                  <MinimizeIcon className="w-5 h-5" />
                ) : (
                  <MaximizeIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
        <div className={logContainerClasses}>
          <ul className={`font-mono text-gray-400 space-y-2 ${isMaximized ? 'text-base' : 'text-sm'}`}>
            {state.logs.map((log, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-600 mr-2 select-none">&gt;</span>
                <span className="flex-1 whitespace-pre-wrap break-words">{log}</span>
              </li>
            ))}
            {state.status === AgentStatus.Idle && state.logs.length === 0 && (
               <li className="text-gray-500">Awaiting scan initiation...</li>
            )}
          </ul>
          <div ref={logsEndRef} />
        </div>
        {isMaximized && (
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>{state.logs.length} log entries</span>
              <span>Press ESC or click outside to close</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};


interface A11yDashboardProps {
    agentData: Record<A11yAgentType, A11yAgentState>;
}

export const A11yDashboard: React.FC<A11yDashboardProps> = ({ agentData }) => {
    const [maximizedAgent, setMaximizedAgent] = useState<A11yAgentType | null>(null);

    // Handle ESC key to close maximized view
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && maximizedAgent) {
                setMaximizedAgent(null);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [maximizedAgent]);

    const handleToggleMaximize = (agentType: A11yAgentType) => {
        setMaximizedAgent(maximizedAgent === agentType ? null : agentType);
    };

    return (
        <section className="px-4 mb-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {Object.values(A11yAgentType).map(agentType => (
                    <AgentCard 
                        key={agentType} 
                        agentType={agentType} 
                        state={agentData[agentType]}
                        isMaximized={maximizedAgent === agentType}
                        onToggleMaximize={() => handleToggleMaximize(agentType)}
                    />
                ))}
            </div>
        </section>
    );
};
