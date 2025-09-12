"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  X, Upload, Download, Settings, RefreshCw, ZoomIn, ZoomOut, Filter, 
  Eye, Network, Share2, Save, Layers, Minimize2, Maximize2 
} from 'lucide-react';
import * as d3 from 'd3';

// Enhanced type definitions with more metadata
interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: number;
  size: number;
  x?: number;
  y?: number;
  metadata?: Record<string, any>;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  weight: number;
  type?: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface GraphConfig {
  nodeCount: number;
  connectionProbability: number;
  weightRange: [number, number];
}

const NetworkGraph: React.FC = () => {
  // Expanded state management
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: []
  });
  const [zoom, setZoom] = useState(1);
  const [correlationThreshold, setCorrelationThreshold] = useState(0.5);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'force' | 'circular' | 'hierarchical'>('force');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    nodeCount: 10,
    connectionProbability: 0.4,
    weightRange: [0, 1]
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Advanced graph generation with configurable parameters
  const generateSampleGraph = useCallback(() => {
    const { nodeCount, connectionProbability, weightRange } = graphConfig;
    
    // Generate nodes with more sophisticated metadata
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node_${i}`,
      label: `Node ${String.fromCharCode(65 + i)}`,
      group: Math.floor(Math.random() * 3),
      size: Math.random() * 1.5 + 0.5,
      metadata: {
        type: ['data', 'service', 'endpoint'][Math.floor(Math.random() * 3)],
        importance: Math.random(),
        timestamp: Date.now()
      }
    }));

    // Generate edges with more complex connection logic
    const edges: Edge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < connectionProbability) {
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            weight: weightRange[0] + Math.random() * (weightRange[1] - weightRange[0]),
            type: ['direct', 'indirect', 'transitive'][Math.floor(Math.random() * 3)]
          });
        }
      }
    }

    setGraphData({ nodes, edges });
    toast.success(`Generated graph with ${nodes.length} nodes and ${edges.length} edges`);
  }, [graphConfig]);

  // Advanced graph rendering with more visualization options
  const renderGraph = useCallback(() => {
    if (!graphData.nodes.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = isFullscreen ? window.innerWidth - 100 : 600;
    const height = isFullscreen ? window.innerHeight - 200 : 400;

    // Filter edges based on correlation threshold
    const filteredEdges = graphData.edges.filter(edge => edge.weight >= correlationThreshold);

    // Advanced layout selection with more options
    const simulation = layoutAlgorithm === 'force'
      ? d3.forceSimulation<Node, Edge>(graphData.nodes)
          .force("link", d3.forceLink<Node, Edge>(filteredEdges).id(d => d.id))
          .force("charge", d3.forceManyBody().strength(-100))
          .force("center", d3.forceCenter(width / 2, height / 2))
      : layoutAlgorithm === 'circular'
        ? createCircularLayout(graphData.nodes, width, height)
        : createHierarchicalLayout(graphData.nodes, width, height);

    // Create links with color and style based on edge type
    const links = svg.append("g")
      .selectAll("line")
      .data(filteredEdges)
      .enter().append("line")
      .attr("stroke", d => {
        switch(d.type) {
          case 'direct': return "#4CAF50";
          case 'indirect': return "#2196F3";
          case 'transitive': return "#FF9800";
          default: return "#999";
        }
      })
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.weight) * 5)
      .attr("stroke-dasharray", d => {
        switch(d.type) {
          case 'indirect': return "5,5";
          case 'transitive': return "3,3";
          default: return "0";
        }
      });

    // Create nodes with advanced styling and interaction
    const nodes = svg.append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter().append("circle")
      .attr("r", d => Math.max(5, d.size * 10))
      .attr("fill", d => {
        switch(d.metadata?.type) {
          case 'data': return `hsl(${d.group * 60}, 70%, 50%)`;
          case 'service': return `hsl(${d.group * 60 + 120}, 70%, 50%)`;
          case 'endpoint': return `hsl(${d.group * 60 + 240}, 70%, 50%)`;
          default: return `hsl(${d.group * 60}, 70%, 50%)`;
        }
      })
      .attr("opacity", d => selectedNodes.length === 0 || selectedNodes.includes(d.id) ? 1 : 0.3)
      .call(d3.drag() as any)
      .on("click", (event, d) => handleNodeClick(d));

    // Add labels with more information
    const labels = svg.append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .enter().append("text")
      .text(d => `${d.label} (${d.metadata?.type ?? 'unknown'})`)
      .attr("font-size", 10)
      .attr("dx", 12)
      .attr("dy", 4)
      .attr("opacity", d => selectedNodes.length === 0 || selectedNodes.includes(d.id) ? 1 : 0.3);

    // Update positions on each tick of simulation
    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });
  }, [graphData, correlationThreshold, layoutAlgorithm, selectedNodes, isFullscreen]);

  // Circular layout algorithm
  const createCircularLayout = (nodes: Node[], width: number, height: number) => {
    const radius = Math.min(width, height) / 2 - 50;
    const centerX = width / 2;
    const centerY = height / 2;

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    return d3.forceSimulation(nodes);
  };

  // Hierarchical layout algorithm
  const createHierarchicalLayout = (nodes: Node[], width: number, height: number) => {
    const levels = 3;
    const nodesPerLevel = Math.ceil(nodes.length / levels);

    nodes.forEach((node, index) => {
      const level = Math.floor(index / nodesPerLevel);
      const positionInLevel = index % nodesPerLevel;

      node.x = (positionInLevel + 1) * (width / (nodesPerLevel + 1));
      node.y = (level + 1) * (height / (levels + 1));
    });

    return d3.forceSimulation(nodes);
  };

  // Node click handler
  const handleNodeClick = (node: Node) => {
    setSelectedNodes(prev => 
      prev.includes(node.id) 
        ? prev.filter(id => id !== node.id)
        : [...prev, node.id]
    );
  };

  // Zoom and layout controls
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoom * 1.2 : zoom / 1.2;
    setZoom(Math.max(0.5, Math.min(newZoom, 3)));
    toast.info(`Zoom: ${(newZoom * 100).toFixed(0)}%`);
  }, [zoom]);

  // Trigger graph generation on component mount
  useEffect(() => {
    generateSampleGraph();
  }, []);

  // Trigger re-render when graph data changes
  useEffect(() => {
    renderGraph();
  }, [graphData, correlationThreshold, layoutAlgorithm, selectedNodes, isFullscreen]);

  // Render method with enhanced controls
  return (
    <div className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'max-w-3xl mx-auto'}`}>
      <Card className="p-6 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Network Graph Visualization</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={generateSampleGraph}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Graph Configuration</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="visualization">
                  <TabsList>
                    <TabsTrigger value="visualization">Visualization</TabsTrigger>
                    <TabsTrigger value="generation">Generation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="visualization">
                    <div className="space-y-4">
                      <div>
                        <Label>Correlation Threshold</Label>
                        <Slider 
                          value={[correlationThreshold * 100]} 
                          onValueChange={(val) => setCorrelationThreshold(val[0] / 100)}
                          max={100}
                          step={1}
                        />
                      </div>
                      <div>
                        <Label>Layout Algorithm</Label>
                        <div className="flex space-x-2">
                          <Button 
                            variant={layoutAlgorithm === 'force' ? 'default' : 'outline'}
                            onClick={() => setLayoutAlgorithm('force')}
                          >
                            Force-Directed
                          </Button>
                          <Button 
                            variant={layoutAlgorithm === 'circular' ? 'default' : 'outline'}
                            onClick={() => setLayoutAlgorithm('circular')}
                          >
                            Circular
                          </Button>
                          <Button 
                            variant={layoutAlgorithm === 'hierarchical' ? 'default' : 'outline'}
                            onClick={() => setLayoutAlgorithm('hierarchical')}
                          >
                            Hierarchical
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="generation">
                    <div className="space-y-4">
                      <div>
                        <Label>Number of Nodes</Label>
                        <Input 
                          type="number" 
                          value={graphConfig.nodeCount}
                          onChange={(e) => setGraphConfig(prev => ({
                            ...prev, 
                            nodeCount: parseInt(e.target.value)
                          }))}
                          min={5}
                          max={50}
                        />
                      </div>
                      <div>
                        <Label>Connection Probability</Label>
                        <Slider 
                          value={[graphConfig.connectionProbability * 100]} 
                          onValueChange={(val) => setGraphConfig(prev => ({
                            ...prev, 
                            connectionProbability: val[0] / 100
                          }))}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleZoom('in')}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleZoom('out')}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <svg 
            ref={svgRef} 
            width={isFullscreen ? '100%' : '600'} 
            height={isFullscreen ? '100%' : '400'}
            viewBox={`0 0 ${isFullscreen ? window.innerWidth - 100 : 600} ${isFullscreen ? window.innerHeight - 200 : 400}`}
            style={{ transform: `scale(${zoom})` }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkGraph;