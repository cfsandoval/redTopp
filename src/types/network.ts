export interface Node {
  id: string;
  name: string;
  x?: number;
  y?: number;
  type?: string;
}

export interface Link {
  source: string;
  target: string;
}

export interface NetworkSimulationConfig {
  width?: number;
  height?: number;
  nodeRadius?: number;
}

export interface NetworkGraphProps {
  nodes: Node[];
  links: Link[];
  config: NetworkSimulationConfig;
}