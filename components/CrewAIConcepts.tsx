import React from 'react';
import { OrchestratorIcon } from './icons/OrchestratorIcon';
import { SupportIcon } from './icons/SupportIcon';
import { ResearchIcon } from './icons/ResearchIcon';
import { CodeReviewIcon } from './icons/CodeReviewIcon';
import { PredictiveIcon } from './icons/PredictiveIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ModalType } from '../types';

const concepts = [
  {
    icon: OrchestratorIcon,
    title: 'End-to-End Autonomous Web App Testing',
    description: 'This app demos TestMarket, where agents compete in a market to test UI, logic, and DB layers. This optimizes bug discovery and makes the system efficient and self-improving.',
    modal: 'scroll' as const,
  },
  {
    icon: SupportIcon,
    title: 'Multi-Agent Customer Support Automation',
    description: 'Build a support system where agents triage tickets, classify issues, and resolve common problems, escalating only edge cases to humans for fast, 24/7 support.',
    modal: ModalType.Support,
  },
  {
    icon: ResearchIcon,
    title: 'Automated Research and Reporting Crew',
    description: 'Orchestrate agents to research topics from web sources, analyze data, summarize findings, and automatically generate detailed, structured reports.',
    modal: ModalType.Research,
  },
  {
    icon: CodeReviewIcon,
    title: 'Agentic Code Review & Documentation',
    description: 'Deploy agents for automatic code reviews, best practice checks, test case generation, and writing technical documentation, streamlining the development pipeline.',
    modal: ModalType.CodeReview,
  },
  {
    icon: PredictiveIcon,
    title: 'Predictive Maintenance for Web Apps',
    description: 'Use agents to continuously monitor logs, database state, and UI changes to detect anomalies and predict potential failures before they impact users.',
    modal: ModalType.Maintenance,
  },
];

const capabilities = [
  {
    title: 'Scalable Multi-Agent Collaboration',
    description: 'Orchestrate agents in parallel or complex flows for maximum efficiency.'
  },
  {
    title: 'Seamless Integration',
    description: 'Use Node.js to connect agents to APIs, web automation tools, and databases.'
  },
  {
    title: 'Stateful Memory',
    description: 'Enable agents to share results, learn from history, and adapt their strategies using persistent storage.'
  },
  {
    title: 'Full Autonomy',
    description: 'Enable agents to learn testing scenarios and adjust to application changes, minimizing human intervention.'
  },
];

interface ConceptCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ icon: Icon, title, description, onClick }) => (
    <button 
        onClick={onClick} 
        className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col items-start h-full text-left transition-all transform hover:-translate-y-1 hover:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
    >
        <div className="bg-gray-700 p-3 rounded-full mb-4">
            <Icon className="w-7 h-7 text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-400 flex-grow">{description}</p>
    </button>
);

interface CrewAIConceptsProps {
  onCardClick: (modalType: ModalType | 'scroll') => void;
}

export const CrewAIConcepts: React.FC<CrewAIConceptsProps> = ({ onCardClick }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 mt-12 animate-fade-in" id="concepts">
      <h2 className="text-3xl font-bold text-center mb-4 text-cyan-400">
        Powered by Multi-Agent AI Concepts
      </h2>
      <p className="text-center text-gray-400 mb-10 max-w-3xl mx-auto">
        The principles behind this demonstrator can be extended to create powerful, autonomous systems for various domains using custom orchestration, Node.js backends, and persistent storage for stateful memory.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.map((concept) => (
          <ConceptCard 
            key={concept.title} 
            icon={concept.icon} 
            title={concept.title} 
            description={concept.description} 
            onClick={() => onCardClick(concept.modal)} 
          />
        ))}
        <button 
          onClick={() => onCardClick(ModalType.YourIdea)} 
          className="bg-gray-800 border-dashed border-2 border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center h-full text-center text-gray-400 transition-all hover:border-cyan-500 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
        >
          <h3 className="text-lg font-bold text-gray-100 mb-2">Your Idea Here</h3>
          <p className="text-sm">Combine agents to create novel autonomous solutions for your specific challenges.</p>
        </button>
      </div>

      <div className="mt-16">
        <h3 className="text-2xl font-bold mb-6 text-center">Key Capabilities</h3>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {capabilities.map((capability, index) => (
            <div key={index} className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3 shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-200">{capability.title}</h4>
                <p className="text-sm text-gray-400">{capability.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};