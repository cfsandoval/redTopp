"use client";

import React, { useState } from 'react';
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

const DEFAULT_CONFIG: NetworkSimulationConfig = {
  width: 800,
  height: 600,
  nodeRadius: 20
};

const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  nodes: initialNodes = [], 
  links: initialLinks = [], 
  config = DEFAULT_CONFIG 
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [groups, setGroups] = useState<NodeGroup[]>([]);
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newNodeGroup, setNewNodeGroup] = useState<string>('');

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
      type: 'workstation',
      group: newNodeGroup || undefined
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setNewNodeName(''); // Reset input
    showToast.success(`New node added: ${newNode.name}`);
  };

  // Rest of the component remains the same...

  return (
    <div className="network-graph-container space-y-4">
      {/* Component content */}
      <div className="flex space-x-2">
        <Input 
          placeholder="Enter new node name" 
          value={newNodeName}
          onChange={(e) => setNewNodeName(e.target.value)}
        />
        <Button onClick={handleAddNode}>Add Node</Button>
      </div>
    </div>
  );
};

export default NetworkGraph;