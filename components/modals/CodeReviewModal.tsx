import React, { useState } from 'react';
import { Modal } from './Modal';
import { generateCodeReview } from '../../services/geminiService';

const defaultCode = `function factorial(n) {
  if (n < 0) {
    return "Number must be non-negative";
  }
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}`;

export const CodeReviewModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [code, setCode] = useState(defaultCode);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const review = await generateCodeReview(code);
      setResult(review);
    } catch (err) {
      setError('Failed to generate review. Please check your API key and network connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="Agentic Code Review Simulation" onClose={onClose}>
        <p className="mb-4 text-sm text-gray-400">
            Paste a code snippet below. An AI agent will perform an automatic code review, checking for bugs, best practices, and potential improvements.
        </p>
        <form onSubmit={handleReview}>
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code snippet here"
                disabled={isLoading}
                rows={8}
                className="w-full bg-gray-900 font-mono text-sm text-gray-200 placeholder-gray-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 border border-gray-700"
            />
            <button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="mt-2 w-full bg-cyan-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Reviewing...' : 'Review Code'}
            </button>
        </form>

        {(isLoading || result || error) && (
            <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-200 mb-2">Code Review Analysis</h3>
                {isLoading && <p className="text-gray-400 animate-pulse">AI agent is analyzing the code...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {result && <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{result}</pre>}
            </div>
        )}
    </Modal>
  );
};