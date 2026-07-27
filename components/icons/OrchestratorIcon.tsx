import React from 'react';

export const OrchestratorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 16v-2m0-8v4m-4-2h8m-8 6h8m-8-10h8M4 12H2m20 0h-2m-2-8l-2-2m-8 12l-2 2m12-12l-2 2m-8-2l2 2" />
    </svg>
);
