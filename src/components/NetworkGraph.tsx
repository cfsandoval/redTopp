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

const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  nodes, 
  links, 
  config 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

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
    return links.map((link, index) => (
      <line 
        key={`link-${index}`}
        x1={nodes.find(n => n.id === link.source)?.x}
        y1={nodes.find(n => n.id === link.source)?.y}
        x2={nodes.find(n => n.id === link.target)?.x}
        y2={nodes.find(n => n.id === link.target)?.y}
        stroke="gray"
        strokeWidth={2}
      />
    ));
  };

  const renderNodes = () => {
    return nodes.map((node, index) => (
      <TooltipProvider key={node.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <circle
              cx={node.x}
              cy={node.y}
              r={config.nodeRadius || 10}
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
        {/* Placeholder for network configuration rendering */}
        <p>Network Configuration</p>
      </div>
    );
  };

  return (
    <div className="network-graph-container space-y-4">
      <svg 
        ref={svgRef}
        width="100%" 
        height={config.height || 600}
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