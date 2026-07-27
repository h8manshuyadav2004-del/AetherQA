import React from 'react';
import { TestResult } from '../types';
import { SummaryCard } from './SummaryCard';
import { IssueItem } from './IssueItem';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { BugIcon } from './icons/BugIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { EfficiencyIcon } from './icons/EfficiencyIcon';
import { RoiIcon } from './icons/RoiIcon';
import { MttdIcon } from './icons/MttdIcon';
import { FlakinessIcon } from './icons/FlakinessIcon';

interface ResultsDashboardProps {
  results: TestResult | null;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results }) => {
  if (!results) return null;

  const { summary, kpis, issues } = results;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-center">Unified Test Report</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Tests Passed"
          value={summary.testsPassed}
          Icon={CheckCircleIcon}
          colorClass="text-green-400"
        />
        <SummaryCard
          title="Tests Failed"
          value={summary.testsFailed}
          Icon={XCircleIcon}
          colorClass="text-red-400"
        />
        <SummaryCard
          title="Bugs Found"
          value={summary.bugsFound}
          Icon={BugIcon}
          colorClass="text-yellow-400"
        />
        <SummaryCard
          title="Test Coverage"
          value={`${summary.coveragePercent}%`}
          Icon={ChartBarIcon}
          colorClass="text-cyan-400"
        />
      </div>

      {/* KPIs Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-center">Performance Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
            title="Efficiency (Bugs/1k CU)"
            value={typeof kpis.efficiency === 'number' ? kpis.efficiency.toFixed(2) : kpis.efficiency}
            Icon={EfficiencyIcon}
            colorClass="text-green-400"
            />
            <SummaryCard
            title="Avg. Agent ROI"
            value={`${Math.round((kpis.agentROI.ui + kpis.agentROI.functional + kpis.agentROI.db) / 3)}%`}
            Icon={RoiIcon}
            colorClass="text-cyan-400"
            />
            <SummaryCard
            title="MTTD (hours)"
            value={kpis.meanTimeToDetect}
            Icon={MttdIcon}
            colorClass="text-yellow-400"
            />
            <SummaryCard
            title="Flakiness Score"
            value={`${kpis.flakinessScore}%`}
            Icon={FlakinessIcon}
            colorClass="text-red-400"
            />
        </div>
      </div>


      {/* Issues List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Detected Issues</h3>
        {issues.length > 0 ? (
          <ul className="space-y-4">
            {issues.map((issue) => (
              <IssueItem key={issue.id} issue={issue} />
            ))}
          </ul>
        ) : (
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center text-gray-400">
            <p>No issues were detected during this test run. Great job!</p>
          </div>
        )}
      </div>
    </section>
  );
};