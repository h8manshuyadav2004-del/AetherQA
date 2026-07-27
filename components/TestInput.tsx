import React from 'react';

interface TestInputProps {
  url: string;
  setUrl: (url: string) => void;
  budget: number;
  setBudget: (budget: number) => void;
  onStart: () => void;
  isTesting: boolean;
}

export const TestInput: React.FC<TestInputProps> = ({ url, setUrl, budget, setBudget, onStart, isTesting }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onStart();
    }
  };

  return (
    <section className="mb-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-lg focus-within:ring-2 focus-within:ring-cyan-500 transition-shadow">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            disabled={isTesting}
            className="w-full sm:flex-1 bg-transparent text-gray-200 placeholder-gray-500 px-4 py-2 focus:outline-none disabled:opacity-50"
            aria-label="Target URL"
          />
          <div className="flex items-center w-full sm:w-auto mt-2 sm:mt-0 sm:border-l sm:border-r border-gray-700 sm:px-2">
             <label htmlFor="budget" className="text-gray-400 text-sm px-2">Budget</label>
             <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                min="100"
                step="50"
                disabled={isTesting}
                className="w-24 bg-gray-700 text-gray-200 placeholder-gray-500 px-2 py-2 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                aria-label="Test Budget"
             />
          </div>
          <button
            type="submit"
            disabled={isTesting || !url.trim()}
            className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2 bg-cyan-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isTesting ? 'Testing...' : 'Launch Test'}
          </button>
        </div>
      </form>
    </section>
  );
};