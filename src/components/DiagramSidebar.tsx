
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap,
  CircuitBoard,
  Cable, 
  ToggleLeft, 
  Ruler,
  Grid3X3,
  Move,
  AlertTriangle
} from 'lucide-react';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';

interface DiagramSidebarProps {
  allowTopLevel: boolean;
  setAllowTopLevel: (allow: boolean) => void;
  showDistances: boolean;
  setShowDistances: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}

const DiagramSidebar: React.FC<DiagramSidebarProps> = ({
  allowTopLevel,
  setAllowTopLevel,
  showDistances,
  setShowDistances,
  showGrid,
  setShowGrid
}) => {
  // Function to handle drag start from a component
  const handleDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    // Set the drag data with the node type and any additional data
    event.dataTransfer.setData("application/reactflow", JSON.stringify({
      type: nodeType,
      data: nodeData
    }));
    
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Components</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 text-gray-500">Circuit Breakers</h3>
            <div className="space-y-2">
              <div 
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full rounded text-left cursor-grab border border-gray-200"
                draggable
                onDragStart={(e) => handleDragStart(e, "ACB", { label: "ACB 1" })}
              >
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>ACB</span>
                <Move className="h-4 w-4 ml-auto text-gray-400" />
              </div>
              <div 
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full rounded text-left cursor-grab border border-gray-200"
                draggable
                onDragStart={(e) => handleDragStart(e, "MCB", { label: "MCB 1P" })}
              >
                <CircuitBoard className="h-5 w-5 text-gray-500" />
                <span>MCB</span>
                <Move className="h-4 w-4 ml-auto text-gray-400" />
              </div>
              <div 
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full rounded text-left cursor-grab border border-gray-200"
                draggable
                onDragStart={(e) => handleDragStart(e, "NSX250", { label: "NSX250" })}
              >
                <CircuitBoard className="h-5 w-5 text-gray-700" />
                <span>NSX250</span>
                <Move className="h-4 w-4 ml-auto text-gray-400" />
              </div>
              <div 
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full rounded text-left cursor-grab border border-gray-200"
                draggable
                onDragStart={(e) => handleDragStart(e, "Schneider250A", { label: "Schneider 250A" })}
              >
                <CircuitBoard className="h-5 w-5 text-gray-600" />
                <span>Schneider 250A</span>
                <Move className="h-4 w-4 ml-auto text-gray-400" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 text-gray-500">Power Components</h3>
            <div className="space-y-2">
              <div 
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full rounded text-left cursor-grab border border-gray-200"
                draggable
                onDragStart={(e) => handleDragStart(e, "Busbar", { label: "Bus Bar 100A" })}
              >
                <Zap className="h-5 w-5 text-amber-700" />
                <span>Busbar</span>
                <Move className="h-4 w-4 ml-auto text-gray-400" />
              </div>
              <div 
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 w-full rounded text-left cursor-grab border border-gray-200"
                draggable
                onDragStart={(e) => handleDragStart(e, "Transformer", { label: "TX 250kVA" })}
              >
                <Cable className="h-5 w-5 text-gray-500" />
                <span>Transformer</span>
                <Move className="h-4 w-4 ml-auto text-gray-400" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 text-gray-500">Controls</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowTopLevel"
                  checked={allowTopLevel}
                  onCheckedChange={(checked) => setAllowTopLevel(!!checked)}
                />
                <label
                  htmlFor="allowTopLevel"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Allow Top-Level Placement
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showDistances"
                  checked={showDistances}
                  onCheckedChange={setShowDistances}
                />
                <label
                  htmlFor="showDistances"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Ruler className="h-4 w-4 inline mr-1" />
                  Show Distances
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showGrid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
                <label
                  htmlFor="showGrid"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Grid3X3 className="h-4 w-4 inline mr-1" />
                  Show Grid
                </label>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default DiagramSidebar;
