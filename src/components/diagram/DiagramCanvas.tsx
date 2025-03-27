
import React, { useEffect } from 'react';
import { DiagramHookResult } from '../../hooks/useDiagram';

interface DiagramCanvasProps {
  diagramHook: DiagramHookResult;
  showGrid: boolean;
}

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ diagramHook, showGrid }) => {
  const { diagramRef, handleDrop, handleDragOver, diagramInstance, diagramReady } = diagramHook;

  useEffect(() => {
    if (diagramReady && diagramInstance) {
      // Create default enclosure if none exists
      if (diagramInstance.model.nodeDataArray.length === 0) {
        createDefaultEnclosure();
      }
    }
  }, [diagramReady, diagramInstance]);

  const createDefaultEnclosure = () => {
    if (!diagramInstance) return;
    
    diagramInstance.startTransaction("Create default enclosure");
    
    // Add the default enclosure as a group
    diagramInstance.model.addNodeData({
      key: "Electrical Enclosure",
      isGroup: true,
      size: "500 700",
      loc: "0 0"
    });
    
    diagramInstance.commitTransaction("Create default enclosure");
  };

  return (
    <div className="relative h-full w-full flex-1">
      <div 
        ref={diagramRef} 
        className="absolute inset-0 gojs-diagram"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/80 text-gray-800 text-xs font-medium rounded">
        <span className="text-xs text-gray-600">Components auto-adjust within enclosures due to the GridLayout in the group template</span>
      </div>
      {showGrid && 
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
          Grid: On
        </div>
      }
    </div>
  );
};

export default DiagramCanvas;
