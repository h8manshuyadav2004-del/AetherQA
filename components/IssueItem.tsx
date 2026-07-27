import React from 'react';
import { Issue, AgentType, Evidence } from '../types';
import { UiAgentIcon } from './icons/UiAgentIcon';
import { FunctionalAgentIcon } from './icons/FunctionalAgentIcon';
import { DbAgentIcon } from './icons/DbAgentIcon';
import { PersonaIcon } from './icons/PersonaIcon';

const severityStyles = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Medium: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const agentIcons = {
  [AgentType.UI]: UiAgentIcon,
  [AgentType.Functional]: FunctionalAgentIcon,
  [AgentType.DB]: DbAgentIcon,
  [AgentType.Orchestrator]: () => null,
}

const EvidenceLink: React.FC<{item: Evidence}> = ({item}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Try to open the evidence file, fallback to showing info if not available
    const fullUrl = item.link.startsWith('http') ? item.link : `http://localhost:3001${item.link}`;
    
    fetch(fullUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          window.open(fullUrl, '_blank');
        } else {
          alert(`Evidence file not yet available: ${item.type}\nFile: ${item.link}\n\nThis file will be generated during real testing.`);
        }
      })
      .catch(() => {
        alert(`Evidence file not accessible: ${item.type}\nFile: ${item.link}\n\nMake sure the backend server is running on port 3001.`);
      });
  };

  return (
    <button 
      onClick={handleClick}
      className="text-cyan-400 hover:text-cyan-300 hover:underline text-sm cursor-pointer"
    >
      {item.type}
    </button>
  );
}

export const IssueItem: React.FC<{ issue: Issue }> = ({ issue }) => {
  const severityClass = severityStyles[issue.severity] || severityStyles.Low;
  const AgentIcon = agentIcons[issue.agent];

  return (
    <li className="bg-gray-800 border border-gray-700 p-4 rounded-lg transition-colors group">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <p className="font-semibold text-gray-100">{issue.description}</p>
          <p className="text-sm text-gray-400 mt-2">
            <span className="font-medium text-gray-300">Recommendation:</span> {issue.recommendation}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2 text-xs shrink-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${severityClass}`}>
            {issue.severity}
          </span>
          <div className="flex items-center text-gray-400" title={`Detected by ${issue.agent} Agent`}>
            <AgentIcon className="w-4 h-4 mr-1.5" />
            <span>{issue.agent} Agent</span>
          </div>
           {issue.persona && (
             <div className="flex items-center text-gray-400" title={`Discovered by Persona: ${issue.persona}`}>
                <PersonaIcon className="w-4 h-4 mr-1.5" />
                <span>{issue.persona}</span>
             </div>
           )}
        </div>
      </div>
      
      <div className="mt-4 border-t border-gray-700 pt-4">
          <details className="text-sm">
              <summary className="cursor-pointer font-medium text-gray-300 select-none group-hover:text-white transition-colors">Root Cause Analysis</summary>
              <div className="mt-2 pl-4 border-l-2 border-gray-600">
                  <div className="mb-2">
                      <p className="font-semibold text-gray-400">Causal Trace:</p>
                      <p className="font-mono text-cyan-400 text-xs bg-gray-900 p-2 rounded-md mt-1">{issue.causalTrace}</p>
                  </div>
                   <div>
                      <p className="font-semibold text-gray-400 mb-1">Confidence Score:</p>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{width: `${issue.confidence}%`}}></div>
                      </div>
                      <p className="text-right text-xs text-gray-500">{issue.confidence}%</p>
                  </div>
              </div>
          </details>
      </div>

       <div className="mt-2 border-t border-gray-700 pt-2">
          <details className="text-sm">
              <summary className="cursor-pointer font-medium text-gray-300 select-none group-hover:text-white transition-colors">Evidence Bundle</summary>
              <div className="mt-2 pl-4 border-l-2 border-gray-600">
                  <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {issue.evidence.map(item => (
                          <li key={item.link}><EvidenceLink item={item} /></li>
                      ))}
                  </ul>
              </div>
          </details>
      </div>

    </li>
  );
};
