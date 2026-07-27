import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  Icon: React.ElementType;
  colorClass: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, Icon, colorClass }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg flex items-center">
      <div className={`p-3 rounded-full bg-gray-700 mr-4 ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};
