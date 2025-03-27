
import { GoJSDiagram } from '../goJsInterop';
import { TemplateOptions, createBaseShadow } from './baseTemplates';

export const createBaseNodeTemplate = ({ go, CellSize, highlightGroup }: TemplateOptions) => {
  // Base node template for normal components
  return new go.Node('Auto', {
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
                ...createBaseShadow(go)
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
};
