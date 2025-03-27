
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
import { Server, Database, Cable, Plug, ToggleLeft, CircuitBoard } from 'lucide-react';

interface PanelboardDesignerProps {
  // Add any props here
}

const PanelboardDesigner: React.FC<PanelboardDesignerProps> = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [allowTopLevel, setAllowTopLevel] = useState(false);
  const [goInstance, setGoInstance] = useState<GoJSDiagram | null>(null);
  const [diagramInstance, setDiagramInstance] = useState<any>(null);

  // Initialize GoJS
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
      // Cleanup if necessary
      if (diagramInstance) {
        diagramInstance.div = null;
      }
    };
  }, []);

  const setupDiagram = (go: GoJSDiagram) => {
    // Define cell size (even smaller grid size for more precision)
    const CellSize = new go.Size(12, 12);
    
    // Create the main diagram with context menu enabled
    const myDiagram = new go.Diagram(diagramRef.current, {
      grid: new go.Panel('Grid', { gridCellSize: CellSize })
        .add(
          new go.Shape('LineH', { stroke: 'rgba(169, 169, 169, 0.15)' }),
          new go.Shape('LineV', { stroke: 'rgba(169, 169, 169, 0.15)' })
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

    // Node template for electrical components
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
                new go.Shape("Rectangle", {
                  name: "IMAGE",
                  visible: false, // Only visible if there's an image
                  fill: "transparent",
                  stroke: null,
                  desiredSize: new go.Size(60, 80)
                })
                  .bind("source", "image")
                  .bind("visible", "image", (img) => !!img)
              ),
            new go.TextBlock({
              margin: new go.Margin(3, 0, 0, 0),
              font: 'bold 11px Inter, sans-serif',
              stroke: '#333'
            }).bind('text', 'label')
          )
      );

    // Helper function to highlight groups
    function highlightGroup(grp: any, show: boolean) {
      if (!grp) return false;
      const tool = grp.diagram.toolManager.draggingTool;
      grp.isHighlighted = show && grp.canAddMembers(tool.draggingParts);
      return grp.isHighlighted;
    }

    // Define colors for groups
    const groupFill = 'rgba(41, 128, 185, 0.1)';
    const groupStroke = '#3498db';
    const dropFill = 'rgba(46, 204, 113, 0.2)';
    const dropStroke = '#2ecc71';

    // Group template (panels/racks)
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
      }
    })
      .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
      .add(
        new go.Shape('Rectangle', {
          name: 'SHAPE',
          fill: groupFill,
          stroke: groupStroke,
          strokeWidth: 1.5,
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

    // Validation for group membership
    myDiagram.commandHandler.memberValidation = (grp: any, node: any) => {
      if (grp instanceof go.Group && node instanceof go.Group) return false;
      return true;
    };

    // Diagram background behavior
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

    // Initial diagram model with panels (enclosures)
    myDiagram.model = new go.GraphLinksModel([
      { key: 'Panel A', isGroup: true, pos: '0 0', size: '200 300' },
      { key: 'Panel B', isGroup: true, pos: '250 0', size: '200 300' },
      { key: 'Panel C', isGroup: true, pos: '0 350', size: '450 200' }
    ]);
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

  // Function to add a component to the diagram
  const addComponent = (key: string, label: string, color: string, size: string, image?: string) => {
    if (diagramInstance && goInstance) {
      try {
        // Create a new node data
        const nodeData = { 
          key: `${key}_${Math.floor(Math.random() * 1000)}`, 
          label, 
          color, 
          size, 
          pos: '100 100' 
        };

        // Add image if provided
        if (image) {
          nodeData['image'] = image;
        }

        // Add the node to the diagram
        diagramInstance.model.addNodeData(nodeData);
        
        // Center on the new node
        const newNode = diagramInstance.findNodeForData(nodeData);
        if (newNode) {
          diagramInstance.centerRect(newNode.actualBounds);
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
  
  // Function to add a new enclosure/panel
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
                  <MenubarItem onClick={() => addComponent('ACB1', 'ACB 1', '#F97316', '50 80')}>ACB 1</MenubarItem>
                  <MenubarItem onClick={() => addComponent('ACB2', 'ACB 2', '#F97316', '50 80')}>ACB 2</MenubarItem>
                  <MenubarItem onClick={() => addComponent('MCB1P', 'MCB 1P', '#F97316', '50 50')}>MCB 1P</MenubarItem>
                  <MenubarItem onClick={() => addComponent('MCB3P', 'MCB 3P', '#F97316', '50 50')}>MCB 3P</MenubarItem>
                  <MenubarItem onClick={() => addComponent('NSX250', 'NSX250', '#404040', '70 90', '/lovable-uploads/03c3bec1-ce4c-4de6-991a-b00dc5f3000f.png')}>
                    NSX250
                  </MenubarItem>
                  
                  <MenubarSeparator />
                  <MenubarLabel>Transformers</MenubarLabel>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => addComponent('TX1', 'TX 100kVA', '#8B5CF6', '100 100')}>TX 100kVA</MenubarItem>
                  <MenubarItem onClick={() => addComponent('TX2', 'TX 250kVA', '#8B5CF6', '120 120')}>TX 250kVA</MenubarItem>
                  <MenubarItem onClick={() => addComponent('TX3', 'TX 500kVA', '#8B5CF6', '150 150')}>TX 500kVA</MenubarItem>
                  
                  <MenubarSeparator />
                  <MenubarLabel>Busbars</MenubarLabel>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => addComponent('BB1', 'Bus Bar 100A', '#0EA5E9', '150 30')}>Bus Bar 100A</MenubarItem>
                  <MenubarItem onClick={() => addComponent('BB2', 'Bus Bar 250A', '#0EA5E9', '200 30')}>Bus Bar 250A</MenubarItem>
                  <MenubarItem onClick={() => addComponent('BB3', 'Bus Bar 400A', '#0EA5E9', '250 30')}>Bus Bar 400A</MenubarItem>
                  <MenubarItem onClick={() => addComponent('BB4', 'Bus Bar 630A', '#0EA5E9', '300 30')}>Bus Bar 630A</MenubarItem>
                  
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
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-3">
                  {/* Circuit Breaker Quick Access */}
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
                        onClick={() => addComponent('ACB1', 'ACB 1', '#F97316', '50 80')}
                      >
                        <span className="text-xs">ACB 1</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-orange-200 bg-white hover:bg-orange-100"
                        onClick={() => addComponent('MCB1P', 'MCB 1P', '#F97316', '50 50')}
                      >
                        <span className="text-xs">MCB 1P</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-orange-200 bg-white hover:bg-orange-100"
                        onClick={() => addComponent('NSX250', 'NSX250', '#404040', '70 90', '/lovable-uploads/03c3bec1-ce4c-4de6-991a-b00dc5f3000f.png')}
                      >
                        <span className="text-xs">NSX250</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Transformers Quick Access */}
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
                        onClick={() => addComponent('TX1', 'TX 100kVA', '#8B5CF6', '100 100')}
                      >
                        <span className="text-xs">100kVA</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-purple-200 bg-white hover:bg-purple-100"
                        onClick={() => addComponent('TX2', 'TX 250kVA', '#8B5CF6', '120 120')}
                      >
                        <span className="text-xs">250kVA</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Busbars Quick Access */}
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
                        onClick={() => addComponent('BB1', 'Bus Bar 100A', '#0EA5E9', '150 30')}
                      >
                        <span className="text-xs">100A</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex flex-col items-center justify-center border-blue-200 bg-white hover:bg-blue-100"
                        onClick={() => addComponent('BB3', 'Bus Bar 400A', '#0EA5E9', '250 30')}
                      >
                        <span className="text-xs">400A</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Switches Quick Access */}
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
                  <div className="border rounded-lg shadow-lg bg-white overflow-hidden">
                    <div ref={diagramRef} className="gojs-diagram h-[calc(100vh-140px)] w-full"></div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                  <ContextMenuGroup>
                    <ContextMenuLabel>Insert Component</ContextMenuLabel>
                    <ContextMenuItem onClick={() => addEnclosure(`Panel ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`)}>
                      New Panel Enclosure
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => addComponent('ACB1', 'ACB 1', '#F97316', '50 80')}>
                      ACB Circuit Breaker
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => addComponent('NSX250', 'NSX250', '#404040', '70 90', '/lovable-uploads/03c3bec1-ce4c-4de6-991a-b00dc5f3000f.png')}>
                      NSX250 Breaker
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => addComponent('TX1', 'TX 100kVA', '#8B5CF6', '100 100')}>
                      Transformer 100kVA
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => addComponent('BB1', 'Bus Bar 100A', '#0EA5E9', '150 30')}>
                      Busbar 100A
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => addComponent('DS1', 'Disconnector', '#D946EF', '70 60')}>
                      Disconnector Switch
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
