import { useState, useEffect, useRef } from 'react';
import { toast } from '../components/ui/use-toast';
import { initializeGoJS, GoJSDiagram } from '../lib/goJsInterop';
import { createNodeTemplates, createGroupTemplate, createLinkTemplate } from '../lib/diagramTemplates';
import { setupDimensioningLinks, clearDistanceLinks } from '../lib/dimensioningUtils';

export interface DiagramHookResult {
  diagramRef: React.RefObject<HTMLDivElement>;
  goInstance: GoJSDiagram | null;
  diagramInstance: any;
  diagramReady: boolean;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  isDragging: boolean;
  setupDistanceLinks: () => void;
  clearLinks: () => void;
}

export const useDiagram = (showGrid: boolean, showDistances: boolean): DiagramHookResult => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [goInstance, setGoInstance] = useState<GoJSDiagram | null>(null);
  const [diagramInstance, setDiagramInstance] = useState<any>(null);
  const [diagramReady, setDiagramReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [distanceLinks, setDistanceLinks] = useState<any[]>([]);

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

  useEffect(() => {
    if (!diagramReady) return;
    
    if (diagramInstance && goInstance && isDragging && showDistances) {
      setupDistanceLinks();
    } else if (!isDragging && distanceLinks.length > 0) {
      clearLinks();
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

  const setupDistanceLinks = () => {
    if (!diagramReady || !diagramInstance || !goInstance) return;
    
    try {
      const links = setupDimensioningLinks(diagramInstance, goInstance);
      setDistanceLinks(links);
    } catch (error) {
      console.error("Error setting up dimensioning links:", error);
    }
  };

  const clearLinks = () => {
    if (!diagramInstance) return;
    
    try {
      clearDistanceLinks(diagramInstance);
      setDistanceLinks([]);
    } catch (error) {
      console.error("Error clearing distance links:", error);
    }
  };

  const handleSelectionChanged = () => {
    if (diagramInstance && diagramInstance.selection && diagramInstance.selection.count > 0) {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  const handleSelectionMoved = () => {
    if (!diagramReady) return;
    
    if (isDragging && showDistances && diagramInstance && goInstance) {
      setupDistanceLinks();
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
      
      let enclosureGroup = null;
      diagramInstance.nodes.each(node => {
        if (node.isGroup) {
          enclosureGroup = node;
        }
      });
      
      const newNodeData = {
        key: `${nodeInfo.type}-${Date.now()}`,
        type: nodeInfo.type,
        label: nodeInfo.data.label,
        pos: point.toString(),
        size: getDefaultSizeForType(nodeInfo.type),
        color: "white",
        image: getImagePathForType(nodeInfo.type),
        movable: true,
        resizable: true,
        group: enclosureGroup ? enclosureGroup.key : undefined
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

      myDiagram.model = new go.GraphLinksModel({
        linkKeyProperty: 'key',
        linkFromPortIdProperty: "fromPort",
        linkToPortIdProperty: "toPort",
        nodeGroupKeyProperty: "group",
        nodeIsGroupProperty: "isGroup"
      });
      
      setTimeout(() => {
        setDiagramReady(true);
      }, 500);
    }
  };

  return {
    diagramRef,
    goInstance,
    diagramInstance,
    diagramReady,
    handleDrop,
    handleDragOver,
    isDragging,
    setupDistanceLinks,
    clearLinks
  };
};
