"use client";

import React, { useState, useCallback, useEffect } from 'react';
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
  const [adjacencyMatrix, setAdjacencyMatrix] = useState<AdjacencyMatrix>(() => 
    generateAdjacencyMatrix()
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [newNodeName, setNewNodeName] = useState<string>('');

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

  // Edit Matrix Cell (Add/Remove Connection)
  const handleMatrixCellClick = (rowIndex: number, colIndex: number) => {
    const updatedLinks = [...links];
    const sourceNode = nodes[rowIndex];
    const targetNode = nodes[colIndex];

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
      </div>

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
                  <TableCell>{adjacencyMatrix.nodeNames[rowIndex]}</TableCell>
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

      {/* Resto del código anterior se mantiene igual */}
    </div>
  );
};

export default NetworkGraph;