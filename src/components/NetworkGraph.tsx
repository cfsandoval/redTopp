"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Card as ShadcnCard, 
  CardContent as ShadcnCardContent, 
  CardHeader as ShadcnCardHeader, 
  CardTitle as ShadcnCardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Settings, Zap, Cpu, Radiation, Shield, Play, Pause, BarChart2, Network, 
  Layers, Share2, Download, Upload, RefreshCw, Microscope
} from 'lucide-react';
import * as d3 from 'd3';

// Enhanced type definitions with x and y coordinates
interface NetworkNode {
  id: string;
  status: 'active' | 'failed' | 'recovering';
  connections: string[];
  type: 'server' | 'router' | 'endpoint';
  x?: number;
  y?: number;
}

interface NetworkSimulationConfig {
  simulationSpeed: number;
  failureProbability: number;
  recoveryRate: number;
  attackSimulation: boolean;
  nodeFailureMode: 'random' | 'targeted' | 'cascading';
  networkStressLevel: number;
}

interface SimulationMetrics {
  totalNodes: number;
  activeNodes: number;
  failedNodes: number;
  networkStability: number;
  responseTime: number;
  securityBreachRisk: number;
}

const NetworkGraph: React.FC = () => {
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);

  const [simulationConfig, setSimulationConfig] = useState<NetworkSimulationConfig>({
    simulationSpeed: 5,
    failureProbability: 0.1,
    recoveryRate: 0.2,
    attackSimulation: false,
    nodeFailureMode: 'random',
    networkStressLevel: 50
  });

  const [simulationMetrics, setSimulationMetrics] = useState<SimulationMetrics>({
    totalNodes: 50,
    activeNodes: 50,
    failedNodes: 0,
    networkStability: 100,
    responseTime: 10,
    securityBreachRisk: 0
  });

  // Simulation toggle logic
  const toggleSimulation = useCallback(() => {
    setSimulationRunning(prev => {
      const newState = !prev;
      
      if (newState) {
        toast.success("Network Simulation Started", {
          description: `Simulating with 5x speed`
        });
      } else {
        toast.info("Network Simulation Paused");
      }
      
      return newState;
    });
  }, []);

  // Render method
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <ShadcnCard className="p-6 shadow-lg">
        <ShadcnCardHeader className="flex flex-row items-center justify-between">
          <ShadcnCardTitle className="flex items-center">
            <Network className="h-6 w-6 mr-2" /> 
            Network Simulation Dashboard
          </ShadcnCardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsConfigModalOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" /> Configure
            </Button>
            <Button 
              variant={simulationRunning ? "destructive" : "default"}
              onClick={toggleSimulation}
            >
              {simulationRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" /> Start
                </>
              )}
            </Button>
          </div>
        </ShadcnCardHeader>

        <ShadcnCardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-bold flex items-center mb-2">
                <Cpu className="h-4 w-4 mr-2" /> Active Nodes
              </h4>
              <p>{simulationMetrics.activeNodes} / {simulationMetrics.totalNodes}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="font-bold flex items-center mb-2">
                <Radiation className="h-4 w-4 mr-2" /> Failed Nodes
              </h4>
              <p>{simulationMetrics.failedNodes}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-bold flex items-center mb-2">
                <Shield className="h-4 w-4 mr-2" /> Network Stability
              </h4>
              <p>{simulationMetrics.networkStability.toFixed(2)}%</p>
            </div>
          </div>
        </ShadcnCardContent>
      </ShadcnCard>
    </div>
  );
};

export default NetworkGraph;