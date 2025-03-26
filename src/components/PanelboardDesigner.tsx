
import React, { useEffect, useRef, useState } from 'react';
import { toast } from '../components/ui/use-toast';
import { initializeGoJS, GoJSDiagram } from '../lib/goJsInterop';
import { Button } from '../components/ui/button';
import DesignerSidebar from './DesignerSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Server, Database } from 'lucide-react';

interface PanelboardDesignerProps {
  // Add any props here
}

const PanelboardDesigner: React.FC<PanelboardDesignerProps> = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  
  // Create refs for the palette sections
  const circuitBreakersRef = useRef<HTMLDivElement>(null);
  const transformersRef = useRef<HTMLDivElement>(null);
  const busbarsRef = useRef<HTMLDivElement>(null);
  const switchesRef = useRef<HTMLDivElement>(null);
  
  const [allowTopLevel, setAllowTopLevel] = useState(false);
  const [goInstance, setGoInstance] = useState<GoJSDiagram | null>(null);
  const [diagramInstance, setDiagramInstance] = useState<any>(null);

  // Initialize GoJS
  useEffect(() => {
    const initGoJS = async () => {
      try {
        const go = await initializeGoJS();
        setGoInstance(go);
        
        if (diagramRef.current && 
            circuitBreakersRef.current && 
            transformersRef.current && 
            busbarsRef.current && 
            switchesRef.current) {
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
    // Define cell size
    const CellSize = new go.Size(50, 50);
    
    // Create the main diagram
    const myDiagram = new go.Diagram(diagramRef.current, {
      grid: new go.Panel('Grid', { gridCellSize: CellSize })
        .add(
          new go.Shape('LineH', { stroke: 'lightgray' }),
          new go.Shape('LineV', { stroke: 'lightgray' })
        ),
      'draggingTool.isGridSnapEnabled': true,
      'draggingTool.gridSnapCellSpot': go.Spot.Center,
      'resizingTool.isGridSnapEnabled': true,
      'animationManager.isEnabled': false,
      'undoManager.isEnabled': true
    });
    
    setDiagramInstance(myDiagram);

    // Node template (electrical components)
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
        new go.Shape('Rectangle', {
          name: 'SHAPE',
          fill: 'white',
          minSize: CellSize,
          desiredSize: CellSize
        })
          .bind('fill', 'color')
          .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify),
        new go.TextBlock({
          alignment: go.Spot.Center,
          font: 'bold 14px sans-serif'
        }).bind('text', 'label')
      );

    // Helper function to highlight groups
    function highlightGroup(grp: any, show: boolean) {
      if (!grp) return false;
      const tool = grp.diagram.toolManager.draggingTool;
      grp.isHighlighted = show && grp.canAddMembers(tool.draggingParts);
      return grp.isHighlighted;
    }

    // Define colors for groups
    const groupFill = 'rgba(128,128,128,0.2)';
    const groupStroke = 'gray';
    const dropFill = 'rgba(128,255,255,0.2)';
    const dropStroke = 'red';

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
          minSize: new go.Size(CellSize.width * 2, CellSize.height * 2)
        })
          .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
          .bindObject('fill', 'isHighlighted', (h: boolean) => (h ? dropFill : groupFill))
          .bindObject('stroke', 'isHighlighted', (h: boolean) => (h ? dropStroke : groupStroke)),
        new go.TextBlock({
          alignment: go.Spot.TopLeft,
          margin: 5,
          font: 'bold 12px sans-serif'
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

    // Initial diagram model with 4 panels (enclosures)
    myDiagram.model = new go.GraphLinksModel([
      { key: 'Panel A', isGroup: true, pos: '0 0', size: '200 300' },
      { key: 'Panel B', isGroup: true, pos: '250 0', size: '200 300' },
      { key: 'Panel C', isGroup: true, pos: '0 350', size: '450 200' }
    ]);

    // Circuit Breaker Palette
    const circuitBreakerPalette = new go.Palette(circuitBreakersRef.current, {
      nodeTemplate: myDiagram.nodeTemplate,
      groupTemplate: myDiagram.groupTemplate
    });

    circuitBreakerPalette.model = new go.GraphLinksModel([
      { key: 'ACB 1', label: 'ACB 1', color: '#F97316', size: '50 80' },
      { key: 'ACB 2', label: 'ACB 2', color: '#F97316', size: '50 80' },
      { key: 'MCB 1P', label: 'MCB 1P', color: '#F97316', size: '50 50' },
      { key: 'MCB 3P', label: 'MCB 3P', color: '#F97316', size: '50 50' }
    ]);

    // Transformer Palette
    const transformerPalette = new go.Palette(transformersRef.current, {
      nodeTemplate: myDiagram.nodeTemplate,
      groupTemplate: myDiagram.groupTemplate
    });

    transformerPalette.model = new go.GraphLinksModel([
      { key: 'TX1', label: 'TX 100kVA', color: '#8B5CF6', size: '100 100' },
      { key: 'TX2', label: 'TX 250kVA', color: '#8B5CF6', size: '120 120' },
      { key: 'TX3', label: 'TX 500kVA', color: '#8B5CF6', size: '150 150' }
    ]);

    // Busbar Palette
    const busbarPalette = new go.Palette(busbarsRef.current, {
      nodeTemplate: myDiagram.nodeTemplate,
      groupTemplate: myDiagram.groupTemplate
    });

    busbarPalette.model = new go.GraphLinksModel([
      { key: 'BB1', label: 'Bus Bar 100A', color: '#0EA5E9', size: '150 30' },
      { key: 'BB2', label: 'Bus Bar 250A', color: '#0EA5E9', size: '200 30' },
      { key: 'BB3', label: 'Bus Bar 400A', color: '#0EA5E9', size: '250 30' },
      { key: 'BB4', label: 'Bus Bar 630A', color: '#0EA5E9', size: '300 30' }
    ]);

    // Switch Palette
    const switchPalette = new go.Palette(switchesRef.current, {
      nodeTemplate: myDiagram.nodeTemplate,
      groupTemplate: myDiagram.groupTemplate
    });

    switchPalette.model = new go.GraphLinksModel([
      { key: 'DS1', label: 'Disconnector', color: '#D946EF', size: '70 60' },
      { key: 'DS2', label: 'Isolator', color: '#D946EF', size: '70 60' },
      { key: 'DS3', label: 'Changeover', color: '#D946EF', size: '100 70' }
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
    if (file && diagramInstance) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          diagramInstance.model = go.Model.fromJson(json);
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

  return (
    <div className="flex h-full min-h-screen w-full">
      <SidebarProvider defaultOpen={true}>
        <DesignerSidebar 
          paletteRefs={{
            circuitBreakers: circuitBreakersRef,
            transformers: transformersRef,
            busbars: busbarsRef,
            switches: switchesRef
          }}
        />
        
        <div className="flex-1 p-4">
          <div className="mb-6 flex justify-between items-center animate-slide-up">
            <div className="flex gap-2">
              <Button onClick={toggleTopLevel} variant={allowTopLevel ? "default" : "outline"}>
                {allowTopLevel ? "Disable" : "Enable"} Top-Level Placement
              </Button>
              <Button onClick={handleSaveModel}>
                Save Design
              </Button>
              <div className="relative">
                <input
                  type="file"
                  id="load-model"
                  accept=".json"
                  onChange={handleLoadModel}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button asChild>
                  <label htmlFor="load-model" className="cursor-pointer">Load Design</label>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg shadow-inner bg-slate-50 h-[calc(100vh-120px)]">
            <div ref={diagramRef} className="gojs-diagram h-full w-full"></div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Drag components from the sidebar and drop them onto the panel enclosures. Design your electrical layout by arranging components.</p>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default PanelboardDesigner;
