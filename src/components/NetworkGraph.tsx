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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Settings, Zap, Cpu, Radiation, Shield, Play, Pause, BarChart2, Network
} from 'lucide-react';

// Enhanced type definitions
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

  const toggleSimulation = useCallback(() => {
    setSimulationRunning(prev => {
      const newState = !prev;
      
      if (newState) {
        toast.success("Network Simulation Started", {
          description: `Simulating with ${simulationConfig.simulationSpeed}x speed`
        });
      } else {
        toast.info("Network Simulation Paused");
      }
      
      return newState;
    });
  }, [simulationConfig.simulationSpeed]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (simulationRunning) {
      intervalId = setInterval(() => {
        setSimulationMetrics(prev => {
          const newFailedNodes = Math.floor(
            prev.totalNodes * simulationConfig.failureProbability
          );

          return {
            ...prev,
            failedNodes: newFailedNodes,
            activeNodes: prev.totalNodes - newFailedNodes,
            networkStability: 100 - (newFailedNodes / prev.totalNodes * 100),
            responseTime: 10 * (1 + simulationConfig.networkStressLevel / 100),
            securityBreachRisk: simulationConfig.attackSimulation 
              ? simulationConfig.networkStressLevel / 10 
              : 0
          };
        });
      }, 1000 / simulationConfig.simulationSpeed);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [simulationRunning, simulationConfig]);

  const renderConfigModal = () => (
    <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Network Simulation Configuration</DialogTitle>
          <DialogDescription>
            Customize your network simulation parameters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Simulation Speed */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label>Simulation Speed</Label>
            <Slider 
              value={[simulationConfig.simulationSpeed]}
              onValueChange={(value) => setSimulationConfig(prev => ({
                ...prev, 
                simulationSpeed: value[0]
              }))}
              max={10}
              step={1}
              className="col-span-3"
            />
          </div>

          {/* Failure Probability */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label>Failure Probability</Label>
            <Slider 
              value={[simulationConfig.failureProbability * 100]}
              onValueChange={(value) => setSimulationConfig(prev => ({
                ...prev, 
                failureProbability: value[0] / 100
              }))}
              max={100}
              step={1}
              className="col-span-3"
            />
          </div>

          {/* Attack Simulation Toggle */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label>Attack Simulation</Label>
            <Switch 
              checked={simulationConfig.attackSimulation}
              onCheckedChange={(checked) => setSimulationConfig(prev => ({
                ...prev, 
                attackSimulation: checked
              }))}
              className="col-span-3"
            />
          </div>

          {/* Node Failure Mode */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label>Failure Mode</Label>
            <select 
              value={simulationConfig.nodeFailureMode}
              onChange={(e) => setSimulationConfig(prev => ({
                ...prev, 
                nodeFailureMode: e.target.value as NetworkSimulationConfig['nodeFailureMode']
              }))}
              className="col-span-3 p-2 border rounded"
            >
              <option value="random">Random</option>
              <option value="targeted">Targeted</option>
              <option value="cascading">Cascading</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
            Close
          </Button>
          <Button onClick={() => setIsConfigModalOpen(false)}>
            Apply Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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
          <div className="grid grid-cols-3 gap-4">
            {/* Active Nodes */}
            <div className="bg-green-50 p-3 rounded-lg flex flex-col">
              <h4 className="font-bold flex items-center mb-2">
                <Cpu className="h-4 w-4 mr-2" /> Active Nodes
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  {simulationMetrics.activeNodes}
                </span>
                <span className="text-sm text-gray-500">
                  / {simulationMetrics.totalNodes}
                </span>
              </div>
            </div>

            {/* Failed Nodes */}
            <div className="bg-red-50 p-3 rounded-lg flex flex-col">
              <h4 className="font-bold flex items-center mb-2">
                <Radiation className="h-4 w-4 mr-2" /> Failed Nodes
              </h4>
              <span className="text-lg font-semibold">
                {simulationMetrics.failedNodes}
              </span>
            </div>

            {/* Network Stability */}
            <div className="bg-blue-50 p-3 rounded-lg flex flex-col">
              <h4 className="font-bold flex items-center mb-2">
                <Shield className="h-4 w-4 mr-2" /> Network Stability
              </h4>
              <div className="flex items-center">
                <span className="text-lg font-semibold mr-2">
                  {simulationMetrics.networkStability.toFixed(2)}%
                </span>
                <BarChart2 className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </div>
        </ShadcnCardContent>
      </ShadcnCard>

      {renderConfigModal()}
    </div>
  );
};

export default NetworkGraph;