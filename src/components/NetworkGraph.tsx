import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { showToast } from '@/utils/toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Download, Upload, RefreshCw, Shield, BarChart2 } from 'lucide-react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  radius: number;
  name?: string;
  type?: 'server' | 'client' | 'router' | 'firewall';
  health?: number;
  threat_level?: 'low' | 'medium' | 'high';
  is_compromised?: boolean;
  criticality?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node | string;
  target: Node | string;
  strength: number;
  bandwidth?: number;
  latency?: number;
  connection_type?: 'lan' | 'wan' | 'vpn';
}

interface NetworkSimulationState {
  total_nodes: number;
  compromised_nodes: number;
  network_health: number;
  last_simulation_timestamp?: number;
}

interface NetworkConfiguration {
  name: string;
  nodes: Node[];
  links: Link[];
  state: NetworkSimulationState;
}

const NetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [networkState, setNetworkState] = useState<NetworkSimulationState>({
    total_nodes: 0,
    compromised_nodes: 0,
    network_health: 100,
    last_simulation_timestamp: Date.now()
  });
  const [savedConfigurations, setSavedConfigurations] = useState<NetworkConfiguration[]>([]);
  const [visualizationMode, setVisualizationMode] = useState<'default' | 'threat' | 'bandwidth'>('default');

  // Advanced network generation with more sophisticated logic
  const generateNetwork = useCallback(() => {
    const nodeTypes: Node['type'][] = ['server', 'client', 'router', 'firewall'];
    const connectionTypes: Link['connection_type'][] = ['lan', 'wan', 'vpn'];
    
    const nodeCount = Math.floor(Math.random() * 30) + 15;
    
    const newNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => {
      const health = Math.random() * 100;
      return {
        id: `node-${i}`,
        group: Math.floor(Math.random() * 3),
        radius: Math.random() * 25 + 10,
        name: `Node-${i}`,
        type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
        health: health,
        threat_level: health < 30 ? 'high' : health < 70 ? 'medium' : 'low',
        is_compromised: health < 30,
        criticality: Math.random()
      };
    });

    const newLinks: Link[] = newNodes.flatMap((node, i) => 
      newNodes
        .filter((_, j) => j > i && Math.random() < 0.4)
        .map(target => ({
          source: node.id,
          target: target.id,
          strength: Math.random(),
          bandwidth: Math.random() * 1000,
          latency: Math.random() * 100,
          connection_type: connectionTypes[Math.floor(Math.random() * connectionTypes.length)]
        }))
    );

    setNodes(newNodes);
    setLinks(newLinks);
    
    const newNetworkState = {
      total_nodes: nodeCount,
      compromised_nodes: newNodes.filter(n => n.is_compromised).length,
      network_health: 100 * (1 - newNodes.filter(n => n.is_compromised).length / nodeCount),
      last_simulation_timestamp: Date.now()
    };

    setNetworkState(newNetworkState);

    showToast.success(`Generated network with ${nodeCount} nodes`);
  }, []);

  // Save current network configuration
  const saveNetworkConfiguration = () => {
    const newConfig: NetworkConfiguration = {
      name: `Network-${savedConfigurations.length + 1}`,
      nodes,
      links,
      state: networkState
    };

    setSavedConfigurations(prev => [...prev, newConfig]);
    showToast.success(`Network configuration saved: ${newConfig.name}`);
  };

  // Load saved network configuration
  const loadNetworkConfiguration = (config: NetworkConfiguration) => {
    setNodes(config.nodes);
    setLinks(config.links);
    setNetworkState(config.state);
    showToast.info(`Loaded network configuration: ${config.name}`);
  };

  // Export network configuration
  const exportNetworkConfiguration = () => {
    const configToExport = {
      nodes,
      links,
      state: networkState
    };
    
    const jsonString = JSON.stringify(configToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network_configuration.json';
    link.click();
    
    showToast.success('Network configuration exported');
  };

  // Import network configuration
  const importNetworkConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          setNodes(importedConfig.nodes);
          setLinks(importedConfig.links);
          setNetworkState(importedConfig.state);
          showToast.success('Network configuration imported');
        } catch (error) {
          showToast.error('Invalid network configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  // Visualization mode selector
  const getNodeColor = (node: Node) => {
    switch (visualizationMode) {
      case 'threat':
        const threatColors = {
          'low': '#10B981',    // Green
          'medium': '#F59E0B', // Yellow
          'high': '#EF4444'    // Red
        };
        return threatColors[node.threat_level || 'low'];
      case 'bandwidth':
        const bandwidthColors = [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Yellow
          '#EF4444'  // Red
        ];
        const colorIndex = Math.floor((node.criticality || 0) * 4);
        return bandwidthColors[colorIndex];
      default:
        const typeColors = {
          'server': '#3B82F6',
          'client': '#10B981', 
          'router': '#F59E0B',
          'firewall': '#EF4444'
        };
        return typeColors[node.type || 'client'];
    }
  };

  // Render methods and other existing logic remain the same...

  return (
    <div className="network-graph-container space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button onClick={generateNetwork} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
          </Button>
          <Button onClick={saveNetworkConfiguration} variant="outline">
            <Shield className="mr-2 h-4 w-4" /> Save Config
          </Button>
          <Button onClick={exportNetworkConfiguration} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <label className="flex items-center">
            <Input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={importNetworkConfiguration}
            />
            <Button variant="outline" asChild>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
          </label>
        </div>
        <Select 
          value={visualizationMode} 
          onValueChange={(value: typeof visualizationMode) => setVisualizationMode(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Visualization Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default View</SelectItem>
            <SelectItem value="threat">Threat Level</SelectItem>
            <SelectItem value="bandwidth">Bandwidth</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Rest of the component remains the same */}
    </div>
  );
};

export default NetworkGraph;