import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { OrchestratorIcon } from './icons/OrchestratorIcon';
import { WorkflowIcon } from './icons/WorkflowIcon';

import { DataAnalystIcon } from './icons/DataAnalystIcon';
import { DecisionGameIcon } from './icons/DecisionGameIcon';
import { XIcon } from './icons/XIcon';
import { A11yFixerIcon } from './icons/A11yFixerIcon';

const navigation = [
  { name: 'E2E Test Market', href: '/', icon: OrchestratorIcon },
  { name: 'A11y Fixer Crew', href: '/a11y-fixer', icon: A11yFixerIcon },
  { name: 'Workflow Composer', href: '/workflow-composer', icon: WorkflowIcon },

  { name: 'Data Analyst', href: '/data-analyst', icon: DataAnalystIcon },
  { name: 'Decision Game', href: '/decision-game', icon: DecisionGameIcon },
];

const NavItem: React.FC<{ item: typeof navigation[0], onClick?: () => void }> = ({ item, onClick }) => (
    <NavLink
        to={item.href}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`
        }
    >
        <item.icon className="w-5 h-5 mr-3" />
        {item.name}
    </NavLink>
);


export const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="font-bold text-xl text-cyan-400">Multi-Agent AI</span>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navigation.map((item) => (
                                <NavItem key={item.name} item={item} />
                            ))}
                        </div>
                    </div>
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <XIcon className="block h-6 w-6" />
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navigation.map((item) => (
                           <NavItem key={item.name} item={item} onClick={() => setIsOpen(false)}/>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};
