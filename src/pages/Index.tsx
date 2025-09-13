"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import NetworkGraph from "@/components/NetworkGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NetworkSimulationConfig } from "@/types/network";
import { loadMicmacData, MicmacData } from "@/utils/micmacLoader";
import { useState, useEffect } from "react";

const defaultConfig: NetworkSimulationConfig = {
  width: 1000,
  height: 700,
  nodeRadius: 30
};

const Index = () => {
  const [micmacData, setMicmacData] = useState<MicmacData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdjacencyMatrix, setShowAdjacencyMatrix] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await loadMicmacData();
        setMicmacData(data);
      } catch (error) {
        console.error('Error loading MICMAC data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-lg font-medium">Cargando matriz de correlaciones MICMAC...</div>
        </div>
      </div>
    );
  }

  if (!micmacData || micmacData.nodes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-lg font-medium">No se pudo cargar la matriz de correlaciones MICMAC</div>
          <div className="text-sm text-gray-600 mt-2">Verifique que el archivo Excel esté disponible</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="w-full mb-4">
          <CardHeader>
            <CardTitle className="text-2xl">Simulador de Topología de Red - Análisis MICMAC</CardTitle>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Visualización de correlaciones entre {micmacData?.variables?.length || 0} variables de gestión pública
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                variant={showAdjacencyMatrix ? "outline" : "default"}
                onClick={() => setShowAdjacencyMatrix(false)}
              >
                Vista de Red
              </Button>
              <Button 
                variant={showAdjacencyMatrix ? "default" : "outline"}
                onClick={() => setShowAdjacencyMatrix(true)}
              >
                Matriz de Adyacencia
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!showAdjacencyMatrix ? (
              <NetworkGraph 
                nodes={micmacData.nodes} 
                links={micmacData.links} 
                config={defaultConfig} 
              />
            ) : (
              <div className="overflow-auto max-h-96">
                <table className="w-full text-xs border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-1 bg-gray-100 sticky left-0"></th>
                      {micmacData?.variables?.map((variable, index) => (
                        <th key={index} className="border border-gray-300 p-1 bg-gray-100 min-w-8 text-center">
                          {index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {micmacData?.correlationMatrix?.map((row, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 p-1 bg-gray-100 sticky left-0 font-medium text-xs max-w-48">
                          {i + 1}. {micmacData?.variables?.[i]?.substring(0, 50) || 'Variable'}...
                        </td>
                        {row.map((value, j) => (
                          <td 
                            key={j} 
                            className={`border border-gray-300 p-1 text-center ${
                              value === 3 ? 'bg-red-200' : 
                              value === 2 ? 'bg-yellow-200' : 
                              value === 1 ? 'bg-green-200' : 
                              'bg-white'
                            }`}
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Estadísticas de Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {micmacData?.nodes?.map((node, index) => (
                <div key={node.id} className="border rounded p-3">
                  <div className="font-medium text-sm mb-2">{node.name}</div>
                  <div className="text-xs text-gray-600">
                    <div>Influencia: {node.influence}</div>
                    <div>Dependencia: {node.dependence}</div>
                    <div>Tipo: {node.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 flex justify-center">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;