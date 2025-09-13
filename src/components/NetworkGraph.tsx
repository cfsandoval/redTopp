import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { showToast } from '@/utils/toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

// ... (previous interface definitions remain the same)

const NetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [networkState, setNetworkState] = useState<NetworkSimulationState>({
    total_nodes: 0,
    compromised_nodes: 0,
    network_health: 100
  });

  // ... (previous methods remain the same)

  const renderNodeDetails = () => {
    if (!selectedNode) return null;

    const threatBadgeVariant = {
      'low': 'default' as const,
      'medium': 'secondary' as const,
      'high': 'destructive' as const
    };

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNode?.name}</DialogTitle>
            <DialogDescription>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <p>Type: {selectedNode?.type}</p>
                  <p>Group: {selectedNode?.group}</p>
                  <p>Health: {selectedNode?.health?.toFixed(2)}%</p>
                  <p>Radius: {selectedNode?.radius.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Threat Level:</span>
                  <Badge 
                    variant={threatBadgeVariant[selectedNode?.threat_level || 'low']}
                  >
                    {selectedNode?.threat_level?.toUpperCase()}
                  </Badge>
                  {selectedNode?.is_compromised && (
                    <Badge variant="destructive">COMPROMISED</Badge>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  };

  // ... (rest of the component remains the same)

  return (
    <div className="network-graph-container">
      {/* ... existing code ... */}
      {renderNodeDetails()}
    </div>
  );
};

export default NetworkGraph;