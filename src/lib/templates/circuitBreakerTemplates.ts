
import { GoJSDiagram } from '../goJsInterop';
import { TemplateOptions, createBaseShadow } from './baseTemplates';

export const createCircuitBreakerTemplates = ({ go, CellSize, highlightGroup }: TemplateOptions) => {
  const templates = new Map();
  
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
                ...createBaseShadow(go)
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
                ...createBaseShadow(go)
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
                ...createBaseShadow(go)
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

  templates.set("NSX250", nsx250Template);
  templates.set("ACB", acbTemplate);
  templates.set("MCB", mcbTemplate);
  
  return templates;
};
