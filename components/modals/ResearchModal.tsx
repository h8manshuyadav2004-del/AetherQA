import React, { useState } from 'react';
import { Modal } from './Modal';
import { generateResearchReport } from '../../services/geminiService';

export const ResearchModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [topic, setTopic] = useState('The future of multi-agent AI systems');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const report = await generateResearchReport(topic);
      setResult(report);
    } catch (err) {
      setError('Failed to generate report. Please check your API key and network connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="Automated Research Crew Simulation" onClose={onClose}>
        <p className="mb-4 text-sm text-gray-400">
            Enter a research topic below. A crew of AI agents will be deployed to gather information, analyze findings, and generate a structured report.
        </p>
        <form onSubmit={handleGenerate}>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a research topic"
                    disabled={isLoading}
                    className="flex-grow bg-gray-700 text-gray-200 placeholder-gray-500 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading || !topic.trim()}
                    className="bg-cyan-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>
        </form>

        {(isLoading || result || error) && (
            <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-200 mb-2">Generated Report</h3>
                {isLoading && <p className="text-gray-400 animate-pulse">Research agents are currently compiling the report...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {result && <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{result}</pre>}
            </div>
        )}
    </Modal>
  );
};