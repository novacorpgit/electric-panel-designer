
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
  
  templates.set("default", baseNodeTemplate);
  
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
  
  templates.set("NSX250", nsx250Template);
  
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
  
  templates.set("Schneider250A", schneider250Template);
  
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
  
  templates.set("Busbar", busbarTemplate);
  
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
  
  templates.set("CircuitBreaker", circuitBreakerTemplate);
  
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
  
  templates.set("Transformer", transformerTemplate);
  
  return templates;
};

export const createGroupTemplate = (go: GoJSDiagram, CellSize: any, highlightGroup: (grp: any, show: boolean) => boolean) => {
  const groupFill = 'rgba(41, 128, 185, 0.15)';
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
