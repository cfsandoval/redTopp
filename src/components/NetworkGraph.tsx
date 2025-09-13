"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { showToast } from "@/utils/toast";
import { Node, Link, NetworkSimulationConfig, NetworkGraphProps, AdjacencyMatrix, NodeGroup } from '@/types/network';
import { Pencil, Check, X, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GROUP_COLORS = {
  server: '#36A2EB',
  workstation: '#FF6384',
  router: '#4BC0C0'
};

const DEFAULT_CONFIG: NetworkSimulationConfig = {
  width: 800,
  height: 500,
  nodeRadius: 30
};

const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  nodes: initialNodes = [], 
  links: initialLinks = [], 
  config = DEFAULT_CONFIG 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>(initialNodes.length > 0 ? initialNodes : [
    { id: '1', name: 'Web Server', x: 200, y: 150, type: 'server' },
    { id: '2', name: 'Database', x: 600, y: 150, type: 'server' },
    { id: '3', name: 'Router', x: 400, y: 250, type: 'router' },
    { id: '4', name: 'Client 1', x: 200, y: 350, type: 'workstation' },
    { id: '5', name: 'Client 2', x: 600, y: 350, type: 'workstation' }
  ]); 
  const [links, setLinks] = useState<Link[]>(initialLinks.length > 0 ? initialLinks : [
    { source: '1', target: '3' },
    { source: '2', target: '3' },
    { source: '4', target: '1' },
    { source: '5', target: '2' },
    { source: '3', target: '4' },
    { source: '3', target: '5' }
  ]);
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'groups'>('graph');
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newNodeType, setNewNodeType] = useState<string>('workstation');

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    // Create a simulation to position nodes
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(DEFAULT_CONFIG.width / 2, DEFAULT_CONFIG.height / 2));

    // Draw links
    const linkElements = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Draw nodes
    const nodeElements = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(d3.drag<SVGGElement, Node>()
        .on("drag", (event, d) => {
          d.x = event.x;
          d.y = event.y;
          simulation.restart();
        })
      );

    // Node circles
    nodeElements.append("circle")
      .attr("r", DEFAULT_CONFIG.nodeRadius)
      .attr("fill", (d: any) => GROUP_COLORS[d.type as keyof typeof GROUP_COLORS] || '#666')
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    // Node labels
    nodeElements.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text((d: any) => d.name);

    // Update positions on each tick of the simulation
    simulation.on("tick", () => {
      linkElements
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeElements
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
  }, [nodes, links]);

  const handleAddNode = () => {
    if (!newNodeName.trim()) {
      showToast.error('Node name cannot be empty');
      return;
    }

    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      name: newNodeName.trim(),
      x: DEFAULT_CONFIG.width / 2,
      y: DEFAULT_CONFIG.height / 2,
      type: newNodeType
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setNewNodeName('');
    showToast.success(`New node added: ${newNode.name}`);
  };

  return (
    <div className="network-graph-container space-y-4">
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={viewMode === 'graph' ? 'default' : 'outline'}
          onClick={() => setViewMode('graph')}
        >
          Graph View
        </Button>
        <Button 
          variant={viewMode === 'matrix' ? 'default' : 'outline'}
          onClick={() => setViewMode('matrix')}
        >
          Matrix View
        </Button>
        <Button 
          variant={viewMode === 'groups' ? 'default' : 'outline'}
          onClick={() => setViewMode('groups')}
        >
          Groups
        </Button>
      </div>

      {viewMode === 'graph' && (
        <div className="w-full border rounded">
          <div className="flex space-x-2 p-2">
            <Input 
              placeholder="Enter new node name" 
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              className="flex-grow"
            />
            <Select 
              value={newNodeType} 
              onValueChange={setNewNodeType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Node Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="workstation">Workstation</SelectItem>
                <SelectItem value="router">Router</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddNode}>Add Node</Button>
          </div>
          <svg 
            ref={svgRef}
            width="100%" 
            height={DEFAULT_CONFIG.height}
            viewBox={`0 0 ${DEFAULT_CONFIG.width} ${DEFAULT_CONFIG.height}`}
          />
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;