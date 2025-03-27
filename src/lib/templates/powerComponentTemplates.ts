
import { GoJSDiagram } from '../goJsInterop';
import { TemplateOptions, createBaseShadow } from './baseTemplates';

export const createPowerComponentTemplates = ({ go, CellSize, highlightGroup }: TemplateOptions) => {
  const templates = new Map();
  
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
                ...createBaseShadow(go)
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
                ...createBaseShadow(go)
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
  templates.set("Transformer", transformerTemplate);
  
  return templates;
};
