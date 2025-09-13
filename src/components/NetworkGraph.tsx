"use client";

import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { showToast } from "@/utils/toast";
import { Node, Link, NetworkSimulationConfig, NetworkGraphProps, AdjacencyMatrix, NodeGroup } from '@/types/network';
import { Pencil, Check, X, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GROUP_COLORS = [
  '#FF6384', // Pink
  '#36A2EB', // Blue
  '#FFCE56', // Yellow
  '#4BC0C0', // Teal
  '#9966FF', // Purple
  '#FF9F40'  // Orange
];

const DEFAULT_CONFIG: NetworkSimulationConfig = {
  width: 800,
  height: 600,
  nodeRadius: 40
};

const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  nodes: initialNodes = [], 
  links: initialLinks = [], 
  config = DEFAULT_CONFIG 
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes.length > 0 ? initialNodes : [
    { id: '1', name: 'Web Server', x: 200, y: 150, type: 'server' },
    { id: '2', name: 'Database', x: 600, y: 150, type: 'server' },
    { id: '3', name: 'Router', x: 400, y: 400, type: 'router' },
    { id: '4', name: 'Client 1', x: 100, y: 300, type: 'workstation' },
    { id: '5', name: 'Client 2', x: 700, y: 300, type: 'workstation' }
  ]); 
  const [links, setLinks] = useState<Link[]>(initialLinks.length > 0 ? initialLinks : [
    { source: '1', target: '3' },
    { source: '2', target: '3' },
    { source: '4', target: '1' },
    { source: '5', target: '2' },
    { source: '3', target: '4' },
    { source: '3', target: '5' }
  ]);
  const [groups, setGroups] = useState<NodeGroup[]>([
    { id: 'server', name: 'Servers', color: '#36A2EB' },
    { id: 'workstation', name: 'Clients', color: '#FF6384' },
    { id: 'router', name: 'Network', color: '#4BC0C0' }
  ]);
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newNodeType, setNewNodeType] = useState<string>('workstation');
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'groups'>('graph');

  const handleAddNode = () => {
    if (!newNodeName.trim()) {
      showToast.error('Node name cannot be empty');
      return;
    }

    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      name: newNodeName.trim(),
      x: DEFAULT_CONFIG.width / 2,
      y: DEFAULT_CONFIG.height / 2,
      type: newNodeType
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setNewNodeName('');
    showToast.success(`New node added: ${newNode.name}`);
  };

  const renderLinks = () => {
    return links.map((link, index) => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);

      if (!sourceNode || !targetNode) return null;

      return (
        <line 
          key={`link-${index}`}
          x1={sourceNode.x}
          y1={sourceNode.y}
          x2={targetNode.x}
          y2={targetNode.y}
          stroke="#999"
          strokeWidth={3}
          strokeOpacity={0.6}
        />
      );
    }).filter(Boolean);
  };

  const renderNodes = () => {
    return nodes.map((node) => {
      const group = groups.find(g => g.id === node.type);
      const fillColor = group ? group.color : '#36A2EB';

      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <circle
            r={DEFAULT_CONFIG.nodeRadius}
            fill={fillColor}
            fillOpacity={0.8}
            stroke="#333"
            strokeWidth={2}
            className="cursor-pointer"
          />
          <text 
            x={0} 
            y={0} 
            textAnchor="middle" 
            alignmentBaseline="middle"
            className="text-sm font-bold fill-white pointer-events-none"
          >
            {node.name}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="network-graph-container space-y-4">
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={viewMode === 'graph' ? 'default' : 'outline'}
          onClick={() => setViewMode('graph')}
        >
          Graph View
        </Button>
        <Button 
          variant={viewMode === 'matrix' ? 'default' : 'outline'}
          onClick={() => setViewMode('matrix')}
        >
          Matrix View
        </Button>
        <Button 
          variant={viewMode === 'groups' ? 'default' : 'outline'}
          onClick={() => setViewMode('groups')}
        >
          Groups
        </Button>
      </div>

      {viewMode === 'graph' && (
        <div className="w-full border rounded">
          <svg 
            width="100%" 
            height={DEFAULT_CONFIG.height}
            viewBox={`0 0 ${DEFAULT_CONFIG.width} ${DEFAULT_CONFIG.height}`}
          >
            {renderLinks()}
            {renderNodes()}
          </svg>
        </div>
      )}

      {viewMode === 'groups' && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter new node name" 
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
            />
            <Select 
              value={newNodeType} 
              onValueChange={setNewNodeType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Node Type" />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddNode}>Add Node</Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {groups.map(group => (
              <div 
                key={group.id} 
                className="border rounded p-2 flex items-center space-x-2"
              >
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{backgroundColor: group.color}}
                />
                <span>{group.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;