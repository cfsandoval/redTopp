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
import { Textarea } from "@/components/ui/textarea";
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
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'import'>('graph');
  const [matrixInput, setMatrixInput] = useState<string>('');
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

  // Move renderLinks and renderNodes inside the component
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

  // Rest of the component remains the same...

  return (
    <div className="network-graph-container space-y-4">
      {/* Other view mode buttons */}
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
      {/* Rest of the component */}
    </div>
  );
};

export default NetworkGraph;