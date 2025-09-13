"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { cn } from '@/lib/utils';

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
  const [viewMode, setViewMode] = useState<'graph' | 'matrix' | 'groups'>('matrix'); // Set matrix as default
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newNodeType, setNewNodeType] = useState<string>('workstation');
  const [editingMatrixCell, setEditingMatrixCell] = useState<{ row: string; col: string } | null>(null);

  const calculateAdjacencyMatrix = useCallback((): AdjacencyMatrix => {
    const nodeIds = nodes.map(node => node.id);
    const matrix: number[][] = Array(nodeIds.length).fill(0).map(() => Array(nodeIds.length).fill(0));

    links.forEach(link => {
      const sourceIndex = nodeIds.indexOf(link.source);
      const targetIndex = nodeIds.indexOf(link.target);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        matrix[sourceIndex][targetIndex] = 1;
        matrix[targetIndex][sourceIndex] = 1; // Assuming undirected graph for simplicity
      }
    });

    return { matrix, nodeNames: nodes.map(node => node.name) };
  }, [nodes, links]);

  const adjacencyMatrix = calculateAdjacencyMatrix();

  useEffect(() => {
    if (viewMode !== 'graph' || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    // Cast nodes to D3's SimulationNodeDatum type, which now includes fx/fy
    const simulation = d3.forceSimulation<Node, Link>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id((d: Node) => d.id).distance(100))
      .force("charge", d3.forceManyBody<Node>().strength(-300))
      .force("center", d3.forceCenter<Node>(DEFAULT_CONFIG.width / 2, DEFAULT_CONFIG.height / 2));

    const linkElements = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    const nodeElements = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    nodeElements.append("circle")
      .attr("r", DEFAULT_CONFIG.nodeRadius)
      .attr("fill", (d: Node) => GROUP_COLORS[d.type as keyof typeof GROUP_COLORS] || '#666')
      .attr("stroke", "#333")
      .attr("stroke-width", 2);

    nodeElements.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text((d: Node) => d.name);

    simulation.on("tick", () => {
      linkElements
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeElements
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Cleanup function to stop simulation on unmount or view change
    return () => simulation.stop();
  }, [nodes, links, viewMode]); // Re-run effect if nodes, links, or viewMode changes

  const handleAddNode = () => {
    if (!newNodeName.trim()) {
      showToast.error('Node name cannot be empty');
      return;
    }
    if (nodes.some(node => node.name === newNodeName.trim())) {
      showToast.error(`Node with name "${newNodeName.trim()}" already exists.`);
      return;
    }

    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      name: newNodeName.trim(),
      x: DEFAULT_CONFIG.width / 2 + Math.random() * 50 - 25, // Slight offset for new nodes
      y: DEFAULT_CONFIG.height / 2 + Math.random() * 50 - 25,
      type: newNodeType
    };

    setNodes(prevNodes => [...prevNodes, newNode]);
    setNewNodeName('');
    showToast.success(`New node added: ${newNode.name}`);
  };

  const handleMatrixCellClick = (rowIndex: number, colIndex: number) => {
    const rowNodeId = nodes[rowIndex].id;
    const colNodeId = nodes[colIndex].id;

    if (rowNodeId === colNodeId) return; // Cannot link a node to itself

    setEditingMatrixCell({ row: rowNodeId, col: colNodeId });
  };

  const handleMatrixCellToggle = (rowIndex: number, colIndex: number) => {
    const rowNodeId = nodes[rowIndex].id;
    const colNodeId = nodes[colIndex].id;

    if (rowNodeId === colNodeId) return;

    const isLinked = adjacencyMatrix.matrix[rowIndex][colIndex] === 1;
    let updatedLinks: Link[];

    if (isLinked) {
      // Remove link
      updatedLinks = links.filter(
        link => !((link.source === rowNodeId && link.target === colNodeId) ||
                   (link.source === colNodeId && link.target === rowNodeId))
      );
      showToast.info(`Link removed between ${nodes[rowIndex].name} and ${nodes[colIndex].name}`);
    } else {
      // Add link
      updatedLinks = [...links, { source: rowNodeId, target: colNodeId }];
      showToast.success(`Link added between ${nodes[rowIndex].name} and ${nodes[colIndex].name}`);
    }
    setLinks(updatedLinks);
    setEditingMatrixCell(null);
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
        <div className="w-full border rounded bg-white dark:bg-gray-800 shadow-md">
          <div className="flex flex-wrap items-center space-x-2 p-2 border-b dark:border-gray-700">
            <Input 
              placeholder="Enter new node name" 
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              className="flex-grow max-w-xs"
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
            <Button onClick={handleAddNode} className="flex items-center space-x-1">
              <PlusCircle className="h-4 w-4" />
              <span>Add Node</span>
            </Button>
          </div>
          <svg 
            ref={svgRef}
            width="100%" 
            height={DEFAULT_CONFIG.height}
            viewBox={`0 0 ${DEFAULT_CONFIG.width} ${DEFAULT_CONFIG.height}`}
            className="bg-gray-50 dark:bg-gray-900"
          />
        </div>
      )}

      {viewMode === 'matrix' && (
        <div className="w-full overflow-x-auto border rounded bg-white dark:bg-gray-800 shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white dark:bg-gray-800 z-10">Nodes</TableHead>
                {adjacencyMatrix.nodeNames.map((name, index) => (
                  <TableHead key={index} className="text-center min-w-[80px]">{name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {nodes.map((rowNode, rowIndex) => (
                <TableRow key={rowNode.id}>
                  <TableCell className="sticky left-0 bg-white dark:bg-gray-800 z-10 font-medium">{rowNode.name}</TableCell>
                  {nodes.map((colNode, colIndex) => (
                    <TableCell 
                      key={colNode.id} 
                      className={cn(
                        "text-center cursor-pointer",
                        rowIndex === colIndex ? "bg-gray-200 dark:bg-gray-700" : "",
                        editingMatrixCell?.row === rowNode.id && editingMatrixCell?.col === colNode.id ? "bg-blue-100 dark:bg-blue-900" : ""
                      )}
                      onClick={() => handleMatrixCellClick(rowIndex, colIndex)}
                    >
                      {rowIndex === colIndex ? (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      ) : (
                        <div className="flex items-center justify-center">
                          {editingMatrixCell?.row === rowNode.id && editingMatrixCell?.col === colNode.id ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleMatrixCellToggle(rowIndex, colIndex)}
                              className={adjacencyMatrix.matrix[rowIndex][colIndex] === 1 ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}
                            >
                              {adjacencyMatrix.matrix[rowIndex][colIndex] === 1 ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                          ) : (
                            <span className={adjacencyMatrix.matrix[rowIndex][colIndex] === 1 ? "text-green-600" : "text-red-600"}>
                              {adjacencyMatrix.matrix[rowIndex][colIndex]}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;