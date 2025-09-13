import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { showToast } from '@/utils/toast';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Shield, 
  BarChart2, 
  Network, 
  ShieldAlert, 
  Layers 
} from 'lucide-react';

// Existing interfaces and type definitions
interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  radius: number;
  name?: string;
  type?: 'server' | 'client' | 'router' | 'firewall' | 'switch';
  health?: number;
  threat_level?: 'low' | 'medium' | 'high';
  is_compromised?: boolean;
  criticality?: number;
  vulnerabilities?: string[];
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node | string;
  target: Node | string;
  strength: number;
  bandwidth?: number;
  latency?: number;
  connection_type?: 'lan' | 'wan' | 'vpn' | 'wireless';
}

interface NetworkSimulationState {
  total_nodes: number;
  compromised_nodes: number;
  network_health: number;
  attack_surface: number;
  defense_score: number;
  last_simulation_timestamp?: number;
}

interface NetworkConfiguration {
  name: string;
  nodes: Node[];
  links: Link[];
  state: NetworkSimulationState;
}

// Add NetworkAnalytics utility
const NetworkAnalytics = {
  calculateAttackSurface: (nodes: Node[], links: Link[]) => {
    const vulnerableNodes = nodes.filter(node => 
      node.vulnerabilities && node.vulnerabilities.length > 0
    ).length;
    const vulnerableConnections = links.filter(() => Math.random() < 0.2).length;
    
    return (vulnerableNodes + vulnerableConnections) / (nodes.length + links.length) * 100;
  },
  
  calculateDefenseScore: (nodes: Node[]) => {
    const firewalls = nodes.filter(node => node.type === 'firewall');
    const secureNodes = nodes.filter(node => 
      node.health && node.health > 70 && !node.is_compromised
    );
    
    return (firewalls.length + secureNodes.length) / nodes.length * 100;
  }
};

const NetworkGraph: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [networkState, setNetworkState] = useState<NetworkSimulationState>({
    total_nodes: 0,
    compromised_nodes: 0,
    network_health: 100,
    attack_surface: 0,
    defense_score: 100
  });
  const [savedConfigurations, setSavedConfigurations] = useState<NetworkConfiguration[]>([]);

  // Simulation method with proper type handling
  const simulateCyberAttack = useCallback(() => {
    const attackedNodes: Node[] = nodes.map(node => {
      if (node.vulnerabilities && node.vulnerabilities.length > 0 && Math.random() < 0.3) {
        const newHealth = Math.max(0, (node.health || 0) - (Math.random() * 40));
        return {
          ...node,
          health: newHealth,
          is_compromised: newHealth < 30,
          threat_level: newHealth < 30 ? 'high' : newHealth < 70 ? 'medium' : 'low'
        };
      }
      return node;
    });

    setNodes(attackedNodes);
    
    const attackSurface = NetworkAnalytics.calculateAttackSurface(attackedNodes, links);
    const defenseScore = NetworkAnalytics.calculateDefenseScore(attackedNodes);
    
    const newNetworkState = {
      ...networkState,
      compromised_nodes: attackedNodes.filter(n => n.is_compromised).length,
      network_health: 100 * (1 - attackedNodes.filter(n => n.is_compromised).length / attackedNodes.length),
      attack_surface: attackSurface,
      defense_score: defenseScore,
      last_simulation_timestamp: Date.now()
    };

    setNetworkState(newNetworkState);
    showToast.warning('Cyber attack simulation completed');
  }, [nodes, links, networkState]);

  // Load network configuration method
  const loadNetworkConfiguration = (config: NetworkConfiguration) => {
    setNodes(config.nodes);
    setLinks(config.links);
    setNetworkState(config.state);
    showToast.info(`Loaded network configuration: ${config.name}`);
  };

  // Render network configurations
  const renderNetworkConfigurations = () => (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Saved Configurations</h3>
      {savedConfigurations.length === 0 ? (
        <p className="text-gray-500">No saved configurations</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {savedConfigurations.map((config, index) => (
            <div key={index} className="border p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{config.name}</span>
                <button 
                  onClick={() => loadNetworkConfiguration(config)}
                  className="px-2 py-1 border rounded"
                >
                  Load
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="network-graph-container space-y-4">
      {renderNetworkConfigurations()}
    </div>
  );
};

export default NetworkGraph;