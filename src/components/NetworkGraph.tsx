"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Node, Link, NetworkSimulationConfig, NetworkGraphProps } from '@/types/network';

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
  const svgRef = useRef<SVGSVGElement>(null);

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

  const handleNodeClick = (node: Node) => {
    console.log('Node clicked:', node);
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
                onClick={() => handleNodeClick(node)}
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
      <svg 
        ref={svgRef}
        width="100%" 
        height={mergedConfig.height}
        viewBox={`0 0 ${mergedConfig.width} ${mergedConfig.height}`}
        className="border rounded"
      >
        {renderLinks()}
        {renderNodes()}
      </svg>
    </div>
  );
};

export default NetworkGraph;