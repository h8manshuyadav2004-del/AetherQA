import React from 'react';
import { A11yReport, A11yIssue } from '../types';
import { SummaryCard } from './SummaryCard';
import { BugIcon } from './icons/BugIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';

const severityStyles = {
  Critical: 'border-red-500/50 bg-red-900/20 text-red-400',
  Serious: 'border-yellow-500/50 bg-yellow-900/20 text-yellow-400',
  Moderate: 'border-cyan-500/50 bg-cyan-900/20 text-cyan-400',
  Minor: 'border-gray-600 bg-gray-800 text-gray-400',
};

const IssueCard: React.FC<{ issue: A11yIssue }> = ({ issue }) => {
    const severityClass = severityStyles[issue.severity] || severityStyles.Minor;
    return (
        <li className={`border ${severityClass} rounded-lg p-4`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-gray-100">{issue.description}</h4>
                    <p className="text-xs font-mono text-gray-500">{issue.element} ({issue.wcag})</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-700">{issue.severity}</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">{issue.fix.recommendation}</p>
            <div>
                <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-gray-300 select-none hover:text-white transition-colors">Show Generated Fix</summary>
                    <pre className="mt-2 p-3 bg-gray-900 rounded-md text-xs font-mono whitespace-pre-wrap border border-gray-700">{issue.fix.codeDiff}</pre>
                </details>
            </div>
             <div className="mt-3 pt-3 border-t border-gray-700">
                <button 
                    onClick={() => {
                        const message = `🚀 GitHub Integration Ready!\n\nThis accessibility fix can be integrated into your repository using:\n\n• Real GitHub API integration\n• Automated pull request creation\n• Code review workflows\n• CI/CD pipeline integration\n\nFor production use, configure:\n1. GitHub Personal Access Token\n2. Repository permissions\n3. Branch protection rules\n4. Review requirements\n\nWould you like to set up real GitHub integration for your project?`;
                        
                        if (confirm(message)) {
                            window.open('https://docs.github.com/en/rest/pulls/pulls#create-a-pull-request', '_blank');
                        }
                    }}
                    className="text-sm text-cyan-400 hover:underline cursor-pointer"
                >
                    View Integration Guide &rarr;
                </button>
            </div>
        </li>
    );
};


export const A11yReportDashboard: React.FC<{ report: A11yReport | null }> = ({ report }) => {
    if (!report) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Accessibility Repair Report</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <SummaryCard title="Issues Found" value={report.summary.issuesFound} Icon={BugIcon} colorClass="text-yellow-400" />
                <SummaryCard title="Issues Fixed" value={report.summary.issuesFixed} Icon={CheckCircleIcon} colorClass="text-green-400" />
                <SummaryCard title="A11y Score (After Fix)" value={`${report.summary.accessibilityScore}%`} Icon={ChartBarIcon} colorClass="text-cyan-400" />
            </div>
             <div>
                <h3 className="text-xl font-semibold mb-4"> Remediation Details</h3>
                <ul className="space-y-4">
                    {report.issues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
                </ul>
            </div>
        </section>
    );
};
