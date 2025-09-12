"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Upload, Download, Settings, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import * as d3 from 'd3';

// Define interfaces for graph data with D3 SimulationNodeDatum
interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: number;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  weight: number;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

const NetworkGraph: React.FC = () => {
  // Initialize state with proper typing
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: []
  });
  const [filteredEdges, setFilteredEdges] = useState<Edge[]>([]);
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);

  // Render graph with proper type annotations
  const renderGraph = useCallback(() => {
    if (!graphData.nodes.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    // Create force simulation with typed nodes and links
    const simulation = d3.forceSimulation<Node, Edge>(graphData.nodes)
      .force("link", d3.forceLink<Node, Edge>(graphData.edges).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create links
    const links = svg.append("g")
      .selectAll("line")
      .data(filteredEdges)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => d.weight * 5);

    // Create nodes
    const nodes = svg.append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", d => `hsl(${d.group * 60}, 70%, 50%)`)
      .call(d3.drag() as any);

    // Add labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .enter().append("text")
      .text(d => d.label)
      .attr("font-size", 10)
      .attr("dx", 12)
      .attr("dy", 4);

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
  }, [graphData, filteredEdges]);

  // Zoom functionality
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoom * 1.2 : zoom / 1.2;
    setZoom(Math.max(0.5, Math.min(newZoom, 3)));
    toast.info(`Zoom: ${(newZoom * 100).toFixed(0)}%`);
  }, [zoom]);

  // Render method
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <Card className="p-6 shadow-lg">
        <CardHeader>
          <div className="flex space-x-2">
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
          </div>
        </CardHeader>
        
        <CardContent>
          <svg 
            ref={svgRef} 
            width="600" 
            height="400" 
            viewBox="0 0 600 400"
            style={{ transform: `scale(${zoom})` }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkGraph;