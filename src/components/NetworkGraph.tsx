"use client";

import React, { useState } from 'react';
import * as d3 from 'd3';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Node, Link, NetworkSimulationConfig, NetworkGraphProps, AdjacencyMatrix } from '@/types/network';

const defaultConfig: NetworkSimulationConfig = {
  width: 800,
  height: 600,
  nodeRadius: 20
};

const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  nodes = [], 
  links = [], 
  config = defaultConfig 
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'matrix'>('graph');

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
        // Uncomment the line below for undirected graph
        // matrix[targetIndex][sourceIndex] = 1;
      }
    });

    return { matrix, nodeNames };
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

  const getNodeColor = (node: Node): string => {
    switch(node.type) {
      case 'server': return 'fill-blue-500';
      case 'workstation': return 'fill-green-500';
      case 'router': return 'fill-red-500';
      default: return 'fill-gray-500';
    }
  };

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
                className={`cursor-pointer ${getNodeColor(node)}`}
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

  const renderAdjacencyMatrix = () => {
    const { matrix, nodeNames } = generateAdjacencyMatrix();

    return (
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Node</TableHead>
              {nodeNames.map((name, index) => (
                <TableHead key={index}>{name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrix.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="font-medium">{nodeNames[rowIndex]}</TableCell>
                {row.map((cell, colIndex) => (
                  <TableCell 
                    key={colIndex} 
                    className={cell ? 'bg-green-100' : 'bg-gray-100'}
                  >
                    {cell}
                  </TableCell>
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
      <div className="flex justify-center mb-4">
        <Button 
          variant={viewMode === 'graph' ? 'default' : 'outline'}
          onClick={() => setViewMode('graph')}
          className="mr-2"
        >
          Network Graph
        </Button>
        <Button 
          variant={viewMode === 'matrix' ? 'default' : 'outline'}
          onClick={() => setViewMode('matrix')}
        >
          Adjacency Matrix
        </Button>
      </div>

      {viewMode === 'graph' ? (
        <svg 
          width="100%" 
          height={mergedConfig.height}
          viewBox={`0 0 ${mergedConfig.width} ${mergedConfig.height}`}
          className="border rounded"
        >
          {renderLinks()}
          {renderNodes()}
        </svg>
      ) : (
        renderAdjacencyMatrix()
      )}
    </div>
  );
};

export default NetworkGraph;