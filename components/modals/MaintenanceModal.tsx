import React from 'react';
import { Modal } from './Modal';
import { PredictiveIcon } from '../icons/PredictiveIcon';
import { BugIcon } from '../icons/BugIcon';

const events = [
    { time: '1 min ago', msg: 'Anomaly Detected: DB query latency for `users` collection spiked to 800ms.', level: 'Warning' },
    { time: '3 min ago', msg: 'UI element #checkout-btn failed to render on 5% of sessions.', level: 'Critical' },
    { time: '8 min ago', msg: 'Predicted Failure: High memory usage pattern suggests potential outage in auth service within 2 hours.', level: 'Prediction' },
    { time: '15 min ago', msg: 'Healthy: API gateway p99 latency is stable at 120ms.', level: 'Info' },
];

export const MaintenanceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const levelStyles = {
        Critical: 'text-red-400 border-red-500/50',
        Warning: 'text-yellow-400 border-yellow-500/50',
        Prediction: 'text-cyan-400 border-cyan-500/50',
        Info: 'text-gray-400 border-gray-600'
    };

  return (
    <Modal title="Predictive Maintenance Simulation" onClose={onClose}>
      <div className="text-gray-300">
        <p className="mb-4 text-sm">
          This is a simulated monitoring dashboard where AI agents continuously analyze logs, database state, and UI changes to detect anomalies and predict potential failures before they impact users.
        </p>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg">
          <div className="p-3 border-b border-gray-700">
            <h3 className="font-semibold text-gray-200">Live Anomaly Feed</h3>
          </div>
          <ul className="divide-y divide-gray-700">
            {events.map(event => (
              <li key={event.msg} className={`p-3 flex items-start text-sm border-l-4 ${levelStyles[event.level]}`}>
                <div className="shrink-0 mr-3">
                    {event.level === 'Critical' ? <BugIcon className="w-5 h-5"/> : <PredictiveIcon className="w-5 h-5" />}
                </div>
                <div>
                    <p className="font-medium text-gray-200">{event.msg}</p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};