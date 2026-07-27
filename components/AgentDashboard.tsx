import React, { useState, useEffect } from 'react';
import { AgentState, AgentType } from '../types';
import { AgentStatus } from './AgentStatus';

interface LiveMarketDashboardProps {
  agentData: Record<Exclude<AgentType, AgentType.Orchestrator>, AgentState>;
  marketData: AgentState;
}

export const LiveMarketDashboard: React.FC<LiveMarketDashboardProps> = ({ agentData, marketData }) => {
  const [maximizedAgent, setMaximizedAgent] = useState<AgentType | null>(null);

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

  const handleToggleMaximize = (agentType: AgentType) => {
    setMaximizedAgent(maximizedAgent === agentType ? null : agentType);
  };

  return (
    <section className="px-4 mb-8 space-y-6">
      <div className="max-w-7xl mx-auto">
        <AgentStatus
          agentType={AgentType.Orchestrator}
          status={marketData.status}
          logs={marketData.logs}
          isMaximized={maximizedAgent === AgentType.Orchestrator}
          onToggleMaximize={() => handleToggleMaximize(AgentType.Orchestrator)}
        />
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AgentStatus
          agentType={AgentType.UI}
          status={agentData.UI.status}
          logs={agentData.UI.logs}
          isMaximized={maximizedAgent === AgentType.UI}
          onToggleMaximize={() => handleToggleMaximize(AgentType.UI)}
        />
        <AgentStatus
          agentType={AgentType.Functional}
          status={agentData.Functional.status}
          logs={agentData.Functional.logs}
          isMaximized={maximizedAgent === AgentType.Functional}
          onToggleMaximize={() => handleToggleMaximize(AgentType.Functional)}
        />
        <AgentStatus
          agentType={AgentType.DB}
          status={agentData.DB.status}
          logs={agentData.DB.logs}
          isMaximized={maximizedAgent === AgentType.DB}
          onToggleMaximize={() => handleToggleMaximize(AgentType.DB)}
        />
      </div>
    </section>
  );
};