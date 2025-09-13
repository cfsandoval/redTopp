"use client";

import React, { useState, useEffect, useMemo } from 'react';
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

const DEFAULT_CONFIG: NetworkSimulationConfig = {
  width: 800,
  height: 600,
  nodeRadius: 20
};

const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  nodes: initialNodes = [], 
  links: initialLinks = [], 
  config = DEFAULT_CONFIG 
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'groups'>('graph');
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [groups, setGroups] = useState<NodeGroup[]>([]);
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newNodeGroup, setNewNodeGroup] = useState<string>('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editNodeName, setEditNodeName] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState<string>('');

  // Merge provided config with default config
  const mergedConfig: NetworkSimulationConfig = {
    ...DEFAULT_CONFIG,
    ...config
  };

  // Render Nodes
  const renderNodes = () => {
    return nodes.map((node) => {
      const group = groups.find(g => g.id === node.group);
      const fillColor = group ? group.color : '#36A2EB';

      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <circle
            r={mergedConfig.nodeRadius}
            fill={fillColor}
            className="cursor-pointer"
          />
          <text 
            x={0} 
            y={mergedConfig.nodeRadius + 15} 
            textAnchor="middle" 
            className="text-xs"
          >
            {node.name}
          </text>
          {node.influence !== undefined && node.dependence !== undefined && (
            <text 
              x={0} 
              y={mergedConfig.nodeRadius + 30} 
              textAnchor="middle" 
              className="text-xs text-gray-500"
            >
              I: {node.influence}, D: {node.dependence}
            </text>
          )}
        </g>
      );
    });
  };

  // Rest of the component remains the same...

  return (
    <div className="network-graph-container space-y-4">
      {/* ... (previous code) */}

      {viewMode === 'graph' && (
        <svg 
          width="100%" 
          height={mergedConfig.height}
          viewBox={`0 0 ${mergedConfig.width} ${mergedConfig.height}`}
          className="border rounded"
        >
          {renderLinks()}
          {renderNodes()}
        </svg>
      )}

      {/* ... (rest of the component) */}
    </div>
  );
};

export default NetworkGraph;