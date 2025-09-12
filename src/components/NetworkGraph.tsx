"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Upload, Download, Settings, RefreshCw } from 'lucide-react';

// Define types for better type safety
interface Node {
  id: string;
  label: string;
  x?: number;
  y?: number;
  group?: number;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

// Sample initial graph data
const SAMPLE_GRAPH_DATA: GraphData = {
  nodes: [
    { id: 'A', label: 'Variable A', group: 1 },
    { id: 'B', label: 'Variable B', group: 1 },
    { id: 'C', label: 'Variable C', group: 2 },
    { id: 'D', label: 'Variable D', group: 2 },
    { id: 'E', label: 'Variable E', group: 3 },
  ],
  edges: [
    { source: 'A', target: 'B', weight: 0.8 },
    { source: 'A', target: 'C', weight: 0.6 },
    { source: 'B', target: 'D', weight: 0.4 },
    { source: 'C', target: 'E', weight: 0.7 },
    { source: 'D', target: 'E', weight: 0.5 },
  ]
};

const NetworkGraph: React.FC = () => {
  // State management
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'circular' | 'random'>('circular');
  const [graphData, setGraphData] = useState<GraphData | null>(SAMPLE_GRAPH_DATA);
  const [correlationThreshold, setCorrelationThreshold] = useState<number[]>([0.5]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Generate node positions based on layout algorithm
  const generateNodePositions = useCallback((nodes: Node[], algorithm: string) => {
    return nodes.map((node, i) => {
      switch (algorithm) {
        case 'circular':
          return {
            ...node,
            x: Math.cos((2 * Math.PI * i) / nodes.length),
            y: Math.sin((2 * Math.PI * i) / nodes.length)
          };
        case 'random':
          return {
            ...node,
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1
          };
        default:
          return node;
      }
    });
  }, []);

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Validate data structure
        if (!data.nodes || !data.edges) {
          throw new Error("Invalid graph data format");
        }
        setGraphData(data);
        toast.success("Graph data loaded successfully");
      } catch (error) {
        toast.error(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  }, []);

  // Export graph data
  const exportGraphData = useCallback(() => {
    if (!graphData) {
      toast.error("No graph data to export");
      return;
    }

    const exportData = {
      nodes: graphData.nodes,
      edges: graphData.edges.filter(edge => Math.abs(edge.weight) >= correlationThreshold[0]),
      threshold: correlationThreshold[0]
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network_graph_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Graph data exported successfully");
  }, [graphData, correlationThreshold]);

  // Filtered edges based on correlation threshold
  const filteredEdges = useMemo(() => {
    return graphData ? graphData.edges.filter(
      edge => Math.abs(edge.weight) >= correlationThreshold[0]
    ) : [];
  }, [graphData, correlationThreshold]);

  // Regenerate node positions
  const regenerateNodePositions = useCallback(() => {
    if (graphData) {
      const updatedNodes = generateNodePositions(graphData.nodes, layoutAlgorithm);
      setGraphData(prev => prev ? { ...prev, nodes: updatedNodes } : null);
      toast.success(`Regenerated ${layoutAlgorithm} layout`);
    }
  }, [graphData, layoutAlgorithm, generateNodePositions]);

  // Render configuration panel
  const renderConfigPanel = () => (
    <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg rounded-b-lg p-4 z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Graph Configuration</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsConfigOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Correlation Threshold: {correlationThreshold[0].toFixed(1)}</Label>
          <Slider
            defaultValue={[0.5]}
            max={1}
            step={0.1}
            onValueChange={setCorrelationThreshold}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setLayoutAlgorithm(
                layoutAlgorithm === 'circular' ? 'random' : 'circular'
              );
              regenerateNodePositions();
            }}
          >
            Switch Layout: {layoutAlgorithm}
          </Button>
          <Button 
            variant="outline" 
            onClick={regenerateNodePositions}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate Layout
          </Button>
        </div>
      </div>
    </div>
  );

  // Render graph statistics
  const renderGraphStatistics = () => {
    if (!graphData) return null;

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <h4 className="font-semibold text-sm">Nodes</h4>
          <p className="text-xl">{graphData.nodes.length}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <h4 className="font-semibold text-sm">Filtered Edges</h4>
          <p className="text-xl">{filteredEdges.length}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <Card className="p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex justify-between items-center">
            Network Correlation Visualizer
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsConfigOpen(!isConfigOpen)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".json"
                  onChange={handleFileUpload}
                />
              </div>
              <Button 
                variant="secondary" 
                size="icon"
                onClick={exportGraphData}
                disabled={!graphData}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {graphData ? (
            <>
              {renderGraphStatistics()}
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Correlation Threshold: {correlationThreshold[0].toFixed(1)}</p>
                <p>Layout Algorithm: {layoutAlgorithm}</p>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              Upload a JSON file with network graph data
            </div>
          )}
        </CardContent>
        
        {isConfigOpen && renderConfigPanel()}
      </Card>
    </div>
  );
};

export default NetworkGraph;