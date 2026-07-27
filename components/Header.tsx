import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <h1 className="text-3xl font-bold text-cyan-400 sm:text-4xl">
        TestMarket: Autonomous E2E Testing
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        A market-driven, multi-agent testing economy
      </p>
    </header>
  );
};