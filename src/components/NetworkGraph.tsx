"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { toast } from "sonner";
import { 
  Settings, Cpu, Radiation, Shield, Play, Pause, BarChart2, Network, 
  AlertTriangle, Layers, Lock, Unlock
} from 'lucide-react';
import * as d3 from 'd3';

// Enhanced type definitions
interface NetworkNode {
  id: string;
  status: 'active' | 'failed' | 'recovering' | 'compromised';
  type: 'server' | 'router' | 'endpoint' | 'firewall';
  connections: string[];
  x?: number;
  y?: number;
  vulnerabilityScore: number;
  securityLevel: number;
}

interface NetworkLink {
  source: string;
  target: string;
  status: 'healthy' | 'degraded' | 'blocked';
  bandwidth: number;
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
}

const NetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [networkLinks, setNetworkLinks] = useState<NetworkLink[]>([]);

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
    securityBreachRisk: 0
  });

  // Advanced network topology generation
  const generateNetworkTopology = useCallback(() => {
    const nodeTypes: NetworkNode['type'][] = ['server', 'router', 'endpoint', 'firewall'];
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];

    // Generate nodes with more complex characteristics
    for (let i = 0; i < simulationConfig.networkStressLevel; i++) {
      const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      const node: NetworkNode = {
        id: `node-${i}`,
        status: 'active',
        type: nodeType,
        connections: [],
        vulnerabilityScore: Math.random() * 10,
        securityLevel: Math.floor(Math.random() * 10)
      };
      nodes.push(node);
    }

    // Create more intelligent connections
    nodes.forEach((node, index) => {
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== index) {
          const link: NetworkLink = {
            source: node.id,
            target: nodes[targetIndex].id,
            status: 'healthy',
            bandwidth: Math.random() * 100
          };
          links.push(link);
          node.connections.push(nodes[targetIndex].id);
        }
      }
    });

    setNetworkNodes(nodes);
    setNetworkLinks(links);
  }, [simulationConfig.networkStressLevel]);

  // Advanced simulation logic with more complex failure mechanisms
  const runNetworkSimulation = useCallback(() => {
    const updatedNodes: NetworkNode[] = networkNodes.map(node => {
      // More sophisticated failure probability based on node characteristics
      const failureProbability = 
        simulationConfig.failureProbability * 
        (1 + (10 - node.securityLevel) / 10) * 
        (1 + node.vulnerabilityScore / 10);

      if (Math.random() < failureProbability) {
        // Advanced attack simulation
        if (simulationConfig.attackSimulation && Math.random() < 0.3) {
          return { 
            ...node, 
            status: 'compromised' as const,
            vulnerabilityScore: Math.min(10, node.vulnerabilityScore + 2)
          };
        }
        return { 
          ...node, 
          status: 'failed' as const,
          securityLevel: Math.max(0, node.securityLevel - 1)
        };
      }

      // Recovery mechanism with security improvement
      if (node.status !== 'active' && Math.random() < simulationConfig.recoveryRate) {
        return { 
          ...node, 
          status: 'active' as const,
          securityLevel: Math.min(10, node.securityLevel + 1)
        };
      }

      return node;
    });

    // Update network links based on node status
    const updatedLinks: NetworkLink[] = networkLinks.map(link => {
      const sourceNode = updatedNodes.find(n => n.id === link.source);
      const targetNode = updatedNodes.find(n => n.id === link.target);

      if (!sourceNode || !targetNode || 
          sourceNode.status !== 'active' || 
          targetNode.status !== 'active') {
        return { ...link, status: 'degraded' };
      }

      return link;
    });

    // Update metrics with more nuanced calculations
    const activeNodes = updatedNodes.filter(n => n.status === 'active').length;
    const failedNodes = updatedNodes.filter(n => n.status === 'failed').length;
    const compromisedNodes = updatedNodes.filter(n => n.status === 'compromised').length;

    setNetworkNodes(updatedNodes);
    setNetworkLinks(updatedLinks);
    setSimulationMetrics(prev => ({
      ...prev,
      activeNodes,
      failedNodes,
      compromisedNodes,
      networkStability: (activeNodes / prev.totalNodes) * 100,
      securityBreachRisk: (compromisedNodes / prev.totalNodes) * 100,
      responseTime: Math.max(10, 10 * (1 - activeNodes / prev.totalNodes))
    }));
  }, [networkNodes, networkLinks, simulationConfig]);

  // Enhanced D3 visualization with more detailed rendering
  const renderNetworkGraph = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;

    const simulation = d3.forceSimulation(networkNodes as any)
      .force("link", d3.forceLink(networkLinks).id((d: any) => d.id))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Links with varying thickness and color
    const links = svg.append("g")
      .selectAll("line")
      .data(networkLinks)
      .enter()
      .append("line")
      .attr("stroke", d => {
        switch(d.status) {
          case 'degraded': return "orange";
          case 'blocked': return "red";
          default: return "green";
        }
      })
      .attr("stroke-width", d => Math.max(1, d.bandwidth / 10));

    // Nodes with more detailed representation
    const nodes = svg.append("g")
      .selectAll("circle")
      .data(networkNodes)
      .enter()
      .append("circle")
      .attr("r", d => {
        // Node size based on security level and type
        const baseSize = 10;
        const typeModifier = {
          'server': 1.5,
          'router': 1.2,
          'firewall': 1.3,
          'endpoint': 1
        }[d.type];
        return baseSize * typeModifier * (1 + d.securityLevel / 10);
      })
      .attr("fill", d => {
        switch(d.status) {
          case 'failed': return "red";
          case 'compromised': return "purple";
          case 'recovering': return "yellow";
          default: return d.type === 'firewall' ? "blue" : "green";
        }
      });

    // Add node type icons or labels
    const nodeLabels = svg.append("g")
      .selectAll("text")
      .data(networkNodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("font-size", "8px")
      .text(d => d.type[0].toUpperCase());

    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      nodeLabels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });
  }, [networkNodes, networkLinks]);

  // Effect hooks for simulation and visualization
  useEffect(() => {
    generateNetworkTopology();
  }, [generateNetworkTopology]);

  useEffect(() => {
    renderNetworkGraph();
  }, [renderNetworkGraph]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (simulationRunning) {
      intervalId = setInterval(runNetworkSimulation, 1000 / simulationConfig.simulationSpeed);
    }
    return () => clearInterval(intervalId);
  }, [simulationRunning, runNetworkSimulation, simulationConfig.simulationSpeed]);

  // Render method with enhanced UI
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
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-3 rounded-lg flex items-center">
              <Cpu className="h-6 w-6 mr-2 text-green-600" />
              <div>
                <h4 className="font-bold">Active Nodes</h4>
                <p>{simulationMetrics.activeNodes} / {simulationMetrics.totalNodes}</p>
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg flex items-center">
              <Radiation className="h-6 w-6 mr-2 text-red-600" />
              <div>
                <h4 className="font-bold">Failed Nodes</h4>
                <p>{simulationMetrics.failedNodes}</p>
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-purple-600" />
              <div>
                <h4 className="font-bold">Compromised Nodes</h4>
                <p>{simulationMetrics.compromisedNodes}</p>
              </div>
            </div>
          </div>
          
          <svg ref={svgRef} width="800" height="400" className="w-full border rounded"></svg>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              <div>
                <h4 className="font-bold">Network Stability</h4>
                <p>{simulationMetrics.networkStability.toFixed(2)}%</p>
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg flex items-center">
              <Layers className="h-6 w-6 mr-2 text-orange-600" />
              <div>
                <h4 className="font-bold">Security Breach Risk</h4>
                <p>{simulationMetrics.securityBreachRisk.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </ShadcnCardContent>
      </ShadcnCard>

      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Network Simulation Configuration</DialogTitle>
            <DialogDescription>
              Adjust simulation parameters to model different network scenarios
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Simulation Speed</Label>
              <Slider 
                defaultValue={[simulationConfig.simulationSpeed]} 
                max={10} 
                step={1}
                onValueChange={(value) => setSimulationConfig(prev => ({
                  ...prev, 
                  simulationSpeed: value[0]
                }))}
              />
            </div>
            
            <div>
              <Label>Failure Probability</Label>
              <Slider 
                defaultValue={[simulationConfig.failureProbability * 100]} 
                max={100} 
                step={1}
                onValueChange={(value) => setSimulationConfig(prev => ({
                  ...prev, 
                  failureProbability: value[0] / 100
                }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                checked={simulationConfig.attackSimulation}
                onCheckedChange={(checked) => setSimulationConfig(prev => ({
                  ...prev,
                  attackSimulation: checked
                }))}
              />
              <Label>Enable Attack Simulation</Label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NetworkGraph;