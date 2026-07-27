import React, { useState, useRef, useEffect } from 'react';
import { simulateDecisionGameTurn } from '../services/geminiService';
import { PersonaIcon } from '../components/icons/PersonaIcon';

interface Message {
    role: 'User' | 'Teammate' | 'Opponent';
    content: string;
}

const initialHistory: Message[] = [
    { role: 'Opponent', content: "Thanks for meeting. We've reviewed your proposal, but the $10,000/month license fee is significantly higher than we budgeted for." },
    { role: 'Teammate', content: "Okay, they're pushing back on price as expected. Remember, we can be flexible on implementation support, but we need to hold firm on the core value." }
];

const ChatBubble: React.FC<{ msg: Message }> = ({ msg }) => {
    const isUser = msg.role === 'User';
    const isTeammate = msg.role === 'Teammate';
    const bubbleStyles = isUser 
        ? 'bg-cyan-500 text-white self-end'
        : isTeammate ? 'bg-gray-600 text-gray-200 self-start' : 'bg-gray-700 text-gray-200 self-start';
    const icon = isTeammate ? '🤝' : '💼';

    return (
        <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 text-lg shrink-0">{icon}</div>}
            <div className={`max-w-md p-3 rounded-lg ${bubbleStyles}`}>
                <p className="text-sm">
                    {!isUser && <span className="font-bold block text-xs mb-1">{msg.role}</span>}
                    {msg.content}
                </p>
            </div>
        </div>
    )
}

export const DecisionGamePage: React.FC = () => {
    const [history, setHistory] = useState<Message[]>(initialHistory);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const userMessage: Message = { role: 'User', content: userInput };
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const geminiHistory = newHistory.map(m => ({ role: m.role, content: m.content }));
            const responseJson = await simulateDecisionGameTurn(geminiHistory);
            const response = JSON.parse(responseJson) as { teammateResponse: string, opponentResponse: string };
            
            const opponentMessage: Message = { role: 'Opponent', content: response.opponentResponse };
            const teammateMessage: Message = { role: 'Teammate', content: response.teammateResponse };

            setHistory(prev => [...prev, opponentMessage, teammateMessage]);

        } catch (err) {
            console.error(err);
            const errorMessage: Message = { role: 'Teammate', content: 'Sorry, I encountered an error. Please try again.' };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-cyan-400 sm:text-4xl">AI Multiplayer Decision Game</h1>
                <p className="mt-2 text-lg text-gray-400">
                    Negotiate a business deal with an AI opponent, guided by your AI teammate.
                </p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl flex flex-col h-[70vh]">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="font-semibold text-gray-200">Scenario: Software Contract Negotiation</h2>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {history.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                    {isLoading && <div className="text-center text-gray-400 text-sm animate-pulse">AI is thinking...</div>}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-gray-700 bg-gray-800">
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center gap-2">
                             <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Type your response..."
                                disabled={isLoading}
                                className="flex-grow bg-gray-700 text-gray-200 placeholder-gray-500 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !userInput.trim()}
                                className="bg-cyan-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors disabled:bg-gray-600"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};