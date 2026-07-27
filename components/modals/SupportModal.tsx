import React from 'react';
import { Modal } from './Modal';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { BugIcon } from '../icons/BugIcon';

const tickets = [
    { id: '#84321', issue: 'Cannot reset password', status: 'Resolved', agent: 'BillingBot', type: 'Common'},
    { id: '#84320', issue: 'Subscription renewal failed', status: 'Resolved', agent: 'BillingBot', type: 'Billing'},
    { id: '#84319', issue: 'Feature request: Dark mode', status: 'Triaged', agent: 'FeedbackBot', type: 'Feedback'},
    { id: '#84318', issue: 'API returning 500 error', status: 'Escalated', agent: 'TechBot', type: 'Technical'},
    { id: '#84317', issue: 'Login page not loading', status: 'Resolved', agent: 'TechBot', type: 'Technical'},
];

export const SupportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <Modal title="Customer Support Automation Simulation" onClose={onClose}>
      <div className="text-gray-300">
        <p className="mb-4 text-sm">
          This is a simulated view of a multi-agent customer support system. Agents automatically triage, categorize, and resolve incoming tickets, escalating to human support only when necessary.
        </p>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg">
          <div className="p-3 border-b border-gray-700">
            <h3 className="font-semibold text-gray-200">Live Ticket Feed</h3>
          </div>
          <ul className="divide-y divide-gray-700">
            {tickets.map(ticket => (
              <li key={ticket.id} className="p-3 flex items-center justify-between text-sm">
                <div className="flex items-center">
                    {ticket.status === 'Resolved' ? <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3"/> : <BugIcon className="w-5 h-5 text-yellow-400 mr-3" />}
                    <div>
                        <span className="font-medium text-gray-200">{ticket.issue}</span>
                        <span className="text-gray-400 ml-2">({ticket.id})</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full">{ticket.type}</span>
                    <span className={`text-xs font-medium ${ticket.status === 'Resolved' ? 'text-green-400' : 'text-yellow-400'}`}>{ticket.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};