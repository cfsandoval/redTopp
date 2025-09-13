import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { showToast } from '@/utils/toast';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  radius: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node | string;
  target: Node | string;
  strength: number;
}

const NetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  const generateNetwork = () => {
    const nodeCount = Math.floor(Math.random() * 20) + 10;
    const newNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      group: Math.floor(Math.random() * 3),
      radius: Math.random() * 20 + 5
    }));

    const newLinks: Link[] = newNodes.flatMap((node, i) => 
      newNodes
        .filter((_, j) => j > i && Math.random() < 0.3)
        .map(target => ({
          source: node.id,
          target: target.id,
          strength: Math.random()
        }))
    );

    setNodes(newNodes);
    setLinks(newLinks);
    showToast.success(`Generated network with ${nodeCount} nodes`);
  };

  useEffect(() => {
    generateNetwork();
  }, []);

  useEffect(() => {
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
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => d.strength * 3);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => {
        const colors = ["#1f77b4", "#ff7f0e", "#2ca02c"];
        return colors[d.group];
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

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return (
    <div className="network-graph-container">
      <div className="flex justify-center mb-4">
        <button 
          onClick={generateNetwork}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Regenerate Network
        </button>
      </div>
      <svg ref={svgRef} className="mx-auto border border-gray-300"></svg>
    </div>
  );
};

export default NetworkGraph;