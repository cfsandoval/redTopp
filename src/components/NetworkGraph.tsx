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
  Cpu, Database, Server, Link, Shuffle, Microscope, Route, Workflow 
} from 'lucide-react';
import * as d3 from 'd3';
import * as XLSX from 'xlsx';

// Enhanced type definitions
interface NodeMetadata {
  type: 'data' | 'service' | 'endpoint' | 'compute' | 'storage';
  importance: number;
  timestamp: number;
  color?: string;
  description?: string;
  tags?: string[];
  cluster?: number;
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

interface PathfindingResult {
  path: string[];
  totalWeight: number;
  edges: Edge[];
}

class GraphAlgorithms {
  // Dijkstra's shortest path algorithm
  static dijkstraShortestPath(graph: GraphData, startNodeId: string, endNodeId: string): PathfindingResult | null {
    const nodes = graph.nodes;
    const edges = graph.edges;
    
    // Create adjacency list
    const adjacencyList = new Map<string, { node: string, weight: number }[]>();
    edges.forEach(edge => {
      const sourceAdj = adjacencyList.get(edge.source) || [];
      const targetAdj = adjacencyList.get(edge.target) || [];
      
      sourceAdj.push({ node: edge.target, weight: edge.weight });
      targetAdj.push({ node: edge.source, weight: edge.weight });
      
      adjacencyList.set(edge.source, sourceAdj);
      adjacencyList.set(edge.target, targetAdj);
    });

    // Dijkstra's algorithm implementation
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    // Initialize
    nodes.forEach(node => {
      distances.set(node.id, node.id === startNodeId ? 0 : Infinity);
      previous.set(node.id, null);
      unvisited.add(node.id);
    });

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      const currentNodeId = Array.from(unvisited).reduce((minNode, node) => 
        (distances.get(node) ?? Infinity) < (distances.get(minNode) ?? Infinity) ? node : minNode
      );

      if (currentNodeId === endNodeId) break;

      unvisited.delete(currentNodeId);

      // Check adjacent nodes
      const neighbors = adjacencyList.get(currentNodeId) || [];
      neighbors.forEach(neighbor => {
        if (!unvisited.has(neighbor.node)) return;

        const tentativeDistance = (distances.get(currentNodeId) ?? Infinity) + neighbor.weight;
        if (tentativeDistance < (distances.get(neighbor.node) ?? Infinity)) {
          distances.set(neighbor.node, tentativeDistance);
          previous.set(neighbor.node, currentNodeId);
        }
      });
    }

    // Reconstruct path
    if (!previous.get(endNodeId)) return null;

    const path: string[] = [];
    const pathEdges: Edge[] = [];
    let current: string | null = endNodeId;
    let totalWeight = 0;

    while (current) {
      path.unshift(current);
      const prevNode = previous.get(current);
      
      if (prevNode) {
        // Find the corresponding edge
        const connectingEdge = edges.find(e => 
          (e.source === prevNode && e.target === current) || 
          (e.target === prevNode && e.source === current)
        );
        
        if (connectingEdge) {
          pathEdges.unshift(connectingEdge);
          totalWeight += connectingEdge.weight;
        }
      }
      
      current = prevNode;
      if (current === startNodeId) break;
    }

    return { path, totalWeight, edges: pathEdges };
  }

  // Community detection using Louvain method (simplified)
  static detectCommunities(graph: GraphData): Node[] {
    const nodes = graph.nodes;
    const edges = graph.edges;
    
    // Create adjacency matrix
    const adjacencyMatrix = new Map<string, Map<string, number>>();
    edges.forEach(edge => {
      const sourceAdj = adjacencyMatrix.get(edge.source) || new Map();
      const targetAdj = adjacencyMatrix.get(edge.target) || new Map();
      
      sourceAdj.set(edge.target, edge.weight);
      targetAdj.set(edge.source, edge.weight);
      
      adjacencyMatrix.set(edge.source, sourceAdj);
      adjacencyMatrix.set(edge.target, targetAdj);
    });

    // Simplified community detection
    const communities = new Map<string, number>();
    let communityCounter = 0;

    nodes.forEach(node => {
      const neighbors = adjacencyMatrix.get(node.id) || new Map();
      const neighborCommunities = new Map<number, number>();

      neighbors.forEach((weight, neighborId) => {
        const neighborCommunity = communities.get(neighborId);
        if (neighborCommunity !== undefined) {
          neighborCommunities.set(neighborCommunity, (neighborCommunities.get(neighborCommunity) || 0) + weight);
        }
      });

      // Assign to most connected community or create new
      if (neighborCommunities.size > 0) {
        const mostConnectedCommunity = Array.from(neighborCommunities.entries()).reduce(
          (max, [community, weight]) => weight > max[1] ? [community, weight] : max,
          [-1, -Infinity]
        )[0];
        communities.set(node.id, mostConnectedCommunity);
      } else {
        communities.set(node.id, communityCounter++);
      }
    });

    // Update nodes with community information
    return nodes.map(node => ({
      ...node,
      metadata: {
        ...node.metadata,
        cluster: communities.get(node.id)
      }
    }));
  }
}

const NetworkGraph: React.FC = () => {
  // State management
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: []
  });
  const [pathfindingMode, setPathfindingMode] = useState<{
    active: boolean;
    startNode: string | null;
    endNode: string | null;
    result: PathfindingResult | null;
  }>({
    active: false,
    startNode: null,
    endNode: null,
    result: null
  });

  // Existing state and methods from previous implementations...

  // Path finding interaction
  const startPathfinding = () => {
    setPathfindingMode(prev => ({ ...prev, active: true }));
    toast.info('Select start and end nodes for path finding');
  };

  const handleNodePathfindingSelection = (nodeId: string) => {
    if (!pathfindingMode.active) return;

    setPathfindingMode(prev => {
      if (!prev.startNode) {
        return { ...prev, startNode: nodeId };
      }
      
      if (!prev.endNode) {
        const pathResult = GraphAlgorithms.dijkstraShortestPath(
          graphData, 
          prev.startNode, 
          nodeId
        );

        if (pathResult) {
          toast.success(`Path found: ${pathResult.path.join(' → ')}`);
          return { 
            active: false, 
            startNode: null, 
            endNode: nodeId, 
            result: pathResult 
          };
        } else {
          toast.error('No path found between selected nodes');
          return { ...prev, active: false };
        }
      }

      return prev;
    });
  };

  // Community detection
  const detectCommunities = () => {
    const nodesWithCommunities = GraphAlgorithms.detectCommunities(graphData);
    setGraphData(prev => ({ ...prev, nodes: nodesWithCommunities }));
    toast.success('Communities detected and visualized');
  };

  // Render method with enhanced interaction
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <Card className="p-6 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Advanced Network Graph Explorer</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant={pathfindingMode.active ? 'default' : 'outline'} 
              onClick={startPathfinding}
            >
              <Route className="h-4 w-4 mr-2" /> Find Path
            </Button>
            <Button 
              variant="outline" 
              onClick={detectCommunities}
            >
              <Workflow className="h-4 w-4 mr-2" /> Detect Communities
            </Button>
            {/* Other existing controls */}
          </div>
        </CardHeader>
        
        {/* Pathfinding result display */}
        {pathfindingMode.result && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Path Finding Result</h3>
            <p>Path: {pathfindingMode.result.path.join(' → ')}</p>
            <p>Total Weight: {pathfindingMode.result.totalWeight.toFixed(2)}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPathfindingMode({ 
                active: false, 
                startNode: null, 
                endNode: null, 
                result: null 
              })}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Rest of the component */}
      </Card>
    </div>
  );
};

export default NetworkGraph;