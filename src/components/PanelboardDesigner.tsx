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
        const go = await initializeGoJS();
        setGoInstance(go);
        
        if (diagramRef.current) {
          setupDiagram(go);
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
        image: getImagePathForType(nodeInfo.type)
      };
      
      console.log("Added new component with data:", newNodeData);
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
    
    const myDiagram = new go.Diagram(diagramRef.current, {
      grid: new go.Panel('Grid', { 
        gridCellSize: CellSize,
        visible: true,
        gridStyle: go.Panel.Uniform,
        className: 'grid-panel'
      })
        .add(
          new go.Shape('LineH', { 
            stroke: 'rgba(0, 0, 0, 0.2)',  // Darker lines for better visibility
            strokeWidth: 0.8  // Thicker lines
          }),
          new go.Shape('LineV', { 
            stroke: 'rgba(0, 0, 0, 0.2)',  // Darker lines for better visibility
            strokeWidth: 0.8  // Thicker lines
          })
        ),
      'draggingTool.isGridSnapEnabled': true,
      'draggingTool.gridSnapCellSpot': go.Spot.Center,
      'resizingTool.isGridSnapEnabled': true,
      'animationManager.isEnabled': true,
      'undoManager.isEnabled': true,
      'initialContentAlignment': go.Spot.Center,
      "allowDrop": true
    });
    
    setDiagramInstance(myDiagram);

    function highlightGroup(grp: any, show: boolean) {
      if (!grp) return false;
      const tool = grp.diagram.toolManager.draggingTool;
      grp.isHighlighted = show && grp.canAddMembers(tool.draggingParts);
      return grp.isHighlighted;
    }

    const nodeTemplates = createNodeTemplates(go, CellSize, highlightGroup);
    
    myDiagram.nodeTemplate = nodeTemplates.get("default");
    
    nodeTemplates.forEach((template, key) => {
      if (key !== "default") {
        myDiagram.nodeTemplateMap.add(key, template);
      }
    });

    myDiagram.groupTemplate = createGroupTemplate(go, CellSize, highlightGroup);

    myDiagram.linkTemplate = createLinkTemplate(go);

    myDiagram.commandHandler.memberValidation = (grp: any, node: any) => {
      if (grp instanceof go.Group && node instanceof go.Group) return false;
      return true;
    };

    myDiagram.mouseDragOver = (e: any) => {
      if (!allowTopLevel) {
        const tool = e.diagram.toolManager.draggingTool;
        if (!tool.draggingParts.all((p: any) => p instanceof go.Group || (!p.isTopLevel && tool.draggingParts.has(p.containingGroup)))) {
          e.diagram.currentCursor = 'not-allowed';
        } else {
          e.diagram.currentCursor = '';
        }
      }
    };

    myDiagram.mouseDrop = (e: any) => {
      if (allowTopLevel) {
        if (!e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true)) {
          e.diagram.currentTool.doCancel();
        }
      } else {
        if (
          !e.diagram.selection.all((p: any) => {
            return p instanceof go.Group || (!p.isTopLevel && p.containingGroup.isSelected);
          })
        ) {
          e.diagram.currentTool.doCancel();
        }
      }
    };

    myDiagram.model = new go.GraphLinksModel([
      { key: 'Panel A', isGroup: true, pos: '0 0', size: '250 350' },
      { key: 'Panel B', isGroup: true, pos: '300 0', size: '250 350' },
      { key: 'Panel C', isGroup: true, pos: '0 400', size: '550 250' }
    ]);
    
    setTimeout(() => {
      setDiagramReady(true);
    }, 500);
  };

  const getDefaultSizeForType = (type: string): string => {
    switch (type) {
      case "NSX250":
        return "70 90";
      case "Schneider250A":
        return "80 120";
      case "Busbar":
        return "150 30";
      case "CircuitBreaker":
        return "50 80";
      case "Transformer":
        return "100 100";
      default:
        return "50 80";
    }
  };

  const getImagePathForType = (type: string): string => {
    switch (type) {
      case "NSX250":
        return "/lovable-uploads/b79bb85b-d7f1-41eb-9957-1af1528aaa78.png";
      case "Schneider250A":
        return "/lovable-uploads/schneider250a.png";
      case "Busbar":
        return "/lovable-uploads/copper-busbar.png";
      case "CircuitBreaker":
        return "/lovable-uploads/circuit-breaker.png";
      case "Transformer":
        return "/lovable-uploads/transformer.png";
      default:
        return "";
    }
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
        <div className="flex-1 relative">
          <div 
            ref={diagramRef} 
            className="absolute inset-0 bg-gray-50"
            style={{ border: '1px solid #e2e8f0' }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          />
        </div>
      </div>
    </div>
  );
};

export default PanelboardDesigner;
