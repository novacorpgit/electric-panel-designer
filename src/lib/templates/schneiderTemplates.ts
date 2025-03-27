
import { GoJSDiagram } from '../goJsInterop';
import { TemplateOptions, createBaseShadow } from './baseTemplates';

export const createSchneiderTemplates = ({ go, CellSize, highlightGroup }: TemplateOptions) => {
  const templates = new Map();
  
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
                ...createBaseShadow(go)
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
  
  return templates;
};
