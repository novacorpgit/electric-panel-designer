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
  ContextMenuTrigger,
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
  const [distanceLinks, setDistanceLinks] = useState<any[]>([]);
  const [showGrid, setShowGrid] = useState(true); // Add state for grid visibility

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
      if (showDistances) {
        setupDimensioningLinks();
        
        // Update distance measurements when nodes move
        diagramInstance.addDiagramListener("SelectionMoved", updateDistances);
        diagramInstance.addDiagramListener("PartResized", updateDistances);
      } else {
        // Remove all distance links when disabled
        clearDistanceLinks();
        
        // Remove listeners when disabled
        diagramInstance.removeDiagramListener("SelectionMoved", updateDistances);
        diagramInstance.removeDiagramListener("PartResized", updateDistances);
      }
    }
  }, [showDistances, diagramInstance, goInstance]);

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

  // Function to create dimensioning links between components
  const setupDimensioningLinks = () => {
    if (!diagramInstance || !goInstance) return;
    
    clearDistanceLinks(); // Clear existing links first
    
    // Get all nodes that are components - fix for the toArray issue
    const nodes = [];
    diagramInstance.nodes.each(node => {
      if (!node.isGroup && node.actualBounds && node.actualBounds.width > 0) {
        nodes.push(node);
      }
    });
    
    // Create dimensioning links between nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        // Create horizontal dimensioning links (if nodes are roughly aligned horizontally)
        if (Math.abs(node1.location.y - node2.location.y) < 100) {
          createDimensioningLink(node1, node2, "Horizontal");
        }
        
        // Create vertical dimensioning links (if nodes are roughly aligned vertically)
        if (Math.abs(node1.location.x - node2.location.x) < 100) {
          createDimensioningLink(node1, node2, "Vertical");
        }
      }
    }
  };

  // Function to create a dimensioning link between two nodes
  const createDimensioningLink = (from: any, to: any, orientation: "Horizontal" | "Vertical") => {
    if (!diagramInstance || !goInstance) return;
    
    const DimensioningLink = goInstance.DimensioningLink;
    if (!DimensioningLink) {
      console.error("DimensioningLink extension not available");
      return;
    }
    
    try {
      const link = new DimensioningLink({
        fromNode: from,
        toNode: to,
        category: "Dimensioning"
      });
      
      link.dimension = orientation;
      link.dimensionSegmentIndex = 0;
      link.dimensionOffset = orientation === "Horizontal" ? 20 : 20;
      link.extension1Length = 10;
      link.extension2Length = 10;
      
      // Store the link so we can remove it later
      setDistanceLinks(prev => [...prev, link]);
      
      // Add the link to the diagram
      diagramInstance.add(link);
    } catch (error) {
      console.error("Error creating dimensioning link:", error);
    }
  };

  // Function to clear all distance links
  const clearDistanceLinks = () => {
    if (!diagramInstance) return;
    
    // Remove all existing dimensioning links
    distanceLinks.forEach(link => {
      if (diagramInstance.findLinkForData(link)) {
        diagramInstance.remove(link);
      }
    });
    
    setDistanceLinks([]);
  };

  // Function to update distance measurements when components move
  const updateDistances = () => {
    if (showDistances) {
      // Clear and re-create all distance links
      setupDimensioningLinks();
    }
  };

  const handleSaveModel = () => {
    if (diagramInstance) {
      try {
        const modelJson = diagramInstance.model.toJson();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(modelJson);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "enclosure-design.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        toast({
          title: "Success",
          description: "Design saved successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save the design",
          variant: "destructive",
        });
      }
    }
  };

  const handleLoadModel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && diagramInstance && goInstance) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          diagramInstance.model = goInstance.GraphLinksModel.fromJson(json);
          toast({
            title: "Success",
            description: "Design loaded successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load the design",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleTopLevel = () => {
    setAllowTopLevel(!allowTopLevel);
    toast({
      description: `Top-level placement ${!allowTopLevel ? 'enabled' : 'disabled'}`,
    });
  };

  const toggleDistances = () => {
    setShowDistances(!showDistances);
    toast({
      description: `Distance measurements ${!showDistances ? 'enabled' : 'disabled'}`,
    });
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
    toast({
      description: `Grid ${!showGrid ? 'visible' : 'hidden'}`,
    });
  };

  const addComponent = (key: string, label: string, color: string, size: string, image?: string) => {
    if (diagramInstance && goInstance) {
      try {
        let nodeData: any = { 
          key: `${key}_${Math.floor(Math.random() * 1000)}`, 
          label, 
          color, 
          size, 
          pos: '100 100' 
        };

        // Special handling for different component types
        if (key === 'NSX250') {
          nodeData.category = 'NSX250'; // Use the special template
        } else if (key === 'SCH250A') {
          nodeData.category = 'Schneider250A'; // Use the Schneider 250A template
        } else if (key.startsWith('BB')) {
          nodeData.category = 'Busbar'; // Use busbar template
          nodeData.color = '#8B4513'; // Brown color for busbars
        } else if (key.startsWith('ACB') || key.startsWith('MCB')) {
          nodeData.category = 'CircuitBreaker'; // Use circuit breaker template
          nodeData.color = '#444444'; // Dark gray for circuit breakers
        } else if (key.startsWith('TX')) {
          nodeData.category = 'Transformer'; // Use transformer template
          nodeData.color = '#666666'; // Medium gray for transformers
        } else if (image) {
          nodeData.image = image;
        }

        diagramInstance.model.addNodeData(nodeData);
        
        const newNode = diagramInstance.findNodeForData(nodeData);
        if (newNode) {
          diagramInstance.centerRect(newNode.actualBounds);
        }

        // Update distance measurements if enabled
        if (showDistances) {
          setTimeout(() => updateDistances(), 100);
        }

        toast({
          description: `Added ${label} component`,
        });
      } catch (error) {
        console.error('Failed to add component:', error);
        toast({
          title: "Error",
          description: "Failed to add component",
          variant: "destructive",
        });
      }
    }
  };

  const addEnclosure = (name: string) => {
    if (diagramInstance) {
      try {
        const nodeData = { 
          key: name, 
          isGroup: true, 
          pos: '50 50', 
          size: '200 300' 
        };
        
        diagramInstance.model.addNodeData(nodeData);
        
        // Center on the new enclosure
        const newNode = diagramInstance.findNodeForData(nodeData);
        if (newNode) {
          diagramInstance.centerRect(newNode.actualBounds);
        }
        
        toast({
          description: `Added ${name} enclosure`,
        });
      } catch (error) {
        console.error('Failed to add enclosure:', error);
        toast({
          title: "Error",
          description: "Failed to add enclosure",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex h-full min-h-screen w-full">
      <SidebarProvider defaultOpen={false}>
        <div className="flex-1 p-4">
          <div className="mb-4">
            <Menubar className="border shadow-sm">
              <MenubarMenu>
                <MenubarTrigger className="font-medium">File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={handleSaveModel}>
                    Save Design
                  </MenubarItem>
                  <MenubarItem>
                    <label htmlFor="load-model" className="flex w-full cursor-pointer">
                      Load Design
                      <input
                        type="file"
                        id="load-model"
                        accept=".json"
                        onChange={handleLoadModel}
                        className="sr-only"
                      />
                    </label>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              
              <MenubarMenu>
                <MenubarTrigger className="font-medium">Insert</MenubarTrigger>
                <MenubarContent>
                  <MenubarLabel>Enclosures</MenubarLabel>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => addEnclosure(`Panel ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`)}>
                    New Panel Enclosure
                  </MenubarItem>
                  
                  <MenubarSeparator />
                  <MenubarLabel>Circuit Breakers</MenubarLabel>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => addComponent('ACB1', 'ACB 1', '#444444', '50 80')}>ACB 1</MenubarItem>
                  <MenubarItem onClick={() => addComponent('ACB2', 'ACB 2', '#444444', '50 80')}>ACB 2</MenubarItem>
                  <MenubarItem onClick={() => addComponent('MCB1P', 'MCB 1P', '#444444', '50 50')}>MCB 1P</MenubarItem>
                  <MenubarItem onClick={() => addComponent('MCB3P', 'MCB 3P', '#444444', '50 50')}>MCB 3P</MenubarItem>
                  <MenubarItem onClick={() => addComponent('NSX250', 'NSX250', '#404040', '70 90')}>
                    NSX250
                  </MenubarItem>
                  <MenubarItem onClick={() => addComponent('SCH250A', 'Schneider 250A', '#6b7280', '80 120')}>
                    Schneider 250A
                  </MenubarItem>
                  
                  <MenubarSeparator />
                  <MenubarLabel>Transformers</MenubarLabel>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => addComponent('TX1', 'TX 100kVA', '#666666', '100 100')}>TX 100kVA</MenubarItem>
                  <MenubarItem onClick={() => addComponent('TX2', 'TX 250kVA', '#666666', '120 120')}>TX 250kVA</MenubarItem>
                  <MenubarItem onClick={() => addComponent('TX3', 'TX 500kVA', '#666666', '150 150')}>TX 500kVA</MenubarItem>
                  
                  <MenubarSeparator />
                  <MenubarLabel>Busbars</MenubarLabel>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => addComponent('BB1', 'Bus Bar 100A', '#8B4513', '150 30')}>Bus Bar 100A</MenubarItem>
                  <MenubarItem onClick={() => addComponent('BB2', 'Bus Bar 250A', '#8B4513', '200 30')}>Bus Bar 250A</MenubarItem>
                  <MenubarItem onClick={() => addComponent('BB3', 'Bus Bar 400A', '#8B4513', '250 30')}>Bus Bar 400A</MenubarItem>
                  <MenubarItem onClick={() => addComponent('BB4', 'Bus Bar 630A', '#8B4513', '300 30')}>Bus Bar 630A</MenubarItem>
                  
                  <MenubarSeparator />
                  <MenubarLabel>Switches</MenubarLabel>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => addComponent('DS1', 'Disconnector', '#D946EF', '70 60')}>Disconnector</MenubarItem>
                  <MenubarItem onClick={() => addComponent('DS2', 'Isolator', '#D946EF', '70 60')}>Isolator</MenubarItem>
                  <MenubarItem onClick={() => addComponent('DS3', 'Changeover', '#D946EF', '100 70')}>Changeover</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              
              <MenubarMenu>
                <MenubarTrigger className="font-medium">Settings</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={toggleTopLevel}>
                    {allowTopLevel ? "Disable" : "Enable"} Top-Level Placement
                  </MenubarItem>
                  <MenubarItem onClick={toggleDistances}>
                    {showDistances ? "Hide" : "Show"} Component Distances
                  </MenubarItem>
                  <MenubarItem onClick={toggleGrid}>
                    {showGrid ? "Hide" : "Show"} Grid
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1 bg-slate-50 p-3 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-700">
                <CircuitBoard className="w-5 h-5" />
                Quick Add
              </h3>
              <div className="border-b pb-3 mb-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="distance-toggle" 
                      checked={showDistances} 
                      onCheckedChange={toggleDistances} 
                    />
                    <label 
                      htmlFor="distance-toggle" 
                      className="text-sm font-medium leading-none flex items-center gap-1 cursor-pointer"
                    >
                      <Ruler className="h-4 w-4" />
                      Component Distances
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="grid-toggle" 
                      checked={showGrid} 
                      onCheckedChange={toggleGrid} 
                    />
                    <label 
                      htmlFor="grid-toggle" 
                      className="text-sm font-medium leading-none flex items-center gap-1 cursor-pointer"
                    >
                      <Square className="h-4 w-4" />
                      Show Grid
                    </label>
                  </div>
                </div>
              </div>
              <div className="border-b pb-3 mb-3">
                <h4 className="font-medium text-gray-700 mb-2">Enclosures</h4>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start border-blue-200 bg-white hover:bg-blue-50"
                    onClick={() => addEnclosure(`Panel ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`)}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    New Panel Enclosure
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-420px)]">
                <div className="space-y-3">
                  <div className="bg-orange-50 rounded-md p-2">
                    <div className="font-medium text-orange-700 flex items-center mb-2">
                      <Server className="w-4 h-4 mr-2" />
                      Circuit Breakers
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-orange-200 bg-white hover:bg-orange-100"
                        onClick={() => addComponent('ACB1', 'ACB 1', '#444444', '50 80')}
                      >
                        <span className="text-xs">ACB 1</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-orange-200 bg-white hover:bg-orange-100"
                        onClick={() => addComponent('MCB1P', 'MCB 1P', '#444444', '50 50')}
                      >
                        <span className="text-xs">MCB 1P</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-orange-200 bg-white hover:bg-orange-100"
                        onClick={() => addComponent('NSX250', 'NSX250', '#404040', '70 90')}
                      >
                        <span className="text-xs">NSX250</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-orange-200 bg-white hover:bg-orange-100"
                        onClick={() => addComponent('SCH250A', 'Schneider 250A', '#6b7280', '80 120')}
                      >
                        <span className="text-xs">Schneider 250A</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-md p-2">
                    <div className="font-medium text-purple-700 flex items-center mb-2">
                      <Cable className="w-4 h-4 mr-2" />
                      Transformers
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-purple-200 bg-white hover:bg-purple-100"
                        onClick={() => addComponent('TX1', 'TX 100kVA', '#666666', '100 100')}
                      >
                        <span className="text-xs">100kVA</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-purple-200 bg-white hover:bg-purple-100"
                        onClick={() => addComponent('TX2', 'TX 250kVA', '#666666', '120 120')}
                      >
                        <span className="text-xs">250kVA</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-md p-2">
                    <div className="font-medium text-blue-700 flex items-center mb-2">
                      <Plug className="w-4 h-4 mr-2" />
                      Busbars
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-blue-200 bg-white hover:bg-blue-100"
                        onClick={() => addComponent('BB1', 'Bus Bar 100A', '#8B4513', '150 30')}
                      >
                        <span className="text-xs">100A</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-blue-200 bg-white hover:bg-blue-100"
                        onClick={() => addComponent('BB3', 'Bus Bar 400A', '#8B4513', '250 30')}
                      >
                        <span className="text-xs">400A</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-pink-50 rounded-md p-2">
                    <div className="font-medium text-pink-700 flex items-center mb-2">
                      <ToggleLeft className="w-4 h-4 mr-2" />
                      Switches
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-pink-200 bg-white hover:bg-pink-100"
                        onClick={() => addComponent('DS1', 'Disconnector', '#D946EF', '70 60')}
                      >
                        <span className="text-xs">Disconnector</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-pink-200 bg-white hover:bg-pink-100"
                        onClick={() => addComponent('DS2', 'Isolator', '#D946EF', '70 60')}
                      >
                        <span className="text-xs">Isolator</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>

            <div className="col-span-1 md:col-span-4">
              <ContextMenu>
                <ContextMenuTrigger>
                  <div className="border rounded-lg shadow-lg bg-white overflow-hidden relative">
                    <div ref={diagramRef} className="gojs-diagram h-[calc(100vh-140px)] w-full"></div>
                    {showDistances && (
                      <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                        <Ruler className="h-3 w-3 mr-1" />
                        Distance Mode
                      </div>
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                  <ContextMenuGroup>
                    <ContextMenuLabel>Insert Component</ContextMenuLabel>
                    <ContextMenuItem onClick={() => addEnclosure(`Panel ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`)}>
                      New Panel Enclosure
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => addComponent('ACB1', 'ACB 1', '#444444', '50 80')}>
                      ACB Circuit Breaker
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => addComponent('NSX250', 'NSX250', '#404040', '70 90')}>
                      NSX250 Breaker
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => addComponent('SCH250A', 'Schneider 250A', '#6b7280', '80 120')}>
                      Schneider 250A Chassis
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => addComponent('TX1', 'TX 100kVA', '#666666', '100 100')}>
                      Transformer 100kVA
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => addComponent('BB1', 'Bus Bar 100A', '#8B4513', '150 30')}>
                      Busbar 100A
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => addComponent('DS1', 'Disconnector', '#D946EF', '70 60')}>
                      Disconnector Switch
                    </ContextMenuItem>
                  </ContextMenuGroup>
                  <ContextMenuSeparator />
                  <ContextMenuGroup>
                    <ContextMenuLabel>Display Options</ContextMenuLabel>
                    <ContextMenuItem onClick={toggleDistances}>
                      {showDistances ? "Hide" : "Show"} Distances
                    </ContextMenuItem>
                    <ContextMenuItem onClick={toggleGrid}>
                      {showGrid ? "Hide" : "Show"} Grid
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Right-click on the canvas to add components, or use the quick-add panel on the left.</p>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default PanelboardDesigner;
