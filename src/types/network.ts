export interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  type?: string;
  group?: string;
  influence?: number;
  dependence?: number;
  fx?: number | null; // Added for D3 fixed position
  fy?: number | null; // Added for D3 fixed position
}

export interface Link {
  source: string;
  target: string;
}

export interface NetworkSimulationConfig {
  width: number;
  height: number;
  nodeRadius: number;
}

export interface NetworkGraphProps {
  nodes?: Node[];
  links?: Link[];
  config?: NetworkSimulationConfig;
}

export interface AdjacencyMatrix {
  matrix: number[][];
  nodeNames: string[];
}

export interface NodeGroup {
  id: string;
  name: string;
  color: string;
}