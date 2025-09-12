"use client";

import React, { useState, useCallback, useEffect } from 'react';
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
  Settings, Zap, Cpu, Radiation, Shield
} from 'lucide-react';

// Separate interfaces for configuration and metrics
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
  // Initial state with default values
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationConfig, setSimulationConfig] = useState<NetworkSimulationConfig>({
    simulationSpeed: 5,
    failureProbability: 0.1,
    recoveryRate: 0.2,
    attackSimulation: false,
    nodeFailureMode: 'random',
    networkStressLevel: 50
  });
  const [simulationMetrics, setSimulationMetrics] = useState<SimulationMetrics>({
    totalNodes: 100,
    activeNodes: 100,
    failedNodes: 0,
    networkStability: 100,
    responseTime: 10,
    securityBreachRisk: 0
  });

  // Simulation toggle logic
  const toggleSimulation = () => {
    if (simulationRunning) {
      setSimulationRunning(false);
      toast.info("Network simulation stopped");
    } else {
      setSimulationRunning(true);
      toast.success("Network simulation started");

      const simulationInterval = setInterval(() => {
        // Use metrics.totalNodes instead of config
        const newFailedNodes = Math.floor(
          simulationMetrics.totalNodes * simulationConfig.failureProbability
        );

        setSimulationMetrics(prev => ({
          ...prev,
          failedNodes: newFailedNodes,
          activeNodes: prev.totalNodes - newFailedNodes,
          networkStability: 100 - (newFailedNodes / prev.totalNodes * 100),
          responseTime: 10 * (1 + simulationConfig.networkStressLevel / 100),
          securityBreachRisk: simulationConfig.attackSimulation 
            ? simulationConfig.networkStressLevel / 10 
            : 0
        }));
      }, 1000 / simulationConfig.simulationSpeed);

      return () => clearInterval(simulationInterval);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <ShadcnCard className="p-6 shadow-lg">
        <ShadcnCardHeader className="flex flex-row items-center justify-between">
          <ShadcnCardTitle>Network Simulation Dashboard</ShadcnCardTitle>
          <Button 
            variant={simulationRunning ? "destructive" : "default"}
            onClick={toggleSimulation}
          >
            {simulationRunning ? "Stop Simulation" : "Start Simulation"}
          </Button>
        </ShadcnCardHeader>

        <ShadcnCardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-bold flex items-center">
                <Cpu className="h-4 w-4 mr-2" /> Active Nodes
              </h4>
              <p>{simulationMetrics.activeNodes} / {simulationMetrics.totalNodes}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="font-bold flex items-center">
                <Radiation className="h-4 w-4 mr-2" /> Failed Nodes
              </h4>
              <p>{simulationMetrics.failedNodes}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-bold flex items-center">
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