
import { GoJSDiagram } from './goJsInterop';

export const createNodeTemplates = (go: GoJSDiagram, CellSize: any, highlightGroup: (grp: any, show: boolean) => boolean) => {
  const templates = new Map();
  
  // Base node template for normal components
  const baseNodeTemplate = new go.Node('Auto', {
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
                fill: '#333333',
                stroke: '#222222',
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
            stroke: '#333'
          }).bind('text', 'label')
        )
    );
  
  templates.set("default", baseNodeTemplate);
  
  // NSX250 Template - dark gray with white switch lever
  const nsx250Template = new go.Node('Auto')
    .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
    .add(
      new go.Panel("Vertical")
        .add(
          new go.Panel("Spot")
            .add(
              new go.Shape('Rectangle', {
                name: 'SHAPE',
                fill: '#333333',
                stroke: '#222222',
                strokeWidth: 1,
                minSize: new go.Size(60, 100),
                desiredSize: new go.Size(60, 100),
                shadowVisible: true,
                shadowOffset: new go.Point(2, 2),
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
            )
            .add(
              new go.Shape('Rectangle', {
                alignment: new go.Spot(0.5, 0.3),
                fill: 'white',
                stroke: '#222222',
                strokeWidth: 1,
                width: 15,
                height: 40
              })
            )
            // Red indicator at bottom of lever
            .add(
              new go.Shape('Rectangle', {
                fill: '#FF0000',
                stroke: null,
                width: 15,
                height: 5,
                alignment: new go.Spot(0.5, 0.7)
              })
            ),
          new go.TextBlock({
            margin: new go.Margin(5, 0, 0, 0),
            font: 'bold 11px Inter, sans-serif',
            stroke: '#333'
          }).bind('text', 'label')
        )
    );
  
  templates.set("NSX250", nsx250Template);
  
  // Schneider 250A - gray chassis with control panel
  const schneider250Template = new go.Node('Auto')
    .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
    .add(
      new go.Panel("Vertical")
        .add(
          new go.Panel("Spot")
            .add(
              new go.Shape('Rectangle', {
                name: 'SHAPE',
                fill: '#666666',
                stroke: '#444444',
                strokeWidth: 1,
                minSize: new go.Size(70, 100),
                desiredSize: new go.Size(70, 100),
                shadowVisible: true,
                shadowOffset: new go.Point(2, 2),
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
            )
            // Top dots
            .add(
              new go.Shape('Circle', {
                fill: 'black',
                stroke: null,
                width: 5,
                height: 5,
                alignment: new go.Spot(0.3, 0.1)
              })
            )
            .add(
              new go.Shape('Circle', {
                fill: 'black',
                stroke: null,
                width: 5,
                height: 5,
                alignment: new go.Spot(0.7, 0.1)
              })
            )
            // Red indicator light
            .add(
              new go.Shape('Circle', {
                fill: '#FF0000',
                stroke: null,
                width: 8,
                height: 8,
                alignment: new go.Spot(0.7, 0.25)
              })
            )
            // Control sliders - gray
            .add(
              new go.Shape('Rectangle', {
                fill: '#cccccc',
                stroke: null,
                width: 40,
                height: 5,
                alignment: new go.Spot(0.5, 0.4)
              })
            )
            .add(
              new go.Shape('Rectangle', {
                fill: '#cccccc',
                stroke: null,
                width: 40,
                height: 5,
                alignment: new go.Spot(0.5, 0.5)
              })
            )
            .add(
              new go.Shape('Rectangle', {
                fill: '#cccccc',
                stroke: null,
                width: 40,
                height: 5,
                alignment: new go.Spot(0.5, 0.6)
              })
            )
            .add(
              new go.Shape('Rectangle', {
                fill: '#cccccc',
                stroke: null,
                width: 40,
                height: 5,
                alignment: new go.Spot(0.5, 0.7)
              })
            ),
          new go.TextBlock({
            margin: new go.Margin(5, 0, 0, 0),
            font: 'bold 11px Inter, sans-serif',
            stroke: '#333'
          }).bind('text', 'label')
        )
    );
  
  templates.set("Schneider250A", schneider250Template);
  
  // ACB template - Red with white switch
  const acbTemplate = new go.Node('Auto')
    .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
    .add(
      new go.Panel("Vertical")
        .add(
          new go.Panel("Spot")
            .add(
              new go.Shape('Rectangle', {
                name: 'SHAPE',
                fill: '#FF0000',
                stroke: '#CC0000',
                strokeWidth: 1,
                minSize: new go.Size(60, 100),
                desiredSize: new go.Size(60, 100),
                shadowVisible: true,
                shadowOffset: new go.Point(2, 2),
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
            )
            .add(
              new go.Shape('Rectangle', {
                alignment: new go.Spot(0.5, 0.3),
                fill: 'white',
                stroke: '#222222',
                strokeWidth: 1,
                width: 15,
                height: 40
              })
            ),
          new go.TextBlock({
            margin: new go.Margin(5, 0, 0, 0),
            font: 'bold 11px Inter, sans-serif',
            stroke: '#333'
          }).bind('text', 'label')
        )
    );
  
  templates.set("ACB", acbTemplate);
  
  // MCB template - Dark gray with white switch and red indicator
  const mcbTemplate = new go.Node('Auto')
    .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
    .add(
      new go.Panel("Vertical")
        .add(
          new go.Panel("Spot")
            .add(
              new go.Shape('Rectangle', {
                name: 'SHAPE',
                fill: '#333333',
                stroke: '#222222',
                strokeWidth: 1,
                minSize: new go.Size(60, 100),
                desiredSize: new go.Size(60, 100),
                shadowVisible: true,
                shadowOffset: new go.Point(2, 2),
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
            )
            .add(
              new go.Shape('Rectangle', {
                alignment: new go.Spot(0.5, 0.3),
                fill: 'white',
                stroke: '#222222', 
                strokeWidth: 1,
                width: 15,
                height: 40
              })
            )
            .add(
              new go.Shape('Rectangle', {
                fill: '#FF0000',
                stroke: null,
                width: 15,
                height: 5,
                alignment: new go.Spot(0.5, 0.7)
              })
            ),
          new go.TextBlock({
            margin: new go.Margin(5, 0, 0, 0),
            font: 'bold 11px Inter, sans-serif',
            stroke: '#333'
          }).bind('text', 'label')
        )
    );
  
  templates.set("MCB", mcbTemplate);
  
  // Busbar template - copper/brown colored
  const busbarTemplate = new go.Node('Auto')
    .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
    .add(
      new go.Panel("Vertical")
        .add(
          new go.Panel("Spot")
            .add(
              new go.Shape('Rectangle', {
                name: 'SHAPE',
                fill: '#8B4513', // Darker copper/brown color
                stroke: '#5E2605',
                strokeWidth: 1,
                minSize: new go.Size(150, 30),
                desiredSize: new go.Size(150, 30),
                shadowVisible: true,
                shadowOffset: new go.Point(2, 2),
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
            ),
          new go.TextBlock({
            margin: new go.Margin(5, 0, 0, 0),
            font: 'bold 11px Inter, sans-serif',
            stroke: '#333'
          }).bind('text', 'label')
        )
    );
  
  templates.set("Busbar", busbarTemplate);
  
  // Transformer template - Dark gray box
  const transformerTemplate = new go.Node('Auto')
    .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
    .add(
      new go.Panel("Vertical")
        .add(
          new go.Panel("Spot")
            .add(
              new go.Shape('Rectangle', {
                name: 'SHAPE',
                fill: '#444444',
                stroke: '#333333',
                strokeWidth: 1,
                minSize: new go.Size(100, 120),
                desiredSize: new go.Size(100, 120),
                shadowVisible: true,
                shadowOffset: new go.Point(2, 2),
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
              })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
            ),
          new go.TextBlock({
            margin: new go.Margin(5, 0, 0, 0),
            font: 'bold 11px Inter, sans-serif',
            stroke: '#333'
          }).bind('text', 'label')
        )
    );
  
  templates.set("Transformer", transformerTemplate);
  
  return templates;
};

export const createGroupTemplate = (go: GoJSDiagram, CellSize: any, highlightGroup: (grp: any, show: boolean) => boolean) => {
  const groupFill = 'rgba(173, 216, 230, 0.15)'; // Light blue background
  const groupStroke = '#3498db';
  const dropFill = 'rgba(46, 204, 113, 0.3)';
  const dropStroke = '#2ecc71';

  // Group template definition
  return new go.Group({
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
};

export const createLinkTemplate = (go: GoJSDiagram) => {
  return new go.Link({
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
};
