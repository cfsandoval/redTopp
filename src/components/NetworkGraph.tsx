import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { showToast } from '@/utils/toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  radius: number;
  name?: string;
  type?: 'server' | 'client' | 'router';
  health?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node | string;
  target: Node | string;
  strength: number;
  bandwidth?: number;
}

const NetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const generateNetworkName = () => {
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega'];
    const types = ['Network', 'Cluster', 'Grid', 'Mesh'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${types[Math.floor(Math.random() * types.length)]}`;
  };

  const generateNetwork = () => {
    const networkName = generateNetworkName();
    const nodeCount = Math.floor(Math.random() * 20) + 10;
    
    const nodeTypes: Node['type'][] = ['server', 'client', 'router'];
    
    const newNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      group: Math.floor(Math.random() * 3),
      radius: Math.random() * 20 + 5,
      name: `Node-${i}`,
      type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
      health: Math.random() * 100
    }));

    const newLinks: Link[] = newNodes.flatMap((node, i) => 
      newNodes
        .filter((_, j) => j > i && Math.random() < 0.3)
        .map(target => ({
          source: node.id,
          target: target.id,
          strength: Math.random(),
          bandwidth: Math.random() * 1000
        }))
    );

    setNodes(newNodes);
    setLinks(newLinks);
    showToast.success(`Generated ${networkName} with ${nodeCount} nodes`);
  };

  useEffect(() => {
    generateNetwork();
  }, []);

  const renderNetworkGraph = () => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;

    svg.attr("width", width).attr("height", height);

    const simulation = d3.forceSimulation<Node, Link>(nodes)
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(50)
      )
      .on("tick", ticked);

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", d => {
        const bandwidthColors = [
          "#e0f3f8", "#91bfdb", "#4575b4", 
          "#313695", "#006400", "#32cd32"
        ];
        const colorIndex = Math.floor((d.bandwidth || 0) / 200);
        return bandwidthColors[colorIndex] || "#999";
      })
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => (d.bandwidth || 10) / 50);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => {
        const typeColors = {
          'server': "#1f77b4",
          'client': "#ff7f0e", 
          'router': "#2ca02c"
        };
        return typeColors[d.type || 'client'];
      })
      .on("click", (event, d) => {
        setSelectedNode(d);
        setIsDialogOpen(true);
      })
      .call(d3.drag<SVGCircleElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    function ticked() {
      link
        .attr("x1", d => {
          const source = typeof d.source === 'string' 
            ? nodes.find(n => n.id === d.source)?.x || 0 
            : d.source.x || 0;
          return source;
        })
        .attr("y1", d => {
          const source = typeof d.source === 'string' 
            ? nodes.find(n => n.id === d.source)?.y || 0 
            : d.source.y || 0;
          return source;
        })
        .attr("x2", d => {
          const target = typeof d.target === 'string' 
            ? nodes.find(n => n.id === d.target)?.x || 0 
            : d.target.x || 0;
          return target;
        })
        .attr("y2", d => {
          const target = typeof d.target === 'string' 
            ? nodes.find(n => n.id === d.target)?.y || 0 
            : d.target.y || 0;
          return target;
        });

      node
        .attr("cx", d => d.x || 0)
        .attr("cy", d => d.y || 0);
    }

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  useEffect(() => {
    renderNetworkGraph();
  }, [nodes, links]);

  return (
    <div className="network-graph-container">
      <div className="flex justify-center mb-4 space-x-4">
        <Button onClick={generateNetwork} variant="default">
          Regenerate Network
        </Button>
      </div>
      <svg ref={svgRef} className="mx-auto border border-gray-300"></svg>

      {selectedNode && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedNode.name}</DialogTitle>
              <DialogDescription>
                <div className="space-y-2">
                  <p>Type: {selectedNode.type}</p>
                  <p>Group: {selectedNode.group}</p>
                  <p>Health: {selectedNode.health?.toFixed(2)}%</p>
                  <p>Radius: {selectedNode.radius.toFixed(2)}</p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NetworkGraph;