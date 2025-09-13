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
import { Node, Link, NetworkSimulationConfig, NetworkGraphProps, AdjacencyMatrix } from '@/types/network';
import { Pencil, Check, X } from 'lucide-react';

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
  const [adjacencyMatrix, setAdjacencyMatrix] = useState<AdjacencyMatrix>(() => 
    generateAdjacencyMatrix()
  );
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editNodeName, setEditNodeName] = useState<string>('');

  // Regenerate adjacency matrix when nodes or links change
  useEffect(() => {
    setAdjacencyMatrix(generateAdjacencyMatrix());
  }, [nodes, links]);

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

  // Render Links
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

  // Render Nodes
  const renderNodes = () => {
    return processedNodes.map((node) => (
      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
        <circle
          r={mergedConfig.nodeRadius}
          className="cursor-pointer fill-blue-500"
        />
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

  // Add New Node Handler
  const handleAddNode = () => {
    if (!newNodeName.trim()) {
      showToast.error('Node name cannot be empty');
      return;
    }

    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      name: newNodeName.trim(),
      x: defaultConfig.width / 2,
      y: defaultConfig.height / 2,
      type: 'workstation'
    };

    // Expand adjacency matrix
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setNewNodeName(''); // Reset input
    showToast.success(`New node added: ${newNode.name}`);
  };

  // Edit Node Name Handler
  const startEditingNode = (node: Node) => {
    setEditingNodeId(node.id);
    setEditNodeName(node.name);
  };

  // Save Node Name
  const saveNodeName = () => {
    if (!editNodeName.trim()) {
      showToast.error('Node name cannot be empty');
      return;
    }

    const updatedNodes = nodes.map(node => 
      node.id === editingNodeId 
        ? { ...node, name: editNodeName.trim() } 
        : node
    );

    setNodes(updatedNodes);
    setEditingNodeId(null);
    showToast.success('Node name updated successfully');
  };

  // Cancel Node Name Editing
  const cancelEditNodeName = () => {
    setEditingNodeId(null);
  };

  // Edit Matrix Cell (Add/Remove Connection)
  const handleMatrixCellClick = (rowIndex: number, colIndex: number) => {
    const updatedLinks = [...links];
    const sourceNode = nodes[rowIndex];
    const targetNode = nodes[colIndex];

    // Prevent self-linking
    if (sourceNode.id === targetNode.id) {
      showToast.error('Cannot create self-link');
      return;
    }

    // Check if link already exists
    const existingLinkIndex = links.findIndex(
      link => link.source === sourceNode.id && link.target === targetNode.id
    );

    if (existingLinkIndex !== -1) {
      // Remove existing link
      updatedLinks.splice(existingLinkIndex, 1);
      showToast.info(`Link removed between ${sourceNode.name} and ${targetNode.name}`);
    } else {
      // Add new link
      updatedLinks.push({
        source: sourceNode.id,
        target: targetNode.id
      });
      showToast.success(`Link added between ${sourceNode.name} and ${targetNode.name}`);
    }

    setLinks(updatedLinks);
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
        <Button onClick={handleAddNode}>Add Node</Button>
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
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter new node name" 
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
            />
            <Button onClick={handleAddNode}>Add Node</Button>
          </div>
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
                  <TableCell className="flex items-center space-x-2">
                    {editingNodeId === nodes[rowIndex].id ? (
                      <>
                        <Input 
                          value={editNodeName}
                          onChange={(e) => setEditNodeName(e.target.value)}
                          className="w-full"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={saveNodeName}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={cancelEditNodeName}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span>{adjacencyMatrix.nodeNames[rowIndex]}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => startEditingNode(nodes[rowIndex])}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                  {row.map((value, colIndex) => (
                    <TableCell 
                      key={colIndex} 
                      onClick={() => handleMatrixCellClick(rowIndex, colIndex)}
                      className={`
                        cursor-pointer 
                        ${value === 1 ? 'bg-green-100' : 'bg-gray-100'}
                        hover:bg-blue-100
                        text-center
                      `}
                    >
                      {value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;