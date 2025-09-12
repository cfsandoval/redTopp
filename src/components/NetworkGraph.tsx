"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NetworkGraph: React.FC = () => {
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<'circular' | 'random'>('circular');
  const [graphData, setGraphData] = useState(null);

  const exportGraphData = () => {
    if (!graphData) {
      toast.error("No graph data to export");
      return;
    }
    // Existing export logic
  };

  return (
    <Card className="w-full max-w-3xl mx-auto p-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Network Correlation Visualizer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => setLayoutAlgorithm(
              layoutAlgorithm === 'circular' ? 'random' : 'circular'
            )}
          >
            Switch Layout: {layoutAlgorithm}
          </Button>
          <Button 
            variant="secondary" 
            onClick={exportGraphData}
            disabled={!graphData}
          >
            Export Graph Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkGraph;