import * as XLSX from 'xlsx';
import { Node, Link } from '@/types/network';
import { micmacVariables, micmacMatrix } from '../data/micmacData';

export interface MicmacData {
  nodes: Node[];
  links: Link[];
  variables: string[];
  correlationMatrix: number[][];
}

export async function loadMicmacData(): Promise<MicmacData> {
  try {
    // Try to fetch the Excel file from the public directory first
    try {
      const response = await fetch('/matriz_correlaciones_micmac_1757742976476.xlsx');
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Extract variable names from the first row (excluding first empty cell)
        const variables: string[] = [];
        if (jsonData[0]) {
          for (let j = 1; j < jsonData[0].length; j++) {
            if (jsonData[0][j]) {
              variables.push(String(jsonData[0][j]).trim());
            }
          }
        }
        
        // Parse the correlation matrix
        const correlationMatrix: number[][] = [];
        for (let i = 1; i < jsonData.length && i <= variables.length; i++) {
          const row: number[] = [];
          if (jsonData[i]) {
            for (let j = 1; j < jsonData[i].length && j <= variables.length; j++) {
              const value = jsonData[i][j];
              row.push(typeof value === 'number' ? value : parseInt(value) || 0);
            }
          }
          if (row.length > 0) {
            correlationMatrix.push(row);
          }
        }
        
        return generateMicmacData(variables, correlationMatrix);
      }
    } catch (fetchError) {
      console.log('Could not load Excel file, using static data instead');
    }
    
    // Fallback to static data
    const variables = micmacVariables;
    const correlationMatrix = micmacMatrix;
    
    return generateMicmacData(variables, correlationMatrix);
  } catch (error) {
    console.error('Error loading MICMAC data:', error);
    throw error;
  }
}

function generateMicmacData(variables: string[], correlationMatrix: number[][]): MicmacData {
  // Generate nodes with better positioning
  const nodes: Node[] = variables.map((variable, index) => {
    const angle = 2 * Math.PI * index / variables.length;
    const radius = Math.min(300, variables.length * 15); // Adjust radius based on number of variables
    
    return {
      id: `var_${index}`,
      name: variable,
      x: Math.cos(angle) * radius + 500,
      y: Math.sin(angle) * radius + 350,
      type: getNodeType(variable),
      influence: calculateInfluence(correlationMatrix, index),
      dependence: calculateDependence(correlationMatrix, index)
    };
  });
  
  // Generate links based on correlation matrix
  const links: Link[] = [];
  const threshold = 2; // Only show correlations of 2 or higher
  
  for (let i = 0; i < correlationMatrix.length; i++) {
    for (let j = 0; j < correlationMatrix[i].length; j++) {
      if (i !== j && correlationMatrix[i][j] >= threshold) {
        links.push({
          source: `var_${i}`,
          target: `var_${j}`,
          value: correlationMatrix[i][j]
        });
      }
    }
  }
  
  return {
    nodes,
    links,
    variables,
    correlationMatrix
  };
}

function getNodeType(variable: string): string {
  // Categorize variables based on content
  const lower = variable.toLowerCase();
  
  if (lower.includes('planificación') || lower.includes('estratégica') || lower.includes('políticas')) {
    return 'server';
  } else if (lower.includes('información') || lower.includes('digital') || lower.includes('herramientas')) {
    return 'router';
  } else {
    return 'workstation';
  }
}

function calculateInfluence(matrix: number[][], nodeIndex: number): number {
  // Sum of row (how much this variable influences others)
  if (nodeIndex >= matrix.length) return 0;
  return matrix[nodeIndex].reduce((sum, value) => sum + value, 0);
}

function calculateDependence(matrix: number[][], nodeIndex: number): number {
  // Sum of column (how much this variable is influenced by others)
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i] && nodeIndex < matrix[i].length) {
      sum += matrix[i][nodeIndex];
    }
  }
  return sum;
}