"use client";

import React, { useState } from 'react';
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
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'groups'>('matrix');
  const [newNodeName, setNewNodeName] = useState<string>('');

  // Generar Matriz de Adyacencia
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

  // Manejar clic en celda de matriz
  const handleMatrixCellClick = (rowIndex: number, colIndex: number) => {
    // Evitar autoenlace
    if (rowIndex === colIndex) {
      showToast.error('Cannot create self-link');
      return;
    }

    const sourceNode = nodes[rowIndex];
    const targetNode = nodes[colIndex];

    // Verificar si el enlace ya existe
    const existingLinkIndex = links.findIndex(
      link => link.source === sourceNode.id && link.target === targetNode.id
    );

    const updatedLinks = [...links];

    if (existingLinkIndex !== -1) {
      // Eliminar enlace existente
      updatedLinks.splice(existingLinkIndex, 1);
      showToast.info(`Link removed between ${sourceNode.name} and ${targetNode.name}`);
    } else {
      // Agregar nuevo enlace
      updatedLinks.push({
        source: sourceNode.id,
        target: targetNode.id
      });
      showToast.success(`Link added between ${sourceNode.name} and ${targetNode.name}`);
    }

    setLinks(updatedLinks);
  };

  // Agregar nuevo nodo
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
      type: 'workstation'
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setNewNodeName('');
    showToast.success(`New node added: ${newNode.name}`);
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

      {viewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="flex space-x-2 mb-4">
            <Input 
              placeholder="Enter new node name" 
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleAddNode}>Add Node</Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Nodes</TableHead>
                  {generateAdjacencyMatrix().nodeNames.map((name, index) => (
                    <TableHead key={index} className="text-center">{name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {generateAdjacencyMatrix().matrix.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="font-medium">
                      {generateAdjacencyMatrix().nodeNames[rowIndex]}
                    </TableCell>
                    {row.map((value, colIndex) => (
                      <TableCell 
                        key={colIndex} 
                        onClick={() => handleMatrixCellClick(rowIndex, colIndex)}
                        className={`
                          text-center 
                          cursor-pointer 
                          ${value === 1 ? 'bg-green-100' : 'bg-gray-100'}
                          hover:bg-blue-100
                          ${rowIndex === colIndex ? 'bg-gray-200 cursor-not-allowed' : ''}
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
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;