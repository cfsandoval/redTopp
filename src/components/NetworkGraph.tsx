"use client";

import React, { useState, useRef } from "react";
import Plot from "react-plotly.js";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface Node {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

interface Edge {
  source: string;
  target: string;
  value: number;
}

const NetworkGraph: React.FC = () => {
  const [graphData, setGraphData] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
  const [correlationThreshold, setCorrelationThreshold] = useState<number[]>([0.5]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          processCorrelationMatrix(json as string[][]);
          toast.success("Archivo cargado y procesado exitosamente.");
        } catch (error) {
          console.error("Error processing file:", error);
          toast.error("Error al procesar el archivo. Asegúrate de que sea un archivo Excel válido.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const processCorrelationMatrix = (matrix: string[][]) => {
    if (!matrix || matrix.length < 2) {
      setGraphData(null);
      toast.error("La matriz de correlación está vacía o tiene un formato incorrecto.");
      return;
    }

    const headers = matrix[0].slice(1); // Variable names are in the first row, starting from the second column
    const nodes: Node[] = headers.map((header) => ({ id: header, label: header }));
    const edges: Edge[] = [];

    for (let i = 1; i < matrix.length; i++) {
      const row = matrix[i];
      const sourceVar = row[0]; // First column is the source variable
      if (!sourceVar) continue;

      for (let j = 1; j < row.length; j++) {
        const targetVar = headers[j - 1];
        if (!targetVar || sourceVar === targetVar) continue; // Skip self-loops

        const correlationValue = parseFloat(row[j]);

        if (!isNaN(correlationValue) && Math.abs(correlationValue) >= correlationThreshold[0]) {
          edges.push({
            source: sourceVar,
            target: targetVar,
            value: correlationValue,
          });
        }
      }
    }
    setGraphData({ nodes, edges });
  };

  React.useEffect(() => {
    // Re-process data if threshold changes and data exists
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        processCorrelationMatrix(json as string[][]);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [correlationThreshold]);

  const generatePlotlyData = () => {
    if (!graphData) return [];

    const { nodes, edges } = graphData;

    // Create a map for quick node lookup
    const nodeMap = new Map<string, Node>();
    nodes.forEach(node => nodeMap.set(node.id, node));

    // Initialize positions for nodes (can be improved with a layout algorithm)
    // For now, a simple circular layout or random positions
    const numNodes = nodes.length;
    const radius = 0.8;
    nodes.forEach((node, i) => {
      node.x = radius * Math.cos((2 * Math.PI * i) / numNodes);
      node.y = radius * Math.sin((2 * Math.PI * i) / numNodes);
    });

    const edgeTraces = edges.map((edge, index) => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (!sourceNode || !targetNode) return null;

      const lineColor = edge.value > 0 ? "blue" : "red";
      const lineDash = Math.abs(edge.value) < 0.7 ? "dot" : "solid"; // Example: weaker correlations are dotted

      return {
        type: "scatter",
        mode: "lines",
        x: [sourceNode.x, targetNode.x, null],
        y: [sourceNode.y, targetNode.y, null],
        line: {
          width: Math.abs(edge.value) * 5, // Line thickness based on correlation strength
          color: lineColor,
          dash: lineDash,
        },
        hoverinfo: "text",
        text: `Correlación: ${edge.value.toFixed(2)}`,
        showlegend: false,
        name: `Edge ${index}`,
      };
    }).filter(Boolean);

    const nodeTrace = {
      type: "scatter",
      x: nodes.map((node) => node.x),
      y: nodes.map((node) => node.y),
      mode: "markers+text",
      marker: {
        size: 20,
        color: "rgba(100, 149, 237, 0.8)", // CornflowerBlue
        line: {
          color: "rgb(8, 48, 107)",
          width: 1,
        },
      },
      text: nodes.map((node) => node.label),
      textposition: "bottom center",
      hoverinfo: "text",
      textfont: {
        family: "Arial, sans-serif",
        size: 12,
        color: "black",
      },
      name: "Variables",
    };

    return [...edgeTraces, nodeTrace];
  };

  const layout = {
    title: "Gráfico de Red de Correlaciones",
    showlegend: false,
    hovermode: "closest",
    margin: { t: 50, b: 50, l: 50, r: 50 },
    xaxis: { showgrid: false, zeroline: false, showticklabels: false },
    yaxis: { showgrid: false, zeroline: false, showticklabels: false },
    height: 600,
    width: 800,
  };

  return (
    <Card className="w-full max-w-3xl mx-auto p-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Visualizador de Red de Correlaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4 mb-6">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="file">Cargar Matriz de Correlaciones (Excel)</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="cursor-pointer"
            />
          </div>
          <div className="flex flex-col space-y-1.5 mt-4">
            <Label htmlFor="threshold">
              Umbral de Correlación (valor absoluto): {correlationThreshold[0].toFixed(2)}
            </Label>
            <Slider
              id="threshold"
              min={0}
              max={1}
              step={0.01}
              value={correlationThreshold}
              onValueChange={setCorrelationThreshold}
              className="w-full"
            />
          </div>
        </div>

        {graphData ? (
          <div className="mt-8">
            <Plot
              data={generatePlotlyData()}
              layout={layout}
              config={{ responsive: true }}
            />
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Por favor, carga un archivo Excel para visualizar el gráfico de red.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkGraph;