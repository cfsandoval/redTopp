"use client";

import React, { useState, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { showToast } from "@/utils/toast";
import { Node, Link, NetworkSimulationConfig, NetworkGraphProps, AdjacencyMatrix } from '@/types/network';

const defaultConfig: NetworkSimulationConfig = {
  width: 800,
  height: 600,
  nodeRadius: 20
};

const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  nodes: initialNodes = [], 
  links: initialLinks = [], 
  config = defaultConfig 
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'import'>('graph');
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [matrixInput, setMatrixInput] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  const [adjacencyMatrix, setAdjacencyMatrix] = useState<AdjacencyMatrix>(() => 
    generateAdjacencyMatrix()
  );

  // Generate Adjacency Matrix
  function generateAdjacencyMatrix(): AdjacencyMatrix {
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
  }

  // Node Editing Functions
  const handleEditNode = (node: Node) => {
    setEditingNode(node);
    setIsEditModalOpen(true);
  };

  const handleUpdateNode = (updatedNode: Node) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === updatedNode.id ? updatedNode : node
      )
    );
    setIsEditModalOpen(false);
  };

  const handleAddNode = () => {
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      name: `Node ${nodes.length + 1}`,
      x: defaultConfig.width / 2,
      y: defaultConfig.height / 2,
      type: 'workstation'
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
  };

  const renderNodeEditModal = () => {
    if (!editingNode) return null;

    return (
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label>Name</label>
              <Input 
                value={editingNode.name} 
                onChange={(e) => setEditingNode(prev => 
                  prev ? {...prev, name: e.target.value} : null
                )}
              />
            </div>
            <div>
              <label>Type</label>
              <Input 
                value={editingNode.type || ''} 
                onChange={(e) => setEditingNode(prev => 
                  prev ? {...prev, type: e.target.value} : null
                )}
              />
            </div>
            <Button onClick={() => editingNode && handleUpdateNode(editingNode)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Merge provided config with default config
  const mergedConfig: NetworkSimulationConfig = {
    ...defaultConfig,
    ...config
  };

  // Ensure nodes have x and y coordinates
  const processedNodes = nodes.map((node, index) => ({
    ...node,
    x: node.x ?? (mergedConfig.width / (nodes.length + 1)) * (index + 1),
    y: node.y ?? (mergedConfig.height / 2)
  }));

  const renderLinks = () => {
    return links.map((link, index) => {
      const sourceNode = processedNodes.find(n => n.id === link.source);
      const targetNode = processedNodes.find(n => n.id === link.target);

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

  const renderNodes = () => {
    return processedNodes.map((node) => (
      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <circle
                r={mergedConfig.nodeRadius}
                className="cursor-pointer fill-blue-500"
                onClick={() => handleEditNode(node)}
              />
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="flex flex-col">
                <span className="font-bold">{node.name}</span>
                <span className="text-sm text-muted-foreground">{node.type || 'Unknown Type'}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <text 
          x={0} 
          y={mergedConfig.nodeRadius + 15} 
          textAnchor="middle" 
          className="text-xs"
        >
          {node.name}
        </text>
      </g>
    ));
  };

  const renderMatrixView = () => {
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              {adjacencyMatrix.nodeNames.map((name, index) => (
                <TableHead key={index}>{name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjacencyMatrix.matrix.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{adjacencyMatrix.nodeNames[rowIndex]}</TableCell>
                {row.map((cell, colIndex) => (
                  <TableCell key={colIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
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
        <Button onClick={handleAddNode}>
          Add Node
        </Button>
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

      {viewMode === 'matrix' && renderMatrixView()}

      {renderNodeEditModal()}
    </div>
  );
};

export default NetworkGraph;