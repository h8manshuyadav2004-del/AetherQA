import React from 'react';

export const CausalTraceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15s-2-3-4-5-4-4-6-4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 19s-2-3-4-5-4-4-6-4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 19V5h14" />
    </svg>
);
