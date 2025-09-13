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
  nodeRadius: 10
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

  const getNodeColor = (node: Node): string => {
    switch(node.type) {
      case 'server': return 'blue';
      case 'workstation': return 'green';
      case 'router': return 'red';
      default: return 'gray';
    }
  };

  const handleNodeClick = (node: Node) => {
    console.log('Node clicked:', node);
    // Add any specific node click logic here
  };

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

  const renderNodes = () => {
    return nodes.map((node) => (
      <TooltipProvider key={node.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <circle
              cx={node.x}
              cy={node.y}
              r={mergedConfig.nodeRadius}
              fill={getNodeColor(node)}
              className="cursor-pointer"
              onClick={() => handleNodeClick(node)}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{node.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ));
  };

  const renderNetworkConfigurations = () => {
    return (
      <div className="network-config">
        <p>Network Configuration</p>
        <ul>
          <li>Width: {mergedConfig.width}px</li>
          <li>Height: {mergedConfig.height}px</li>
          <li>Node Radius: {mergedConfig.nodeRadius}px</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="network-graph-container space-y-4">
      <svg 
        ref={svgRef}
        width="100%" 
        height={mergedConfig.height}
        className="border rounded"
      >
        {renderLinks()}
        {renderNodes()}
      </svg>
      {renderNetworkConfigurations()}
    </div>
  );
};

export default NetworkGraph;