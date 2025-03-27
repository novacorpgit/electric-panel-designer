
import React from 'react';
import { DiagramHookResult } from '../../hooks/useDiagram';

interface DiagramCanvasProps {
  diagramHook: DiagramHookResult;
  showGrid: boolean;
}

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ diagramHook, showGrid }) => {
  const { diagramRef, handleDrop, handleDragOver } = diagramHook;

  return (
    <div className="relative h-full w-full flex-1">
      <div 
        ref={diagramRef} 
        className="absolute inset-0 gojs-diagram"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
      {showGrid && 
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
          Grid: On
        </div>
      }
    </div>
  );
};

export default DiagramCanvas;
