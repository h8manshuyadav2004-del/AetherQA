import React, { useState, useRef, useCallback } from 'react';
import { UiAgentIcon } from '../components/icons/UiAgentIcon';
import { DbAgentIcon } from '../components/icons/DbAgentIcon';
import { FunctionalAgentIcon } from '../components/icons/FunctionalAgentIcon';
import { ResearchIcon } from '../components/icons/ResearchIcon';
import { SupportIcon } from '../components/icons/SupportIcon';
import { CodeReviewIcon } from '../components/icons/CodeReviewIcon';

interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  x: number;
  y: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  logs: string[];
}

interface Connection {
  from: string;
  to: string;
}

const agentTypes = [
    { type: 'ui', name: 'UI Agent', icon: UiAgentIcon, color: 'text-cyan-400' },
    { type: 'db', name: 'DB Agent', icon: DbAgentIcon, color: 'text-yellow-400' },
    { type: 'functional', name: 'Functional Agent', icon: FunctionalAgentIcon, color: 'text-green-400' },
    { type: 'research', name: 'Research Agent', icon: ResearchIcon, color: 'text-blue-400' },
    { type: 'support', name: 'Support Agent', icon: SupportIcon, color: 'text-purple-400' },
    { type: 'codereview', name: 'Code Review Agent', icon: CodeReviewIcon, color: 'text-indigo-400' },
];

const DraggableAgent: React.FC<{ 
  agent: typeof agentTypes[0], 
  onDragStart: (agent: typeof agentTypes[0]) => void 
}> = ({ agent, onDragStart }) => (
    <div 
        draggable
        onDragStart={() => onDragStart(agent)}
        className="bg-gray-700 p-3 rounded-lg flex items-center cursor-grab active:cursor-grabbing border border-gray-600 hover:bg-gray-600 transition-colors"
    >
        <agent.icon className={`w-6 h-6 mr-3 ${agent.color}`} />
        <span className="font-medium text-gray-200">{agent.name}</span>
    </div>
);

