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
  const [adjacencyMatrix, setAdjacencyMatrix] = useState<AdjacencyMatrix>(() => 
    generateAdjacencyMatrix()
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

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

  // Edit Node Handler
  const handleEditNode = (node: Node) => {
    setEditingNode(node);
    setIsEditModalOpen(true);
  };

  // Update Node Handler
  const updateNode = () => {
    if (editingNode) {
      const updatedNodes = nodes.map(node => 
        node.id === editingNode.id ? editingNode : node
      );
      setNodes(updatedNodes);
      setIsEditModalOpen(false);
      showToast.success(`Node ${editingNode.name} updated successfully`);
    }
  };

  // Add New Node Handler
  const handleAddNode = () => {
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      name: `Node ${nodes.length + 1}`,
      x: defaultConfig.width / 2,
      y: defaultConfig.height / 2,
      type: 'workstation'
    };
    setNodes([...nodes, newNode]);
    showToast.success(`New node added: ${newNode.name}`);
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

      {viewMode === 'matrix' && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Node</TableHead>
              {adjacencyMatrix.nodeNames.map((name, index) => (
                <TableHead key={index}>{name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjacencyMatrix.matrix.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{adjacencyMatrix.nodeNames[rowIndex]}</TableCell>
                {row.map((value, colIndex) => (
                  <TableCell key={colIndex}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Node Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
          </DialogHeader>
          {editingNode && (
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Name</label>
                <Input 
                  value={editingNode.name}
                  onChange={(e) => setEditingNode({
                    ...editingNode, 
                    name: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block mb-2">Type</label>
                <Input 
                  value={editingNode.type || ''}
                  onChange={(e) => setEditingNode({
                    ...editingNode, 
                    type: e.target.value
                  })}
                />
              </div>
              <Button onClick={updateNode}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NetworkGraph;