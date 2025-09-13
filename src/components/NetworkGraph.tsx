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

  // Render Links
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
          stroke="gray"
          strokeWidth={2}
        />
      );
    }).filter(Boolean);
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

  // Generate Adjacency Matrix
  const generateAdjacencyMatrix = (): AdjacencyMatrix => {
    const nodeNames = nodes.map(node => node.name);
    const matrix = Array(nodes.length).fill(null).map(() => 
      Array(nodes.length).fill(0)
    );

    links.forEach(link => {
      const sourceIndex = nodes.findIndex(node => node.id === link.source);
      const targetIndex = nodes.findIndex(node => node.id === link.target);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        matrix[sourceIndex][targetIndex] = 1;
      }
    });

    return { matrix, nodeNames };
  };

  // Calcular influencia y dependencia
  const calculateNetworkMetrics = () => {
    const adjacencyMatrix = generateAdjacencyMatrix();
    const nodeInfluence: {[key: string]: number} = {};
    const nodeDependence: {[key: string]: number} = {};

    nodes.forEach((node, rowIndex) => {
      // Influencia: número de nodos a los que está conectado
      const outgoingConnections = adjacencyMatrix.matrix[rowIndex].filter(val => val === 1).length;
      
      // Dependencia: número de nodos que están conectados a este
      const incomingConnections = adjacencyMatrix.matrix.filter(row => row[rowIndex] === 1).length;

      nodeInfluence[node.id] = outgoingConnections;
      nodeDependence[node.id] = incomingConnections;
    });

    // Actualizar nodos con métricas
    const updatedNodes = nodes.map(node => ({
      ...node,
      influence: nodeInfluence[node.id],
      dependence: nodeDependence[node.id]
    }));

    setNodes(updatedNodes);
    showToast.success('Network metrics calculated');
  };

  // Resto de métodos anteriores...

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
        <Button onClick={calculateNetworkMetrics}>Calculate Metrics</Button>
      </div>

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

      {/* Resto de vistas... */}
    </div>
  );
};

export default NetworkGraph;