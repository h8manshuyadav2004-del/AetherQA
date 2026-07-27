import React from 'react';
import { AdvancedModule } from '../types';
import { ShadowRunnerIcon } from './icons/ShadowRunnerIcon';
import { CausalTraceIcon } from './icons/CausalTraceIcon';
import { PersonaIcon } from './icons/PersonaIcon';
import { LocatorGenieIcon } from './icons/LocatorGenieIcon';
import { DbContractIcon } from './icons/DbContractIcon';
import { TemporalFuzzingIcon } from './icons/TemporalFuzzingIcon';
import { TicketIcon } from './icons/TicketIcon';
import { CoverageTokenIcon } from './icons/CoverageTokenIcon';

interface AdvancedFeaturesPanelProps {
    modules: Record<AdvancedModule, boolean>;
    setModules: React.Dispatch<React.SetStateAction<Record<AdvancedModule, boolean>>>;
    isTesting: boolean;
}

const moduleDetails = {
    [AdvancedModule.ShadowRunner]: { Icon: ShadowRunnerIcon, description: "Passively observe and actively replay sanitized user sessions to find bugs in actual user journeys." },
    [AdvancedModule.CausalTraceback]: { Icon: CausalTraceIcon, description: "Produce a causal chain across UI, API, and DB to pinpoint the root cause of any failure." },
    [AdvancedModule.PDATO]: { Icon: PersonaIcon, description: "Combine realistic user personas with adversarial mutations to discover elusive edge-case flaws." },
    [AdvancedModule.LocatorGenie]: { Icon: LocatorGenieIcon, description: "Use visual and DOM data to create self-healing locators that adapt on-the-fly to UI changes." },
    [AdvancedModule.DBContract]: { Icon: DbContractIcon, description: "Automatically infer and continuously enforce data contracts to prevent data corruption at the source." },
    [AdvancedModule.TemporalFuzzing]: { Icon: TemporalFuzzingIcon, description: "Find time-related bugs (e.g., token expiries) by manipulating time during test execution." },
    [AdvancedModule.AutoTicketing]: { Icon: TicketIcon, description: "Generate triage-ready bug tickets with root-cause analysis, explanations, and evidence." },
    [AdvancedModule.ProvableCoverage]: { Icon: CoverageTokenIcon, description: "Represent test coverage as compact state hashes to prioritize and explore uncovered state-space." },
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled: boolean; }> = ({ checked, onChange, disabled }) => (
    <button
        type="button"
        className={`${checked ? 'bg-cyan-500' : 'bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50`}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
    >
        <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
    </button>
);


export const AdvancedFeaturesPanel: React.FC<AdvancedFeaturesPanelProps> = ({ modules, setModules, isTesting }) => {
    const handleToggle = (module: AdvancedModule) => {
        setModules(prev => ({...prev, [module]: !prev[module]}));
    };
    
    return (
        <section className="max-w-7xl mx-auto px-4 mb-8">
            <details className="bg-gray-800 border border-gray-700 rounded-lg" open>
                <summary className="text-lg font-semibold p-4 cursor-pointer select-none">Core Mechanisms & Agent Capabilities</summary>
                <div className="p-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.values(AdvancedModule).map(module => {
                        const { Icon, description } = moduleDetails[module];
                        return (
                            <div key={module} className="bg-gray-900/50 border border-gray-700/50 p-4 rounded-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <Icon className="w-6 h-6 mr-3 text-cyan-400" />
                                            <h4 className="font-bold text-base">{module}</h4>
                                        </div>
                                        <ToggleSwitch
                                            checked={modules[module]}
                                            onChange={() => handleToggle(module)}
                                            disabled={isTesting}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">{description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </details>
        </section>
    );
};