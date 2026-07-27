import React, { useState } from 'react';
import { Modal } from './Modal';
import { analyzeIdea } from '../../services/geminiService';

const defaultIdea = `An autonomous agent crew that can take a product idea, write the user stories, design the UI, write the code, and deploy it to a cloud server.`;

export const YourIdeaModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [idea, setIdea] = useState(defaultIdea);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const analysis = await analyzeIdea(idea);
      setResult(analysis);
    } catch (err) {
      setError('Failed to generate analysis. Please check your API key and network connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="AI Workflow Architect Simulation" onClose={onClose}>
        <p className="mb-4 text-sm text-gray-400">
            Describe an idea for a multi-agent system. An AI Architect agent will analyze its feasibility, recommend an agent workflow, and identify potential challenges.
        </p>
        <form onSubmit={handleAnalysis}>
            <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your multi-agent system idea..."
                disabled={isLoading}
                rows={5}
                className="w-full bg-gray-700 text-gray-200 placeholder-gray-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={isLoading || !idea.trim()}
                className="mt-2 w-full bg-cyan-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Analyzing...' : 'Analyze Idea'}
            </button>
        </form>

        {(isLoading || result || error) && (
            <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-200 mb-2">Architect Agent Analysis</h3>
                {isLoading && <p className="text-gray-400 animate-pulse">AI Architect is analyzing your concept...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {result && <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{result}</pre>}
            </div>
        )}
    </Modal>
  );
};