import React, { useRef, useEffect, useState } from 'react';
import { AgentStatus as AgentStatusEnum, AgentType } from '../types';
import { UiAgentIcon } from './icons/UiAgentIcon';
import { FunctionalAgentIcon } from './icons/FunctionalAgentIcon';
import { DbAgentIcon } from './icons/DbAgentIcon';
import { OrchestratorIcon } from './icons/OrchestratorIcon';

interface AgentStatusProps {
  agentType: AgentType;
  status: AgentStatusEnum;
  logs: string[];
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const AgentDetails = {
  [AgentType.UI]: {
    title: 'UI Test AI Agent',
    Icon: UiAgentIcon,
    color: 'text-cyan-400',
  },
  [AgentType.Functional]: {
    title: 'Functional Test AI Agent',
    Icon: FunctionalAgentIcon,
    color: 'text-green-400',
  },
  [AgentType.DB]: {
    title: 'Database Test AI Agent',
    Icon: DbAgentIcon,
    color: 'text-yellow-400',
  },
  [AgentType.Orchestrator]: {
    title: 'Market Controller Log',
    Icon: OrchestratorIcon,
    color: 'text-gray-300',
  }
};

const StatusIndicator: React.FC<{ status: AgentStatusEnum }> = ({ status }) => {
    let colorClass, text, animate;
    switch (status) {
        case AgentStatusEnum.Running:
            colorClass = 'bg-cyan-500';
            text = 'Running';
            animate = true;
            break;
        case AgentStatusEnum.Completed:
            colorClass = 'bg-green-500';
            text = 'Completed';
            break;
        case AgentStatusEnum.Error:
            colorClass = 'bg-red-500';
            text = 'Error';
            break;
        default:
            colorClass = 'bg-gray-500';
            text = 'Idle';
    }

    return (
        <div className="flex items-center">
            <span className={`relative flex h-3 w-3 ${animate ? 'animate-pulse-fast': ''}`}>
                <span className={`absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${colorClass}`}></span>
            </span>
            <span className="ml-2 text-sm font-medium">{text}</span>
        </div>
    );
};


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

export const AgentStatus: React.FC<AgentStatusProps> = ({ 
  agentType, 
  status, 
  logs, 
  isMaximized = false, 
  onToggleMaximize 
}) => {
  const { title, Icon, color } = AgentDetails[agentType];
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only auto-scroll within the log container, not the entire page
    if (logsEndRef.current) {
      const container = logsEndRef.current.closest('.overflow-y-auto');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [logs]);

  const containerClasses = isMaximized 
    ? "fixed inset-4 z-50 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 flex flex-col animate-in fade-in-0 zoom-in-95 duration-300"
    : "bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 h-full flex flex-col transition-all duration-300";

  const logContainerClasses = isMaximized
    ? "p-6 flex-grow bg-gray-900/50 overflow-y-auto"
    : "p-4 flex-grow bg-gray-900/50 overflow-y-auto h-64 min-h-[16rem]";

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
            <StatusIndicator status={status} />
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
            {logs.map((log, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-600 mr-2 select-none">&gt;</span>
                <span className="flex-1 break-words">{log}</span>
              </li>
            ))}
            {status === AgentStatusEnum.Idle && logs.length === 0 && (
               <li className="text-gray-500">Awaiting test initiation...</li>
            )}
          </ul>
          <div ref={logsEndRef} />
        </div>
        {isMaximized && (
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>{logs.length} log entries</span>
              <span>Press ESC or click outside to close</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};