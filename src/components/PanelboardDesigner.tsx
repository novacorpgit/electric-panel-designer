
import React, { useEffect, useRef, useState } from 'react';
import { toast } from '../components/ui/use-toast';
import { initializeGoJS, GoJSDiagram } from '../lib/goJsInterop';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

interface PanelboardDesignerProps {
  // Add any props here
}

const PanelboardDesigner: React.FC<PanelboardDesignerProps> = () => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const paletteSmallRef = useRef<HTMLDivElement>(null);
  const paletteTallRef = useRef<HTMLDivElement>(null);
  const paletteWideRef = useRef<HTMLDivElement>(null);
  const paletteBigRef = useRef<HTMLDivElement>(null);
  const modelDisplayRef = useRef<HTMLTextAreaElement>(null);
  
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
            paletteSmallRef.current && 
            paletteTallRef.current && 
            paletteWideRef.current && 
            paletteBigRef.current) {
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
      ModelChanged: (e: any) => {
        if (e.isTransactionFinished && modelDisplayRef.current) {
          modelDisplayRef.current.value = myDiagram.model.toJson();
        }
      },
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
          font: 'bold 16px sans-serif'
        }).bind('text', 'key')
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
          .bindObject('stroke', 'isHighlighted', (h: boolean) => (h ? dropStroke : groupStroke))
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

    // Initial diagram model with 4 panels
    myDiagram.model = new go.GraphLinksModel([
      { key: 'G1', isGroup: true, pos: '0 0', size: '200 200' },
      { key: 'G2', isGroup: true, pos: '200 0', size: '200 200' },
      { key: 'G3', isGroup: true, pos: '0 200', size: '200 200' },
      { key: 'G4', isGroup: true, pos: '200 200', size: '200 200' }
    ]);

    // Define colors for palette items
    const green = '#B2FF59';
    const blue = '#81D4FA';
    const yellow = '#FFEB3B';

    // Create the small components palette
    const myPaletteSmall = new go.Palette(paletteSmallRef.current, {
      nodeTemplate: myDiagram.nodeTemplate,
      groupTemplate: myDiagram.groupTemplate
    });

    myPaletteSmall.model = new go.GraphLinksModel([
      { key: 'g', color: green },
      { key: 'b', color: blue },
      { key: 'y', color: yellow }
    ]);

    // Create the tall components palette
    const myPaletteTall = new go.Palette(paletteTallRef.current, {
      nodeTemplate: myDiagram.nodeTemplate,
      groupTemplate: myDiagram.groupTemplate
    });

    myPaletteTall.model = new go.GraphLinksModel([
      { key: 'g', color: green, size: '50 100' },
      { key: 'b', color: blue, size: '50 100' },
      { key: 'y', color: yellow, size: '50 100' }
    ]);

    // Create the wide components palette
    const myPaletteWide = new go.Palette(paletteWideRef.current, {
      nodeTemplate: myDiagram.nodeTemplate,
      groupTemplate: myDiagram.groupTemplate
    });

    myPaletteWide.model = new go.GraphLinksModel([
      { key: 'g', color: green, size: '100 50' },
      { key: 'b', color: blue, size: '100 50' },
      { key: 'y', color: yellow, size: '100 50' }
    ]);

    // Create the big components palette
    const myPaletteBig = new go.Palette(paletteBigRef.current, {
      nodeTemplate: myDiagram.nodeTemplate,
      groupTemplate: myDiagram.groupTemplate
    });

    myPaletteBig.model = new go.GraphLinksModel([
      { key: 'g', color: green, size: '100 100' },
      { key: 'b', color: blue, size: '100 100' },
      { key: 'y', color: yellow, size: '100 100' }
    ]);
  };

  const handleSaveModel = () => {
    if (modelDisplayRef.current) {
      try {
        const modelJson = modelDisplayRef.current.value;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(modelJson);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "panelboard-design.json");
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
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center animate-slide-down">
        Electrical Panelboard Designer
      </h1>
      
      <div className="mb-6 flex justify-between items-center animate-slide-up">
        <div className="flex gap-2">
          <Button onClick={toggleTopLevel} variant={allowTopLevel ? "default" : "outline"} className="button-primary">
            {allowTopLevel ? "Disable" : "Enable"} Top-Level Placement
          </Button>
          <Button onClick={handleSaveModel} className="button-primary">
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
            <Button asChild className="button-primary">
              <label htmlFor="load-model" className="cursor-pointer">Load Design</label>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="palette-container lg:col-span-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="section-title">Small Components (1x1)</h2>
          <div ref={paletteSmallRef} className="gojs-palette h-24"></div>
        </div>
        
        <div className="palette-container lg:col-span-1 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="section-title">Tall Components (1x2)</h2>
          <div ref={paletteTallRef} className="gojs-palette h-24"></div>
        </div>
        
        <div className="palette-container lg:col-span-1 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="section-title">Wide Components (2x1)</h2>
          <div ref={paletteWideRef} className="gojs-palette h-24"></div>
        </div>
        
        <div className="palette-container lg:col-span-1 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="section-title">Large Components (2x2)</h2>
          <div ref={paletteBigRef} className="gojs-palette h-24"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="diagram-container lg:col-span-2 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h2 className="section-title mb-4">Design Canvas</h2>
          <div className="border rounded-lg shadow-inner bg-slate-50">
            <div ref={diagramRef} className="gojs-diagram h-[500px]"></div>
          </div>
        </div>
        
        <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <Card className="backdrop-blur-sm bg-white bg-opacity-80 h-full">
            <div className="p-4">
              <h2 className="section-title mb-4">Model JSON</h2>
              <textarea
                ref={modelDisplayRef}
                readOnly
                className="w-full h-[460px] p-2 text-xs font-mono border rounded bg-gray-50"
                placeholder="Diagram model will appear here..."
              ></textarea>
            </div>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500 animate-slide-up" style={{ animationDelay: '700ms' }}>
        <p>Drag components from the palettes and drop them onto the design canvas. Create your electrical panel layout by arranging components within the gray panel areas.</p>
      </div>
    </div>
  );
};

export default PanelboardDesigner;
