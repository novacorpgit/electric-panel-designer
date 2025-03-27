
import React, { useState } from 'react';
import DiagramSidebar from './DiagramSidebar';
import DiagramCanvas from './diagram/DiagramCanvas';
import DiagramMenubar from './diagram/DiagramMenubar';
import { useDiagram } from '../hooks/useDiagram';
import { toast } from './ui/use-toast';

interface PanelboardDesignerProps {
  // Add any props here
}

const PanelboardDesigner: React.FC<PanelboardDesignerProps> = () => {
  const [allowTopLevel, setAllowTopLevel] = useState(false);
  const [showDistances, setShowDistances] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  
  const diagramHook = useDiagram(showGrid, showDistances);
  
  const handleAddEnclosure = () => {
    if (!diagramHook.diagramInstance || !diagramHook.diagramReady) return;
    
    diagramHook.diagramInstance.startTransaction("Create new enclosure");
    
    // Create a unique key for the new enclosure
    const enclosureKey = `Enclosure-${Date.now()}`;
    
    // Add the enclosure as a group
    diagramHook.diagramInstance.model.addNodeData({
      key: enclosureKey,
      isGroup: true,
      size: "500 700",
      loc: "50 50"  // Offset from existing enclosures
    });
    
    diagramHook.diagramInstance.commitTransaction("Create new enclosure");
    
    toast({
      title: "Enclosure Added",
      description: "A new electrical enclosure has been added to the diagram."
    });
  };
  
  return (
    <div className="flex h-full w-full">
      <div className="w-64 border-r bg-gray-50">
        <DiagramSidebar 
          allowTopLevel={allowTopLevel}
          setAllowTopLevel={setAllowTopLevel}
          showDistances={showDistances}
          setShowDistances={setShowDistances}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
        />
      </div>
      <div className="flex flex-col flex-1 h-full">
        <DiagramMenubar
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showDistances={showDistances}
          setShowDistances={setShowDistances}
          onAddEnclosure={handleAddEnclosure}
        />
        <DiagramCanvas 
          diagramHook={diagramHook}
          showGrid={showGrid}
        />
      </div>
    </div>
  );
};

export default PanelboardDesigner;
