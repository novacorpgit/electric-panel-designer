import React, { useEffect, useRef, useState } from 'react';
import { toast } from '../components/ui/use-toast';
import { initializeGoJS, GoJSDiagram } from '../lib/goJsInterop';
import { Button } from '../components/ui/button';
import { createNodeTemplates, createGroupTemplate, createLinkTemplate } from '../lib/diagramTemplates';
import { setupDimensioningLinks, clearDistanceLinks } from '../lib/dimensioningUtils';
import DiagramSidebar from './DiagramSidebar';
import { 
  Menubar, 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator, 
  MenubarLabel,
  MenubarGroup,
} from "@/components/ui/menubar";

interface PanelboardDesignerProps {
  // Add any props here
}

const PanelboardDesigner: React.FC<PanelboardDesignerProps> = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [allowTopLevel, setAllowTopLevel] = useState(false);
  const [goInstance, setGoInstance] = useState<GoJSDiagram | null>(null);
  const [diagramInstance, setDiagramInstance] = useState<any>(null);
  const [showDistances, setShowDistances] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [distanceLinks, setDistanceLinks] = useState<any[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [diagramReady, setDiagramReady] = useState(false);

  useEffect(() => {
    const initGoJS = async () => {
      try {
        if (diagramRef.current) {
          if (diagramInstance) {
            diagramInstance.div = null;
          }
          
          const go = await initializeGoJS();
          setGoInstance(go);
          
          if (diagramRef.current) {
            setupDiagram(go);
          }
        }
      } catch (error) {
        console.error('Failed to initialize GoJS:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize the diagram. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };

    initGoJS();

    return () => {
      if (diagramInstance) {
        diagramInstance.div = null;
      }
    };
  }, []);

  useEffect(() => {
    if (diagramInstance && goInstance) {
      const timer = setTimeout(() => {
        setDiagramReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [diagramInstance, goInstance]);

  useEffect(() => {
    if (!diagramReady) return;
    
    if (diagramInstance && goInstance) {
      diagramInstance.addDiagramListener("SelectionMoved", handleSelectionMoved);
      diagramInstance.addDiagramListener("SelectionCopied", handleSelectionMoved);
      diagramInstance.addDiagramListener("ExternalObjectsDropped", handleSelectionMoved);
      diagramInstance.addDiagramListener("PartResized", handleSelectionMoved);
      
      diagramInstance.addDiagramListener("ChangedSelection", handleSelectionChanged);
      diagramInstance.addDiagramListener("ChangingSelection", handleSelectionChanged);
      
      return () => {
        diagramInstance.removeDiagramListener("SelectionMoved", handleSelectionMoved);
        diagramInstance.removeDiagramListener("SelectionCopied", handleSelectionMoved);
        diagramInstance.removeDiagramListener("ExternalObjectsDropped", handleSelectionMoved);
        diagramInstance.removeDiagramListener("PartResized", handleSelectionMoved);
        
        diagramInstance.removeDiagramListener("ChangedSelection", handleSelectionChanged);
        diagramInstance.removeDiagramListener("ChangingSelection", handleSelectionChanged);
      };
    }
  }, [diagramInstance, goInstance, showDistances, diagramReady]);

  const handleSelectionChanged = () => {
    if (diagramInstance && diagramInstance.selection && diagramInstance.selection.count > 0) {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (!diagramReady) return;
    
    if (diagramInstance && goInstance && diagramInstance.nodes && diagramInstance.groups) {
      if (isDragging && showDistances) {
        try {
          const links = setupDimensioningLinks(diagramInstance, goInstance);
          setDistanceLinks(links);
        } catch (error) {
          console.error("Error setting up dimensioning links:", error);
        }
      } else if (!isDragging) {
        try {
          clearDistanceLinks(diagramInstance);
          setDistanceLinks([]);
        } catch (error) {
          console.error("Error clearing distance links:", error);
        }
      }
    }
  }, [isDragging, diagramInstance, goInstance, showDistances, diagramReady]);

  useEffect(() => {
    if (diagramInstance && diagramInstance.grid) {
      const gridPanel = diagramInstance.grid;
      if (gridPanel) {
        gridPanel.visible = showGrid;
        diagramInstance.requestUpdate();
      }
    }
  }, [showGrid, diagramInstance]);

  const handleSelectionMoved = () => {
    if (!diagramReady) return;
    
    if (isDragging && showDistances && diagramInstance && goInstance) {
      try {
        const links = setupDimensioningLinks(diagramInstance, goInstance);
        setDistanceLinks(links);
      } catch (error) {
        console.error("Error updating dimensioning links:", error);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!diagramInstance || !goInstance) return;
    
    const data = e.dataTransfer.getData("application/reactflow");
    if (!data) return;
    
    try {
      const nodeInfo = JSON.parse(data);
      
      const diagramRect = diagramRef.current?.getBoundingClientRect();
      if (!diagramRect) return;
      
      const x = e.clientX - diagramRect.left;
      const y = e.clientY - diagramRect.top;
      
      const point = diagramInstance.transformViewToDoc(new goInstance.Point(x, y));
      
      const newNodeData = {
        key: `${nodeInfo.type}-${Date.now()}`,
        type: nodeInfo.type,
        label: nodeInfo.data.label,
        pos: point.toString(),
        size: getDefaultSizeForType(nodeInfo.type),
        color: "white",
        image: getImagePathForType(nodeInfo.type),
        movable: true,
        resizable: true
      };
      
      console.log("Added new component with data:", newNodeData);
      diagramInstance.startTransaction("Added new component");
      diagramInstance.model.addNodeData(newNodeData);
      diagramInstance.commitTransaction("Added new component");
    } catch (error) {
      console.error("Error adding new component:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const setupDiagram = (go: GoJSDiagram) => {
    const CellSize = new go.Size(10, 10);
    
    if (diagramRef.current) {
      const myDiagram = new go.Diagram(diagramRef.current, {
        grid: new go.Panel('Grid', { 
          gridCellSize: CellSize,
          visible: showGrid,
          gridStyle: go.Panel.Uniform,
          className: 'grid-panel'
        })
          .add(
            new go.Shape('LineH', { 
              stroke: 'rgba(173, 216, 230, 0.7)', 
              strokeWidth: 0.7
            }),
            new go.Shape('LineV', { 
              stroke: 'rgba(173, 216, 230, 0.7)', 
              strokeWidth: 0.7
            })
          ),
        'draggingTool.isGridSnapEnabled': true,
        'draggingTool.gridSnapCellSpot': go.Spot.Center,
        'resizingTool.isGridSnapEnabled': true,
        'animationManager.isEnabled': true,
        'undoManager.isEnabled': true,
        'initialContentAlignment': go.Spot.Center,
        "allowDrop": true,
        "allowMove": true,
        "allowResize": true
      });
      
      myDiagram.div.className = "gojs-diagram";
      
      setDiagramInstance(myDiagram);

      function highlightGroup(grp: any, show: boolean) {
        if (!grp) return false;
        const tool = grp.diagram.toolManager.draggingTool;
        grp.isHighlighted = show && grp.canAddMembers(tool.draggingParts);
        return grp.isHighlighted;
      }

      const templateOptions = { go, CellSize, highlightGroup };
      const nodeTemplates = createNodeTemplates(templateOptions);
      
      myDiagram.nodeTemplate = nodeTemplates.get("default");
      
      nodeTemplates.forEach((template, key) => {
        if (key !== "default") {
          myDiagram.nodeTemplateMap.add(key, template);
        }
      });

      myDiagram.groupTemplate = createGroupTemplate(templateOptions);

      myDiagram.linkTemplate = createLinkTemplate(go);

      myDiagram.commandHandler.memberValidation = (grp: any, node: any) => {
        if (grp instanceof go.Group && node instanceof go.Group) return false;
        return true;
      };

      myDiagram.model = new go.GraphLinksModel([]);
      
      setTimeout(() => {
        setDiagramReady(true);
      }, 500);
    }
  };

  const getDefaultSizeForType = (type: string): string => {
    switch (type) {
      case "NSX250":
        return "70 120";
      case "Schneider250A":
        return "70 120";
      case "Busbar":
        return "150 30";
      case "ACB":
        return "70 120";
      case "MCB":
        return "50 110";
      case "Transformer":
        return "100 120";
      default:
        return "60 100";
    }
  };

  const getImagePathForType = (type: string): string => {
    return "";
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
        <Menubar className="rounded-none border-b border-t-0 border-l-0 border-r-0">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarItem>Open</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Save</MenubarItem>
              <MenubarItem>Save As</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Export</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Cut</MenubarItem>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setShowGrid(!showGrid)}>
                {showGrid ? "Hide Grid" : "Show Grid"}
              </MenubarItem>
              <MenubarItem onClick={() => setShowDistances(!showDistances)}>
                {showDistances ? "Hide Distances" : "Show Distances"}
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
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
      </div>
    </div>
  );
};

export default PanelboardDesigner;
