"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { 
  Card as ShadcnCard, 
  CardContent as ShadcnCardContent, 
  CardHeader as ShadcnCardHeader, 
  CardTitle as ShadcnCardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { 
  Settings, Cpu, Radiation, Shield, Play, Pause, BarChart2, Network, 
  AlertTriangle, Layers, Lock, Unlock, Info, Zap, TrendingUp, TrendingDown
} from 'lucide-react';
import * as d3 from 'd3';

// Enhanced type definitions with more detailed properties
interface NetworkNode {
  id: string;
  status: 'active' | 'failed' | 'recovering' | 'compromised';
  type: 'server' | 'router' | 'endpoint' | 'firewall';
  connections: string[];
  x?: number;
  y?: number;
  vulnerabilityScore: number;
  securityLevel: number;
  trafficVolume: number;
  lastCompromiseTime?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  status: 'healthy' | 'degraded' | 'blocked';
  bandwidth: number;
  latency: number;
}

interface NetworkSimulationConfig {
  simulationSpeed: number;
  failureProbability: number;
  recoveryRate: number;
  attackSimulation: boolean;
  nodeFailureMode: 'random' | 'targeted' | 'cascading';
  networkStressLevel: number;
}

interface SimulationMetrics {
  totalNodes: number;
  activeNodes: number;
  failedNodes: number;
  compromisedNodes: number;
  networkStability: number;
  responseTime: number;
  securityBreachRisk: number;
  trafficVolume: number;
}

// Utility function for generating unique node IDs
const generateNodeId = (() => {
  let counter = 0;
  return () => `node-${counter++}`;
})();

const NetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [networkLinks, setNetworkLinks] = useState<NetworkLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  const [simulationConfig, setSimulationConfig] = useState<NetworkSimulationConfig>({
    simulationSpeed: 5,
    failureProbability: 0.1,
    recoveryRate: 0.2,
    attackSimulation: false,
    nodeFailureMode: 'random',
    networkStressLevel: 50
  });

  const [simulationMetrics, setSimulationMetrics] = useState<SimulationMetrics>({
    totalNodes: 50,
    activeNodes: 50,
    failedNodes: 0,
    compromisedNodes: 0,
    networkStability: 100,
    responseTime: 10,
    securityBreachRisk: 0,
    trafficVolume: 0
  });

  // Advanced network topology generation with more intelligent connections
  const generateNetworkTopology = useCallback(() => {
    const nodeTypes: NetworkNode['type'][] = ['server', 'router', 'endpoint', 'firewall'];
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];

    // Generate nodes with sophisticated characteristics
    for (let i = 0; i < simulationConfig.networkStressLevel; i++) {
      const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      const node: NetworkNode = {
        id: generateNodeId(),
        status: 'active',
        type: nodeType,
        connections: [],
        vulnerabilityScore: Math.random() * 10,
        securityLevel: Math.floor(Math.random() * 10),
        trafficVolume: Math.random() * 100
      };
      nodes.push(node);
    }

    // Create intelligent, weighted connections
    nodes.forEach((node, index) => {
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== index) {
          const link: NetworkLink = {
            source: node.id,
            target: nodes[targetIndex].id,
            status: 'healthy',
            bandwidth: Math.random() * 100,
            latency: Math.random() * 50
          };
          links.push(link);
          node.connections.push(nodes[targetIndex].id);
        }
      }
    });

    setNetworkNodes(nodes);
    setNetworkLinks(links);
  }, [simulationConfig.networkStressLevel]);

  // Advanced simulation logic with complex attack and recovery mechanisms
  const runNetworkSimulation = useCallback(() => {
    const currentTime = Date.now();

    const updatedNodes: NetworkNode[] = networkNodes.map(node => {
      // More sophisticated failure probability calculation
      const failureProbability = 
        simulationConfig.failureProbability * 
        (1 + (10 - node.securityLevel) / 10) * 
        (1 + node.vulnerabilityScore / 10);

      // Advanced attack simulation with temporal dynamics
      if (Math.random() < failureProbability) {
        if (simulationConfig.attackSimulation && Math.random() < 0.3) {
          return { 
            ...node, 
            status: 'compromised' as const,
            vulnerabilityScore: Math.min(10, node.vulnerabilityScore + 2),
            lastCompromiseTime: currentTime,
            trafficVolume: node.trafficVolume * 1.5 // Increased traffic during compromise
          };
        }
        return { 
          ...node, 
          status: 'failed' as const,
          securityLevel: Math.max(0, node.securityLevel - 1),
          trafficVolume: node.trafficVolume * 0.5 // Reduced traffic when failed
        };
      }

      // Recovery mechanism with security improvement
      if (node.status !== 'active') {
        const recoveryChance = 
          simulationConfig.recoveryRate * 
          (node.status === 'compromised' ? 0.5 : 1); // Harder to recover from compromise

        if (Math.random() < recoveryChance) {
          return { 
            ...node, 
            status: 'active' as const,
            securityLevel: Math.min(10, node.securityLevel + 1),
            trafficVolume: node.trafficVolume * 1.2 // Increased traffic on recovery
          };
        }
      }

      return node;
    });

    // Update network links based on node status and traffic
    const updatedLinks: NetworkLink[] = networkLinks.map(link => {
      const sourceNode = updatedNodes.find(n => n.id === link.source);
      const targetNode = updatedNodes.find(n => n.id === link.target);

      if (!sourceNode || !targetNode || 
          sourceNode.status !== 'active' || 
          targetNode.status !== 'active') {
        return { 
          ...link, 
          status: 'degraded',
          bandwidth: link.bandwidth * 0.5,
          latency: link.latency * 2
        };
      }

      return link;
    });

    // Comprehensive metrics calculation
    const activeNodes = updatedNodes.filter(n => n.status === 'active').length;
    const failedNodes = updatedNodes.filter(n => n.status === 'failed').length;
    const compromisedNodes = updatedNodes.filter(n => n.status === 'compromised').length;
    const totalTrafficVolume = updatedNodes.reduce((sum, node) => sum + node.trafficVolume, 0);

    setNetworkNodes(updatedNodes);
    setNetworkLinks(updatedLinks);
    setSimulationMetrics(prev => ({
      ...prev,
      activeNodes,
      failedNodes,
      compromisedNodes,
      networkStability: (activeNodes / prev.totalNodes) * 100,
      securityBreachRisk: (compromisedNodes / prev.totalNodes) * 100,
      responseTime: Math.max(10, 10 * (1 - activeNodes / prev.totalNodes)),
      trafficVolume: totalTrafficVolume
    }));
  }, [networkNodes, networkLinks, simulationConfig]);

  // Render method with enhanced UI and interaction
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <ShadcnCard className="p-6 shadow-lg">
        <ShadcnCardHeader className="flex flex-row items-center justify-between">
          <ShadcnCardTitle className="flex items-center">
            <Network className="h-6 w-6 mr-2" /> 
            Network Simulation Dashboard
          </ShadcnCardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsConfigModalOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" /> Configure
            </Button>
            <Button 
              variant={simulationRunning ? "destructive" : "default"}
              onClick={() => setSimulationRunning(!simulationRunning)}
            >
              {simulationRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" /> Start
                </>
              )}
            </Button>
          </div>
        </ShadcnCardHeader>

        <ShadcnCardContent>
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-green-50 p-3 rounded-lg flex items-center cursor-help">
                    <Cpu className="h-6 w-6 mr-2 text-green-600" />
                    <div>
                      <h4 className="font-bold">Active Nodes</h4>
                      <p>{simulationMetrics.activeNodes} / {simulationMetrics.totalNodes}</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Nodes currently operational and healthy
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Similar tooltips for other metrics */}
            {/* ... */}
          </div>

          {/* Network Graph SVG */}
          <svg 
            ref={svgRef} 
            width="800" 
            height="400" 
            className="w-full border rounded"
          />

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              <div>
                <h4 className="font-bold">Network Stability</h4>
                <div className="flex items-center">
                  <p>{simulationMetrics.networkStability.toFixed(2)}%</p>
                  {simulationMetrics.networkStability > 90 ? (
                    <TrendingUp className="h-4 w-4 ml-2 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 ml-2 text-red-600" />
                  )}
                </div>
              </div>
            </div>
            {/* Similar dynamic trend indicators for other metrics */}
          </div>
        </ShadcnCardContent>
      </ShadcnCard>

      {/* Configuration Modal */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Network Simulation Configuration</DialogTitle>
            <DialogDescription>
              Fine-tune simulation parameters for advanced network modeling
            </DialogDescription>
          </DialogHeader>
          
          {/* Configuration sliders and switches */}
          {/* ... */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NetworkGraph;