const WorkflowNodeComponent: React.FC<{ 
  node: WorkflowNode,
  onDelete: (id: string) => void,
  onSelect: (id: string) => void,
  onMove: (id: string, x: number, y: number) => void,
  isSelected: boolean
}> = ({ node, onDelete, onSelect, onMove, isSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const statusColors = {
    idle: 'border-gray-600',
    running: 'border-cyan-500 animate-pulse',
    completed: 'border-green-500',
    error: 'border-red-500'
  };

  const statusDots = {
    idle: 'bg-gray-500',
    running: 'bg-cyan-500 animate-pulse',
    completed: 'bg-green-500',
    error: 'bg-red-500'
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // Don't drag when clicking delete button
    
    setIsDragging(true);
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const canvas = document.querySelector('[data-canvas="true"]') as HTMLElement;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 192));
    const newY = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 80));
    
    onMove(node.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, node.id]);

  return (
    <div 
      className={`absolute bg-gray-800 border-2 rounded-lg shadow-lg p-3 w-48 transition-all ${
        statusColors[node.status]
      } ${isSelected ? 'ring-2 ring-cyan-400' : ''} ${
        isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'
      }`}
      style={{ left: `${node.x}px`, top: `${node.y}px` }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (!isDragging) onSelect(node.id);
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <node.icon className={`w-5 h-5 mr-2 ${node.color}`} />
          <h4 className="font-bold text-gray-100 text-sm">{node.name}</h4>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="text-gray-400 hover:text-red-400 text-xs"
        >
          ✕
        </button>
      </div>
      <div className="flex items-center mb-1">
        <div className={`w-2 h-2 rounded-full mr-2 ${statusDots[node.status]}`}></div>
        <p className="text-xs text-gray-400 capitalize">{node.status}</p>
      </div>
      {node.logs.length > 0 && (
        <div className="text-xs text-gray-500 max-h-16 overflow-y-auto">
          {node.logs.slice(-2).map((log, i) => (
            <div key={i} className="truncate">&gt; {log}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export const WorkflowComposerPage: React.FC = () => {
    const [nodes, setNodes] = useState<WorkflowNode[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [draggedAgent, setDraggedAgent] = useState<typeof agentTypes[0] | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleDragStart = (agent: typeof agentTypes[0]) => {
        setDraggedAgent(agent);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedAgent || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 96; // Center the node
        const y = e.clientY - rect.top - 40;

        const newNode: WorkflowNode = {
            id: `${draggedAgent.type}-${Date.now()}`,
            type: draggedAgent.type,
            name: draggedAgent.name,
            icon: draggedAgent.icon,
            color: draggedAgent.color,
            x: Math.max(0, Math.min(x, rect.width - 192)),
            y: Math.max(0, Math.min(y, rect.height - 80)),
            status: 'idle',
            logs: []
        };

        setNodes(prev => [...prev, newNode]);
        setDraggedAgent(null);
    };

    const deleteNode = (id: string) => {
        setNodes(prev => prev.filter(n => n.id !== id));
        setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
        if (selectedNode === id) setSelectedNode(null);
    };

    const selectNode = (id: string) => {
        setSelectedNode(selectedNode === id ? null : id);
    };

    const moveNode = (id: string, x: number, y: number) => {
        setNodes(prev => prev.map(n => 
            n.id === id ? { ...n, x, y } : n
        ));
    };

    const connectNodes = () => {
        if (nodes.length < 2) return;
        
        // Auto-connect nodes in sequence for demo
        const newConnections: Connection[] = [];
        for (let i = 0; i < nodes.length - 1; i++) {
            newConnections.push({
                from: nodes[i].id,
                to: nodes[i + 1].id
            });
        }
        setConnections(newConnections);
    };

    const runWorkflow = async () => {
        if (nodes.length === 0) return;
        
        setIsRunning(true);
        
        // Reset all nodes to idle
        setNodes(prev => prev.map(n => ({ ...n, status: 'idle' as const, logs: [] })));
        
        // Execute nodes in sequence
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            
            // Set current node to running
            setNodes(prev => prev.map(n => 
                n.id === node.id ? { ...n, status: 'running' as const } : n
            ));
            
            // Simulate agent work
            await simulateAgentWork(node);
            
            // Set current node to completed
            setNodes(prev => prev.map(n => 
                n.id === node.id ? { ...n, status: 'completed' as const } : n
            ));
            
            // Wait before next node
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        setIsRunning(false);
    };

    const simulateAgentWork = async (node: WorkflowNode) => {
        const workMessages = {
            ui: [
                'Initializing UI testing framework...',
                'Scanning page elements and interactions...',
                'Testing form validations and user flows...',
                'UI analysis complete'
            ],
            db: [
                'Connecting to database systems...',
                'Running integrity checks and queries...',
                'Validating data consistency...',
                'Database validation complete'
            ],
            functional: [
                'Discovering API endpoints...',
                'Testing business logic and workflows...',
                'Validating response schemas...',
                'Functional testing complete'
            ],
            research: [
                'Gathering information from sources...',
                'Analyzing data patterns and trends...',
                'Synthesizing research findings...',
                'Research analysis complete'
            ],
            support: [
                'Processing support requests...',
                'Categorizing and prioritizing issues...',
                'Generating response recommendations...',
                'Support analysis complete'
            ],
            codereview: [
                'Analyzing code structure and patterns...',
                'Checking for best practices and bugs...',
                'Generating improvement suggestions...',
                'Code review complete'
            ]
        };

        const messages = workMessages[node.type as keyof typeof workMessages] || [
            'Starting agent work...',
            'Processing tasks...',
            'Completing analysis...',
            'Agent work complete'
        ];

        for (const message of messages) {
            setNodes(prev => prev.map(n => 
                n.id === node.id 
                    ? { ...n, logs: [...n.logs, message] }
                    : n
            ));
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    };

    const clearWorkflow = () => {
        setNodes([]);
        setConnections([]);
        setSelectedNode(null);
    };

    const getConnectionPath = (from: WorkflowNode, to: WorkflowNode) => {
        const fromX = from.x + 96; // Center of node
        const fromY = from.y + 40;
        const toX = to.x + 96;
        const toY = to.y + 40;
        
        return `M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${fromY} ${toX} ${toY}`;
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-cyan-400 sm:text-4xl">AI Workflow Composer & Simulator</h1>
                <p className="mt-2 text-lg text-gray-400 max-w-3xl mx-auto">
                    Visually design, connect, and simulate custom multi-agent workflows. Drag agents onto the canvas to build your own autonomous crew.
                </p>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={connectNodes}
                    disabled={nodes.length < 2 || isRunning}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    Auto-Connect Nodes
                </button>
                <button
                    onClick={runWorkflow}
                    disabled={nodes.length === 0 || isRunning}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    {isRunning ? 'Running...' : 'Run Workflow'}
                </button>
                <button
                    onClick={clearWorkflow}
                    disabled={isRunning}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    Clear All
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
                {/* Sidebar */}
                <aside className="lg:w-1/4 bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4 text-gray-200">Agent Library</h3>
                    <div className="space-y-3">
                        {agentTypes.map(agent => (
                            <DraggableAgent 
                                key={agent.type} 
                                agent={agent} 
                                onDragStart={handleDragStart}
                            />
                        ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <h4 className="font-medium text-gray-300 mb-2">Instructions</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                            <li>• Drag agents to canvas</li>
                            <li>• Click nodes to select</li>
                            <li>• Use controls to connect & run</li>
                            <li>• Watch real-time execution</li>
                        </ul>
                    </div>
                </aside>

                {/* Canvas */}
                <main 
                    ref={canvasRef}
                    data-canvas="true"
                    className="flex-1 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg p-4 min-h-[60vh] relative overflow-hidden"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    
                    {/* Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {connections.map(conn => {
                            const fromNode = nodes.find(n => n.id === conn.from);
                            const toNode = nodes.find(n => n.id === conn.to);
                            if (!fromNode || !toNode) return null;
                            
                            return (
                                <path
                                    key={`${conn.from}-${conn.to}`}
                                    d={getConnectionPath(fromNode, toNode)}
                                    stroke="#4a5568"
                                    strokeWidth="2"
                                    fill="none"
                                    markerEnd="url(#arrowhead)"
                                />
                            );
                        })}
                        <defs>
                            <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="7"
                                refX="9"
                                refY="3.5"
                                orient="auto"
                            >
                                <polygon
                                    points="0 0, 10 3.5, 0 7"
                                    fill="#4a5568"
                                />
                            </marker>
                        </defs>
                    </svg>

                    {/* Nodes */}
                    {nodes.map(node => (
                        <WorkflowNodeComponent
                            key={node.id}
                            node={node}
                            onDelete={deleteNode}
                            onSelect={selectNode}
                            onMove={moveNode}
                            isSelected={selectedNode === node.id}
                        />
                    ))}
                    
                    {nodes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <p className="text-lg mb-2">Drag agents from the library to start building</p>
                                <p className="text-sm">Create custom multi-agent workflows visually</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const bgGridPattern = `
.bg-grid-pattern {
    background-image: linear-gradient(to right, #2d3748 1px, transparent 1px), linear-gradient(to bottom, #2d3748 1px, transparent 1px);
    background-size: 2rem 2rem;
}`;

const style = document.createElement('style');
style.textContent = bgGridPattern;
document.head.append(style);
