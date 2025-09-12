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
  Eye, Network, Share2, Save, Layers, Minimize2, Maximize2, Info, 
  Cpu, Database, Server, Link, Shuffle, Microscope 
} from 'lucide-react';
import * as d3 from 'd3';
import * as XLSX from 'xlsx';

// Enhanced type definitions with more comprehensive metadata
interface NodeMetadata {
  type: 'data' | 'service' | 'endpoint' | 'compute' | 'storage';
  importance: number;
  timestamp: number;
  color?: string;
  description?: string;
  tags?: string[];
}

interface EdgeMetadata {
  type: 'direct' | 'indirect' | 'transitive' | 'dependency' | 'communication';
  strength: number;
  latency?: number;
  bandwidth?: number;
  description?: string;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: number;
  size: number;
  x?: number;
  y?: number;
  metadata: NodeMetadata;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  weight: number;
  metadata: EdgeMetadata;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface GraphConfig {
  nodeCount: number;
  connectionProbability: number;
  weightRange: [number, number];
  nodeTypes: NodeMetadata['type'][];
  edgeTypes: EdgeMetadata['type'][];
}

interface NetworkAnalysis {
  totalNodes: number;
  totalEdges: number;
  averageDegree: number;
  density: number;
  mostConnectedNode?: string;
  nodeTypeDistribution: Record<NodeMetadata['type'], number>;
  edgeTypeDistribution: Record<EdgeMetadata['type'], number>;
}

const NetworkGraph: React.FC = () => {
  // Expanded state management
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: []
  });
  const [zoom, setZoom] = useState(1);
  const [correlationThreshold, setCorrelationThreshold] = useState(0.5);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'force' | 'circular' | 'hierarchical' | 'radial'>('force');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    nodeCount: 15,
    connectionProbability: 0.4,
    weightRange: [0, 1],
    nodeTypes: ['data', 'service', 'endpoint', 'compute', 'storage'],
    edgeTypes: ['direct', 'indirect', 'transitive', 'dependency', 'communication']
  });
  const [networkAnalysis, setNetworkAnalysis] = useState<NetworkAnalysis>({
    totalNodes: 0,
    totalEdges: 0,
    averageDegree: 0,
    density: 0,
    nodeTypeDistribution: {} as Record<NodeMetadata['type'], number>,
    edgeTypeDistribution: {} as Record<EdgeMetadata['type'], number>
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<Node | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<'default' | 'centrality' | 'community'>('default');

  // Advanced graph generation with sophisticated metadata and more diverse node/edge types
  const generateSampleGraph = useCallback(() => {
    const { nodeCount, connectionProbability, weightRange, nodeTypes, edgeTypes } = graphConfig;
    
    // Generate nodes with rich, diverse metadata
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => {
      const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      return {
        id: `node_${i}`,
        label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} ${String.fromCharCode(65 + i)}`,
        group: Math.floor(Math.random() * 5),
        size: Math.random() * 2 + 0.5,
        metadata: {
          type: nodeType,
          importance: Math.random(),
          timestamp: Date.now(),
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          description: `A ${nodeType} node with complex characteristics`,
          tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
            ['critical', 'high-performance', 'legacy', 'cloud-native', 'scalable'][Math.floor(Math.random() * 5)]
          )
        }
      };
    });

    // Generate edges with more sophisticated connection logic
    const edges: Edge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < connectionProbability) {
          const edgeType = edgeTypes[Math.floor(Math.random() * edgeTypes.length)];
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            weight: weightRange[0] + Math.random() * (weightRange[1] - weightRange[0]),
            metadata: {
              type: edgeType,
              strength: Math.random(),
              latency: Math.random() * 100,
              bandwidth: Math.random() * 1000,
              description: `A ${edgeType} connection between nodes with varying characteristics`
            }
          });
        }
      }
    }

    const newGraphData = { nodes, edges };
    setGraphData(newGraphData);
    performNetworkAnalysis(newGraphData);
    toast.success(`Generated graph with ${nodes.length} nodes and ${edges.length} edges`);
  }, [graphConfig]);

  // Perform comprehensive network analysis with more detailed insights
  const performNetworkAnalysis = (data: GraphData) => {
    const { nodes, edges } = data;
    
    // Calculate node degrees and type distribution
    const nodeDegrees = new Map<string, number>();
    const nodeTypeDistribution: Record<NodeMetadata['type'], number> = {
      data: 0,
      service: 0,
      endpoint: 0,
      compute: 0,
      storage: 0
    };

    edges.forEach(edge => {
      nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1);
      nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1);
    });

    nodes.forEach(node => {
      nodeTypeDistribution[node.metadata.type]++;
    });

    // Calculate edge type distribution
    const edgeTypeDistribution: Record<EdgeMetadata['type'], number> = {
      direct: 0,
      indirect: 0,
      transitive: 0,
      dependency: 0,
      communication: 0
    };

    edges.forEach(edge => {
      edgeTypeDistribution[edge.metadata.type]++;
    });

    // Find most connected node
    const mostConnectedNode = Array.from(nodeDegrees.entries()).reduce(
      (max, [node, degree]) => degree > max[1] ? [node, degree] : max, 
      ['', -1]
    )[0];

    const analysis: NetworkAnalysis = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      averageDegree: edges.length * 2 / nodes.length,
      density: edges.length / (nodes.length * (nodes.length - 1) / 2),
      mostConnectedNode,
      nodeTypeDistribution,
      edgeTypeDistribution
    };

    setNetworkAnalysis(analysis);
  };

  // Advanced visualization modes
  const applyVisualizationMode = (mode: 'default' | 'centrality' | 'community') => {
    setVisualizationMode(mode);
    
    switch (mode) {
      case 'centrality':
        // Calculate node centrality (degree centrality)
        const nodeDegrees = new Map<string, number>();
        graphData.edges.forEach(edge => {
          nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1);
          nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1);
        });
        
        // Modify node sizes based on centrality
        const maxDegree = Math.max(...Array.from(nodeDegrees.values()));
        const updatedNodes = graphData.nodes.map(node => ({
          ...node,
          size: (nodeDegrees.get(node.id) || 0) / maxDegree * 3
        }));

        setGraphData(prev => ({ ...prev, nodes: updatedNodes }));
        toast.info('Applied Centrality Visualization');
        break;

      case 'community':
        // Simple community detection based on group attribute
        const communityColors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
        ];
        
        const updatedNodesWithCommunity = graphData.nodes.map(node => ({
          ...node,
          metadata: {
            ...node.metadata,
            color: communityColors[node.group % communityColors.length]
          }
        }));

        setGraphData(prev => ({ ...prev, nodes: updatedNodesWithCommunity }));
        toast.info('Applied Community Visualization');
        break;

      default:
        // Reset to original graph
        generateSampleGraph();
        break;
    }
  };

  // Existing methods for rendering, export, import remain similar to previous implementation

  // Render method with enhanced controls and visualization modes
  return (
    <div className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'max-w-4xl mx-auto'}`}>
      <Card className="p-6 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Advanced Network Graph Visualization</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={generateSampleGraph}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="flex space-x-1">
              <Button 
                variant={visualizationMode === 'default' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyVisualizationMode('default')}
              >
                <Eye className="h-4 w-4 mr-2" /> Default
              </Button>
              <Button 
                variant={visualizationMode === 'centrality' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyVisualizationMode('centrality')}
              >
                <Microscope className="h-4 w-4 mr-2" /> Centrality
              </Button>
              <Button 
                variant={visualizationMode === 'community' ? 'default' : 'outline'}
                size="sm"
                onClick={() => applyVisualizationMode('community')}
              >
                <Network className="h-4 w-4 mr-2" /> Community
              </Button>
            </div>
            {/* Other existing controls */}
          </div>
        </CardHeader>
        
        {/* Rest of the component remains similar */}
      </Card>
    </div>
  );
};

export default NetworkGraph;