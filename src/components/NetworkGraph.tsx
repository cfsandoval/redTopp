"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Upload, Download, Settings } from 'lucide-react';

// Define types for better type safety
interface Node {
  id: string;
  label: string;
  x?: number;
  y?: number;
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

const NetworkGraph: React.FC = () => {
  // State management
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'circular' | 'random'>('circular');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [correlationThreshold, setCorrelationThreshold] = useState<number[]>([0.5]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

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

  // Rest of the component remains the same...

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
        
        {/* Rest of the existing code */}
      </Card>
    </div>
  );
};

export default NetworkGraph;