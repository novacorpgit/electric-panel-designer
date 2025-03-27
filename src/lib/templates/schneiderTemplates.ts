
import { GoJSDiagram } from '../goJsInterop';
import { TemplateOptions, createBaseShadow } from './baseTemplates';

export const createSchneiderTemplates = ({ go, CellSize, highlightGroup }: TemplateOptions) => {
  const templates = new Map();
  
  // Schneider 250A - more realistic design based on real units
  const schneider250Template = new go.Node('Auto')
    .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
    .bind('movable', 'movable', null, true) // Make node draggable by default
    .bind('resizable', 'resizable', null, true) // Make node resizable by default
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
                ...createBaseShadow(go),
                resizable: true
              })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
            )
            // Top terminal connections
            .add(
              new go.Shape('Rectangle', {
                fill: '#222222',
                stroke: '#111111',
                strokeWidth: 1,
                width: 60,
                height: 5,
                alignment: new go.Spot(0.5, 0.05)
              })
            )
            // Brand label at top
            .add(
              new go.TextBlock({
                text: "Schneider",
                font: "bold 8px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.5, 0.15)
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
            // Green indicator light
            .add(
              new go.Shape('Circle', {
                fill: '#00FF00',
                stroke: null,
                width: 8,
                height: 8,
                alignment: new go.Spot(0.7, 0.35)
              })
            )
            // Control sliders/buttons - gray
            .add(
              new go.Shape('Rectangle', {
                fill: '#cccccc',
                stroke: '#999999',
                width: 40,
                height: 5,
                alignment: new go.Spot(0.5, 0.45)
              })
            )
            .add(
              new go.Shape('Rectangle', {
                fill: '#cccccc',
                stroke: '#999999',
                width: 40,
                height: 5,
                alignment: new go.Spot(0.5, 0.55)
              })
            )
            // Switch handle
            .add(
              new go.Shape('Rectangle', {
                fill: '#eeeeee',
                stroke: '#222222',
                strokeWidth: 1,
                width: 20,
                height: 35,
                alignment: new go.Spot(0.3, 0.75)
              })
            )
            // Bottom terminal connections
            .add(
              new go.Shape('Rectangle', {
                fill: '#222222',
                stroke: '#111111',
                strokeWidth: 1,
                width: 60,
                height: 5,
                alignment: new go.Spot(0.5, 0.95)
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
