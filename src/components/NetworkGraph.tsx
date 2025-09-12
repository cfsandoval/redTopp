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
  Eye, Network, Share2, Save, Layers, Minimize2, Maximize2, Info 
} from 'lucide-react';
import * as d3 from 'd3';
import * as XLSX from 'xlsx';

// Enhanced type definitions with more comprehensive metadata
interface NodeMetadata {
  type: 'data' | 'service' | 'endpoint';
  importance: number;
  timestamp: number;
  color?: string;
  description?: string;
}

interface EdgeMetadata {
  type: 'direct' | 'indirect' | 'transitive';
  strength: number;
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
}

interface NetworkAnalysis {
  totalNodes: number;
  totalEdges: number;
  averageDegree: number;
  density: number;
  mostConnectedNode?: string;
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
  const [networkAnalysis, setNetworkAnalysis] = useState<NetworkAnalysis>({
    totalNodes: 0,
    totalEdges: 0,
    averageDegree: 0,
    density: 0
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<Node | null>(null);

  // Advanced graph generation with sophisticated metadata
  const generateSampleGraph = useCallback(() => {
    const { nodeCount, connectionProbability, weightRange } = graphConfig;
    
    // Generate nodes with rich metadata
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => {
      const nodeType = ['data', 'service', 'endpoint'][Math.floor(Math.random() * 3)] as NodeMetadata['type'];
      return {
        id: `node_${i}`,
        label: `Node ${String.fromCharCode(65 + i)}`,
        group: Math.floor(Math.random() * 3),
        size: Math.random() * 1.5 + 0.5,
        metadata: {
          type: nodeType,
          importance: Math.random(),
          timestamp: Date.now(),
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          description: `A ${nodeType} node with random characteristics`
        }
      };
    });

    // Generate edges with complex connection logic
    const edges: Edge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < connectionProbability) {
          const edgeType = ['direct', 'indirect', 'transitive'][Math.floor(Math.random() * 3)] as EdgeMetadata['type'];
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            weight: weightRange[0] + Math.random() * (weightRange[1] - weightRange[0]),
            metadata: {
              type: edgeType,
              strength: Math.random(),
              description: `A ${edgeType} connection between nodes`
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

  // Perform comprehensive network analysis
  const performNetworkAnalysis = (data: GraphData) => {
    const { nodes, edges } = data;
    
    // Calculate node degrees
    const nodeDegrees = new Map<string, number>();
    edges.forEach(edge => {
      nodeDegrees.set(edge.source, (nodeDegrees.get(edge.source) || 0) + 1);
      nodeDegrees.set(edge.target, (nodeDegrees.get(edge.target) || 0) + 1);
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
      mostConnectedNode
    };

    setNetworkAnalysis(analysis);
  };

  // Export graph data to Excel
  const exportGraphData = () => {
    const nodeWorksheet = XLSX.utils.json_to_sheet(graphData.nodes);
    const edgeWorksheet = XLSX.utils.json_to_sheet(graphData.edges);
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workbook, nodeWorksheet, 'Nodes');
    XLSX.utils.book_append_sheet(workbook, edgeWorksheet, 'Edges');
    
    XLSX.writeFile(workbook, 'network_graph_data.xlsx');
    toast.success('Graph data exported successfully');
  };

  // Import graph data from file
  const importGraphData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' });
        const nodesSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Nodes']);
        const edgesSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Edges']);

        const importedGraphData: GraphData = {
          nodes: nodesSheet as Node[],
          edges: edgesSheet as Edge[]
        };

        setGraphData(importedGraphData);
        performNetworkAnalysis(importedGraphData);
        toast.success('Graph data imported successfully');
      } catch (error) {
        toast.error('Error importing graph data');
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Render method with node details dialog
  const renderNodeDetailsDialog = () => {
    if (!selectedNodeDetails) return null;

    return (
      <Dialog open={!!selectedNodeDetails} onOpenChange={() => setSelectedNodeDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Node Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ID</Label>
              <p>{selectedNodeDetails.id}</p>
            </div>
            <div>
              <Label>Label</Label>
              <p>{selectedNodeDetails.label}</p>
            </div>
            <div>
              <Label>Type</Label>
              <p>{selectedNodeDetails.metadata.type}</p>
            </div>
            <div>
              <Label>Importance</Label>
              <p>{selectedNodeDetails.metadata.importance.toFixed(2)}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p>{selectedNodeDetails.metadata.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Render method with network analysis dialog
  const renderNetworkAnalysisDialog = () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Network Analysis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Total Nodes</Label>
              <p>{networkAnalysis.totalNodes}</p>
            </div>
            <div>
              <Label>Total Edges</Label>
              <p>{networkAnalysis.totalEdges}</p>
            </div>
            <div>
              <Label>Average Node Degree</Label>
              <p>{networkAnalysis.averageDegree.toFixed(2)}</p>
            </div>
            <div>
              <Label>Network Density</Label>
              <p>{networkAnalysis.density.toFixed(2)}</p>
            </div>
            <div>
              <Label>Most Connected Node</Label>
              <p>{networkAnalysis.mostConnectedNode}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Existing rendering and interaction methods remain the same...
  // (previous implementation of renderGraph, handleNodeClick, etc.)

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
            <Button variant="outline" size="icon" onClick={exportGraphData}>
              <Download className="h-4 w-4" />
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={importGraphData} 
              accept=".xlsx" 
              className="hidden" 
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
            {renderNetworkAnalysisDialog()}
            {/* Rest of the existing controls */}
          </div>
        </CardHeader>
        
        {/* Existing SVG rendering */}
        {renderNodeDetailsDialog()}
      </Card>
    </div>
  );
};

export default NetworkGraph;