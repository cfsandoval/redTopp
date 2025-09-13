"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import NetworkGraph from "@/components/NetworkGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Network Topology Simulator</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkGraph />
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Index;