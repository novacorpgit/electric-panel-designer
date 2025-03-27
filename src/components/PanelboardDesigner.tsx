import React, { useEffect, useRef, useState } from 'react';
import { toast } from '../components/ui/use-toast';
import { initializeGoJS, GoJSDiagram } from '../lib/goJsInterop';
import { Button } from '../components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { 
  Server, 
  Database, 
  Cable, 
  Plug, 
  ToggleLeft, 
  CircuitBoard, 
  Ruler,
  Square 
} from 'lucide-react';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';

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

  // Effect to handle distance measurements when enabled/disabled
  useEffect(() => {
    if (diagramInstance && goInstance) {
      // Add listeners for drag events to show/hide distances during dragging
      diagramInstance.addDiagramListener("SelectionMoved", handleSelectionMoved);
      diagramInstance.addDiagramListener("SelectionCopied", handleSelectionMoved);
      diagramInstance.addDiagramListener("ExternalObjectsDropped", handleSelectionMoved);
      diagramInstance.addDiagramListener("PartResized", handleSelectionMoved);
      
      // Fix: Use correct event names for drag events in GoJS - these are the actual event names used in GoJS
      diagramInstance.addDiagramListener("ChangedSelection", handleSelectionChanged);
      diagramInstance.addDiagramListener("ChangingSelection", handleSelectionChanged);
      
      return () => {
        // Clean up event listeners with correct event names
        diagramInstance.removeDiagramListener("SelectionMoved", handleSelectionMoved);
        diagramInstance.removeDiagramListener("SelectionCopied", handleSelectionMoved);
        diagramInstance.removeDiagramListener("ExternalObjectsDropped", handleSelectionMoved);
        diagramInstance.removeDiagramListener("PartResized", handleSelectionMoved);
        
        diagramInstance.removeDiagramListener("ChangedSelection", handleSelectionChanged);
        diagramInstance.removeDiagramListener("ChangingSelection", handleSelectionChanged);
      };
    }
  }, [diagramInstance, goInstance, showDistances]);

  // Add a selection change event handler
  const handleSelectionChanged = () => {
    // Check if any parts are selected - this can help determine if dragging might be occurring
    if (diagramInstance && diagramInstance.selection.count > 0) {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  // Effect to update distances when dragging state changes
  useEffect(() => {
    if (diagramInstance && goInstance) {
      if (isDragging && showDistances) {
        setupDimensioningLinks();
      } else if (!isDragging) {
        clearDistanceLinks();
      }
    }
  }, [isDragging, diagramInstance, goInstance, showDistances]);

  // Effect to handle grid visibility
  useEffect(() => {
    if (diagramInstance) {
      const gridPanel = diagramInstance.grid;
      if (gridPanel) {
        gridPanel.visible = showGrid;
        diagramInstance.requestUpdate();
      }
    }
  }, [showGrid, diagramInstance]);

  const handleDragStarted = () => {
    setIsDragging(true);
  };

  const handleDragFinished = () => {
    setIsDragging(false);
  };

  const handleSelectionMoved = () => {
    if (isDragging && showDistances) {
      // Update distance measurements during dragging
      setupDimensioningLinks();
    }
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

    // Define the node template for normal components
    myDiagram.nodeTemplate = new go.Node('Auto', {
      resizable: true,
      resizeObjectName: 'SHAPE',
      locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
      mouseDragEnter: (e: any, node: any) => {
        e.handled = true;
        node.findObject('SHAPE').fill = 'red';
        e.diagram.currentCursor = 'not-allowed';
        highlightGroup(node.containingGroup, false);
      },
      mouseDragLeave: (e: any, node: any) => node.updateTargetBindings(),
      mouseDrop: (e: any, node: any) => node.diagram.currentTool.doCancel()
    })
      .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
      .add(
        new go.Panel("Vertical")
          .add(
            new go.Panel("Spot")
              .add(
                new go.Shape('Rectangle', {
                  name: 'SHAPE',
                  fill: 'white',
                  stroke: '#34495e',
                  strokeWidth: 1.5,
                  minSize: CellSize,
                  desiredSize: CellSize,
                  shadowVisible: true,
                  shadowOffset: new go.Point(2, 2),
                  shadowBlur: 3,
                  shadowColor: 'rgba(0, 0, 0, 0.2)'
                })
                  .bind('fill', 'color')
                  .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
              )
              .add(
                new go.Picture({
                  name: "IMAGE",
                  desiredSize: new go.Size(60, 80),
                  imageStretch: go.GraphObject.Uniform,
                  alignment: go.Spot.Center
                })
                  .bind("source", "image")
                  .bind("visible", "image", (img) => !!img)
              ),
            new go.TextBlock({
              margin: new go.Margin(3, 0, 0, 0),
              font: 'bold 11px Inter, sans-serif',
              stroke: '#333' // Black text for all components
            }).bind('text', 'label')
          )
      );

    // Special node template for NSX250
    const nsx250Template = new go.Node('Auto', {
      resizable: true,
      resizeObjectName: 'SHAPE',
      locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
      mouseDragEnter: (e: any, node: any) => {
        e.handled = true;
        node.findObject('SHAPE').fill = 'red';
        e.diagram.currentCursor = 'not-allowed';
        highlightGroup(node.containingGroup, false);
      },
      mouseDragLeave: (e: any, node: any) => node.updateTargetBindings(),
      mouseDrop: (e: any, node: any) => node.diagram.currentTool.doCancel()
    })
      .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
      .add(
        new go.Panel("Vertical")
          .add(
            new go.Panel("Spot")
              .add(
                new go.Shape('Rectangle', {
                  name: 'SHAPE',
                  fill: 'white',
                  stroke: '#34495e',
                  strokeWidth: 1.5,
                  minSize: new go.Size(70, 90),
                  desiredSize: new go.Size(70, 90),
                  shadowVisible: true,
                  shadowOffset: new go.Point(2, 2),
                  shadowBlur: 3,
                  shadowColor: 'rgba(0, 0, 0, 0.2)'
                })
                  .bind('fill', 'color')
                  .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
              )
              .add(
                new go.Picture({
                  name: "NSX_IMAGE",
                  source: "/lovable-uploads/b79bb85b-d7f1-41eb-9957-1af1528aaa78.png",
                  desiredSize: new go.Size(60, 80),
                  imageStretch: go.GraphObject.Uniform,
                  alignment: go.Spot.Center
                })
              )
              // Add the lever switch
              .add(
                new go.Panel("Vertical")
                  .add(
                    new go.Shape("Rectangle", {
                      width: 12,
                      height: 30,
                      fill: "white",
                      stroke: "black",
                      strokeWidth: 1,
                      alignment: go.Spot.Center
                    })
                  )
                  .add(
                    new go.Shape("Rectangle", {
                      width: 8,
                      height: 5,
                      fill: "red",
                      stroke: null,
                      alignment: new go.Spot(0.5, 0, 0, -2)
                    })
                  )
                  .add(
                    new go.Shape("Rectangle", {
                      width: 8,
                      height: 5,
                      fill: "green",
                      stroke: null,
                      alignment: new go.Spot(0.5, 1, 0, 2)
                    })
                  )
              ),
            new go.TextBlock({
              margin: new go.Margin(3, 0, 0, 0),
              font: 'bold 11px Inter, sans-serif',
              stroke: '#333', // Black text
              text: "NSX250"
            })
          )
      );

    // Special template for Schneider 250A chassis
    const schneider250Template = new go.Node('Auto', {
      resizable: true,
      resizeObjectName: 'SHAPE',
      locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
      mouseDragEnter: (e: any, node: any) => {
        e.handled = true;
        node.findObject('SHAPE').fill = 'red';
        e.diagram.currentCursor = 'not-allowed';
        highlightGroup(node.containingGroup, false);
      },
      mouseDragLeave: (e: any, node: any) => node.updateTargetBindings(),
      mouseDrop: (e: any, node: any) => node.diagram.currentTool.doCancel()
    })
      .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
      .add(
        new go.Panel("Vertical")
          .add(
            new go.Panel("Spot")
              .add(
                new go.Shape('Rectangle', {
                  name: 'SHAPE',
                  fill: '#6b7280', // Gray chassis color
                  stroke: '#4b5563',
                  strokeWidth: 1.5,
                  minSize: new go.Size(80, 120),
                  desiredSize: new go.Size(80, 120),
                  shadowVisible: true,
                  shadowOffset: new go.Point(2, 2),
                  shadowBlur: 3,
                  shadowColor: 'rgba(0, 0, 0, 0.2)'
                })
                  .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
              )
              // Add the mounting holes
              .add(
                new go.Panel("Horizontal", {
                  alignment: new go.Spot(0.5, 0, 0, 10)
                })
                  .add(
                    new go.Shape("Circle", {
                      width: 5,
                      height: 5,
                      fill: "black",
                      margin: new go.Margin(0, 15, 0, 15)
                    })
                  )
                  .add(
                    new go.Shape("Circle", {
                      width: 5,
                      height: 5,
                      fill: "black",
                      margin: new go.Margin(0, 15, 0, 15)
                    })
                  )
              )
              // Add the mounting holes at the bottom
              .add(
                new go.Panel("Horizontal", {
                  alignment: new go.Spot(0.5, 1, 0, -10)
                })
                  .add(
                    new go.Shape("Circle", {
                      width: 5,
                      height: 5,
                      fill: "black",
                      margin: new go.Margin(0, 15, 0, 15)
                    })
                  )
                  .add(
                    new go.Shape("Circle", {
                      width: 5,
                      height: 5,
                      fill: "black",
                      margin: new go.Margin(0, 15, 0, 15)
                    })
                  )
              )
              // Add terminals
              .add(
                new go.Panel("Vertical", {
                  alignment: new go.Spot(0.5, 0.5)
                })
                  .add(
                    new go.Shape("Rectangle", {
                      width: 40,
                      height: 8,
                      fill: "#c0c0c0",
                      stroke: "#666",
                      margin: new go.Margin(5, 0, 5, 0)
                    })
                  )
                  .add(
                    new go.Shape("Rectangle", {
                      width: 40,
                      height: 8,
                      fill: "#c0c0c0",
                      stroke: "#666",
                      margin: new go.Margin(5, 0, 5, 0)
                    })
                  )
                  .add(
                    new go.Shape("Rectangle", {
                      width: 40,
                      height: 8,
                      fill: "#c0c0c0",
                      stroke: "#666",
                      margin: new go.Margin(5, 0, 5, 0)
                    })
                  )
              )
              // Add a reset button
              .add(
                new go.Shape("Circle", {
                  width: 10,
                  height: 10,
                  fill: "red",
                  stroke: "black",
                  strokeWidth: 1,
                  alignment: new go.Spot(0.8, 0.2)
                })
              ),
            new go.TextBlock({
              margin: new go.Margin(3, 0, 0, 0),
              font: 'bold 11px Inter, sans-serif',
              stroke: '#333', // Black text
              text: "Schneider 250A"
            })
          )
      );

    // Special template for busbars with brown color
    const busbarTemplate = new go.Node('Auto', {
      resizable: true,
      resizeObjectName: 'SHAPE',
      locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
      mouseDragEnter: (e: any, node: any) => {
        e.handled = true;
        node.findObject('SHAPE').fill = 'red';
        e.diagram.currentCursor = 'not-allowed';
        highlightGroup(node.containingGroup, false);
      },
      mouseDragLeave: (e: any, node: any) => node.updateTargetBindings(),
      mouseDrop: (e: any, node: any) => node.diagram.currentTool.doCancel()
    })
      .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
      .add(
        new go.Panel("Vertical")
          .add(
            new go.Panel("Spot")
              .add(
                new go.Shape('Rectangle', {
                  name: 'SHAPE',
                  fill: '#8B4513', // Brown color for busbar
                  stroke: '#5D4037', // Darker brown for outline
                  strokeWidth: 1.5,
                  minSize: new go.Size(150, 30),
                  desiredSize: new go.Size(150, 30),
                  shadowVisible: true,
                  shadowOffset: new go.Point(2, 2),
                  shadowBlur: 3,
                  shadowColor: 'rgba(0, 0, 0, 0.3)'
                })
                  .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
              )
              // Add metallic connectors at both ends
              .add(
                new go.Shape('Rectangle', {
                  fill: '#999999', // Silver/metallic color
                  stroke: '#666666',
                  strokeWidth: 1,
                  width: 10,
                  height: 20,
                  alignment: new go.Spot(0, 0.5, 5, 0)
                })
              )
              .add(
                new go.Shape('Rectangle', {
                  fill: '#999999', // Silver/metallic color
                  stroke: '#666666',
                  strokeWidth: 1,
                  width: 10,
                  height: 20,
                  alignment: new go.Spot(1, 0.5, -5, 0)
                })
              ),
            new go.TextBlock({
              margin: new go.Margin(3, 0, 0, 0),
              font: 'bold 11px Inter, sans-serif',
              stroke: '#333' // Black text
            }).bind('text', 'label')
          )
      );

    // Circuit breaker template
    const circuitBreakerTemplate = new go.Node('Auto', {
      resizable: true,
      resizeObjectName: 'SHAPE',
      locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
      mouseDragEnter: (e: any, node: any) => {
        e.handled = true;
        node.findObject('SHAPE').fill = 'red';
        e.diagram.currentCursor = 'not-allowed';
        highlightGroup(node.containingGroup, false);
      },
      mouseDragLeave: (e: any, node: any) => node.updateTargetBindings(),
      mouseDrop: (e: any, node: any) => node.diagram.currentTool.doCancel()
    })
      .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
      .add(
        new go.Panel("Vertical")
          .add(
            new go.Panel("Spot")
              .add(
                new go.Shape('Rectangle', {
                  name: 'SHAPE',
                  fill: '#444444', // Dark gray for circuit breaker
                  stroke: '#222222',
                  strokeWidth: 1.5,
                  minSize: new go.Size(50, 80),
                  desiredSize: new go.Size(50, 80),
                  shadowVisible: true,
                  shadowOffset: new go.Point(2, 2),
                  shadowBlur: 3,
                  shadowColor: 'rgba(0, 0, 0, 0.3)'
                })
                  .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
              )
              // Add switch lever
              .add(
                new go.Panel("Vertical")
                  .add(
                    new go.Shape("Rectangle", {
                      width: 10,
                      height: 25,
                      fill: "#DDDDDD",
                      stroke: "#333333",
                      strokeWidth: 1,
                      alignment: go.Spot.Center
                    })
                  )
                  .add(
                    new go.Shape("Rectangle", {
                      width: 6,
                      height: 4,
                      fill: "red",
                      stroke: null,
                      alignment: new go.Spot(0.5, 0, 0, -2)
                    })
                  )
              ),
            new go.TextBlock({
              margin: new go.Margin(3, 0, 0, 0),
              font: 'bold 11px Inter, sans-serif',
              stroke: '#333' // Black text
            }).bind('text', 'label')
          )
      );

    // Transformer template
    const transformerTemplate = new go.Node('Auto', {
      resizable: true,
      resizeObjectName: 'SHAPE',
      locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
      mouseDragEnter: (e: any, node: any) => {
        e.handled = true;
        node.findObject('SHAPE').fill = 'red';
        e.diagram.currentCursor = 'not-allowed';
        highlightGroup(node.containingGroup, false);
      },
      mouseDragLeave: (e: any, node: any) => node.updateTargetBindings(),
      mouseDrop: (e: any, node: any) => node.diagram.currentTool.doCancel()
    })
      .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
      .add(
        new go.Panel("Vertical")
          .add(
            new go.Panel("Spot")
              .add(
                new go.Shape('Rectangle', {
                  name: 'SHAPE',
                  fill: '#666666', // Medium gray for transformer
                  stroke: '#333333',
                  strokeWidth: 1.5,
                  minSize: new go.Size(100, 100),
                  desiredSize: new go.Size(100, 100),
                  shadowVisible: true,
                  shadowOffset: new go.Point(2, 2),
                  shadowBlur: 3,
                  shadowColor: 'rgba(0, 0, 0, 0.3)'
                })
                  .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
              )
              // Add cooling fins
              .add(
                new go.Panel("Horizontal", {
                  alignment: new go.Spot(0.5, 1, 0, -5)
                })
                  .add(
                    new go.Shape("Rectangle", {
                      width: 5,
                      height: 15,
                      fill: "#999999",
                      stroke: "#666666",
                      margin: new go.Margin(0, 3, 0, 3)
                    })
                  )
                  .add(
                    new go.Shape("Rectangle", {
                      width: 5,
                      height: 15,
                      fill: "#999999",
                      stroke: "#666666",
                      margin: new go.Margin(0, 3, 0, 3)
                    })
                  )
                  .add(
                    new go.Shape("Rectangle", {
                      width: 5,
                      height: 15,
                      fill: "#999999",
                      stroke: "#666666",
                      margin: new go.Margin(0, 3, 0, 3)
                    })
                  )
                  .add(
                    new go.Shape("Rectangle", {
                      width: 5,
                      height: 15,
                      fill: "#999999",
                      stroke: "#666666",
                      margin: new go.Margin(0, 3, 0, 3)
                    })
                  )
              ),
            new go.TextBlock({
              margin: new go.Margin(3, 0, 0, 0),
              font: 'bold 11px Inter, sans-serif',
              stroke: '#333' // Black text
            }).bind('text', 'label')
          )
      );

    // Add the node templates to the diagram
    myDiagram.nodeTemplateMap.add("NSX250", nsx250Template);
    myDiagram.nodeTemplateMap.add("Schneider250A", schneider250Template);
    myDiagram.nodeTemplateMap.add("Busbar", busbarTemplate);
    myDiagram.nodeTemplateMap.add("CircuitBreaker", circuitBreakerTemplate);
    myDiagram.nodeTemplateMap.add("Transformer", transformerTemplate);

    function highlightGroup(grp: any, show: boolean) {
      if (!grp) return false;
      const tool = grp.diagram.toolManager.draggingTool;
      grp.isHighlighted = show && grp.canAddMembers(tool.draggingParts);
      return grp.isHighlighted;
    }

    const groupFill = 'rgba(41, 128, 185, 0.15)';
    const groupStroke = '#3498db';
    const dropFill = 'rgba(46, 204, 113, 0.3)';
    const dropStroke = '#2ecc71';

    // Group template definition
    myDiagram.groupTemplate = new go.Group({
      layerName: 'Background',
      resizable: true,
      resizeObjectName: 'SHAPE',
      locationSpot: new go.Spot(0, 0, CellSize.width / 2, CellSize.height / 2),
      mouseDragEnter: (e: any, grp: any, prev: any) => {
        if (!highlightGroup(grp, true)) e.diagram.currentCursor = 'not-allowed';
        else e.diagram.currentCursor = '';
      },
      mouseDragLeave: (e: any, grp: any, next: any) => highlightGroup(grp, false),
      mouseDrop: (e: any, grp: any) => {
        const ok = grp.addMembers(grp.diagram.selection, true);
        if (!ok) grp.diagram.currentTool.doCancel();
      },
      className: 'enclosure-panel'
    })
      .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
      .add(
        new go.Shape('Rectangle', {
          name: 'SHAPE',
          fill: groupFill,
          stroke: groupStroke,
          strokeWidth: 2,
          minSize: new go.Size(CellSize.width * 2, CellSize.height * 2),
          shadowVisible: true,
          shadowOffset: new go.Point(3, 3),
          shadowBlur: 5,
          shadowColor: 'rgba(0, 0, 0, 0.15)'
        })
          .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
          .bindObject('fill', 'isHighlighted', (h: boolean) => (h ? dropFill : groupFill))
          .bindObject('stroke', 'isHighlighted', (h: boolean) => (h ? dropStroke : groupStroke)),
        new go.TextBlock({
          alignment: go.Spot.TopLeft,
          margin: 8,
          font: 'bold 12px Inter, sans-serif',
          stroke: '#2c3e50'
        }).bind('text', 'key')
      );

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

    // Define link template for dimensioning
    myDiagram.linkTemplate = new go.Link({
      layerName: "Foreground",
      adjusting: go.Link.End,
      curve: go.Link.None,
      reshapable: true,
      resegmentable: true,
      relinkableFrom: true,
      relinkableTo: true,
      toShortLength: 4
    }).add(
      new go.Shape({ strokeWidth: 1.5, stroke: "#404040" })
    ).add(
      new go.Shape({ toArrow: "OpenTriangle", stroke: "#404040", fill: null })
    );

    // Create the model with the initial enclosures
    myDiagram.model = new go.GraphLinksModel([
      { key: 'Panel A', isGroup: true, pos: '0 0', size: '250 350' },
      { key: 'Panel B', isGroup: true, pos: '300 0', size: '250 350' },
      { key: 'Panel C', isGroup: true, pos: '0 400', size: '550 250' }
    ]);
  };

  // Function to clear distance links
  const clearDistanceLinks = () => {
    if (!diagramInstance) return;
    
    // Remove any existing distance links
    if (distanceLinks.length > 0) {
      diagramInstance.startTransaction("Remove distance links");
      distanceLinks.forEach(link => {
        if (link && diagramInstance.findLinkForData(link)) {
          diagramInstance.remove(diagramInstance.findLinkForData(link));
        }
      });
      diagramInstance.commitTransaction("Remove distance links");
      setDistanceLinks([]);
    }
  };

  // Function to create a dimensioning link between two nodes
  const createDimensioningLink = (from: any, to: any, orientation: string) => {
    if (!diagramInstance || !goInstance) return;
    
    // Calculate distance based on bounding boxes
    let distance = 0;
    let fromPt, toPt;
    
    if (orientation === "Horizontal") {
      // For horizontal links, measure the x-distance between the sides
      if (from.actualBounds.right < to.actualBounds.left) {
        // from is to the left of to
        distance = to.actualBounds.left - from.actualBounds.right;
        fromPt = new goInstance.Point(from.actualBounds.right, from.actualBounds.center
