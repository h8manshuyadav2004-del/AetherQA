import React, { useState, useRef } from 'react';
import { analyzeDataset } from '../services/geminiService';
import { DataAnalystIcon } from '../components/icons/DataAnalystIcon';

const defaultData = `Date,Users,Revenue,SessionTime
2024-01-01,1500,4500,240
2024-01-02,1550,4800,250
2024-01-03,1480,4400,235
2024-01-04,1600,5200,260
2024-01-05,1620,5300,265`;

export const DataAnalystPage: React.FC = () => {
    const [data, setData] = useState(defaultData);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const [inputMethod, setInputMethod] = useState<'paste' | 'upload'>('paste');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        // Check file type
        const allowedTypes = ['.csv', '.txt', '.json', '.tsv', '.log'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            setError('Supported file types: CSV, TXT, JSON, TSV, LOG');
            return;
        }

        setFileName(file.name);
        setError('');

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setData(content);
            setInputMethod('upload');
        };
        reader.onerror = () => {
            setError('Failed to read file');
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.trim()) return;
        setIsLoading(true);
        setResult('');
        setError('');
        try {
            const analysis = await analyzeDataset(data);
            setResult(analysis);
        } catch (err) {
            setError('Failed to generate analysis. Please check your API key and network connection.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const clearData = () => {
        setData('');
        setFileName('');
        setInputMethod('paste');
        setResult('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const loadSampleData = () => {
        setData(defaultData);
        setFileName('');
        setInputMethod('paste');
        setResult('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-cyan-400 sm:text-4xl">Mixture-of-Experts AI Analyst</h1>
                <p className="mt-2 text-lg text-gray-400">
                    Paste your dataset (e.g., CSV, text, logs) and our expert AI crew will provide a multi-faceted analysis.
                </p>
            </div>

            {/* Input Method Tabs */}
            <div className="flex mb-4 bg-gray-800 rounded-lg p-1 border border-gray-700">
                <button
                    type="button"
                    onClick={() => setInputMethod('paste')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        inputMethod === 'paste'
                            ? 'bg-cyan-500 text-white'
                            : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    📝 Paste Data
                </button>
                <button
                    type="button"
                    onClick={() => setInputMethod('upload')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        inputMethod === 'upload'
                            ? 'bg-cyan-500 text-white'
                            : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    📁 Upload File
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {inputMethod === 'paste' ? (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-300">
                                Paste your dataset
                            </label>
                            <button
                                type="button"
                                onClick={loadSampleData}
                                className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                            >
                                Load Sample Data
                            </button>
                        </div>
                        <textarea
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            placeholder="Paste your CSV, JSON, or text data here..."
                            disabled={isLoading}
                            rows={10}
                            className="w-full bg-gray-800 font-mono text-sm text-gray-200 placeholder-gray-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 border border-gray-700"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Upload your dataset file
                        </label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.txt,.json,.tsv,.log"
                                onChange={handleFileUpload}
                                disabled={isLoading}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="text-gray-300 font-medium">
                                    {fileName ? `Selected: ${fileName}` : 'Click to upload file'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Supports CSV, TXT, JSON, TSV, LOG (max 5MB)
                                </p>
                            </label>
                        </div>
                        
                        {fileName && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-300">File Preview:</span>
                                    <button
                                        type="button"
                                        onClick={clearData}
                                        className="text-xs text-red-400 hover:text-red-300 underline"
                                    >
                                        Clear File
                                    </button>
                                </div>
                                <div className="bg-gray-800 border border-gray-700 rounded-md p-3 max-h-40 overflow-y-auto">
                                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                                        {data.length > 500 ? data.substring(0, 500) + '...' : data}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !data.trim()}
                    className="mt-4 w-full flex justify-center items-center bg-cyan-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors disabled:bg-gray-600"
                >
                    <DataAnalystIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Analyzing Data...' : 'Run Analysis'}
                </button>
            </form>

             {(isLoading || result || error) && (
                <div className="mt-8 p-6 bg-gray-800 border border-gray-700 rounded-lg">
                    <h3 className="font-semibold text-xl text-gray-200 mb-4">Expert Analysis Report</h3>
                    {isLoading && <p className="text-gray-400 animate-pulse">Our AI analyst team is reviewing the data...</p>}
                    {error && <p className="text-red-400">{error}</p>}
                    {result && <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }}></div>}
                </div>
            )}
        </div>
    );
};