
import React, { useState } from 'react';
import DiagramSidebar from './DiagramSidebar';
import DiagramCanvas from './diagram/DiagramCanvas';
import DiagramMenubar from './diagram/DiagramMenubar';
import { useDiagram } from '../hooks/useDiagram';

interface PanelboardDesignerProps {
  // Add any props here
}

const PanelboardDesigner: React.FC<PanelboardDesignerProps> = () => {
  const [allowTopLevel, setAllowTopLevel] = useState(false);
  const [showDistances, setShowDistances] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  
  const diagramHook = useDiagram(showGrid, showDistances);
  
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
