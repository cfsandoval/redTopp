"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import NetworkGraph from "@/components/NetworkGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  // Sample network data
  const sampleNodes = [
    { id: '1', name: 'Server 1', x: 100, y: 100, type: 'server' },
    { id: '2', name: 'Workstation 1', x: 200, y: 200, type: 'workstation' },
    { id: '3', name: 'Router 1', x: 300, y: 150, type: 'router' }
  ];

  const sampleLinks = [
    { source: '1', target: '2' },
    { source: '2', target: '3' }
  ];

  const networkConfig = {
    width: 800,
    height: 400,
    nodeRadius: 15
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Network Topology Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkGraph 
            nodes={sampleNodes} 
            links={sampleLinks} 
            config={networkConfig} 
          />
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Index;