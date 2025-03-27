
import { GoJSDiagram } from '../goJsInterop';
import { TemplateOptions, createBaseShadow } from './baseTemplates';

export const createCircuitBreakerTemplates = ({ go, CellSize, highlightGroup }: TemplateOptions) => {
  const templates = new Map();
  
  // NSX250 Template - realistic design based on actual NSX250 circuit breakers
  const nsx250Template = new go.Node('Auto')
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
                fill: '#333333',
                stroke: '#222222',
                strokeWidth: 1,
                minSize: new go.Size(70, 120),
                desiredSize: new go.Size(70, 120),
                ...createBaseShadow(go),
                resizable: true
              })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
            )
            // Brand name at top
            .add(
              new go.TextBlock({
                text: "NSX250",
                font: "bold 9px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.5, 0.1)
              })
            )
            // Terminal connections at top
            .add(
              new go.Shape('Rectangle', {
                fill: '#111111',
                stroke: null,
                width: 60,
                height: 6,
                alignment: new go.Spot(0.5, 0.05)
              })
            )
            // Handle/switch - white with red indicator
            .add(
              new go.Shape('Rectangle', {
                alignment: new go.Spot(0.5, 0.4),
                fill: 'white',
                stroke: '#222222', 
                strokeWidth: 1,
                width: 20,
                height: 45
              })
            )
            // ON indicator text
            .add(
              new go.TextBlock({
                text: "ON",
                font: "bold 8px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.2, 0.3)
              })
            )
            // OFF indicator text
            .add(
              new go.TextBlock({
                text: "OFF",
                font: "bold 8px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.2, 0.5)
              })
            )
            // Rating/current value
            .add(
              new go.TextBlock({
                text: "250A",
                font: "bold 10px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.75, 0.75)
              })
            )
            // Red indicator status
            .add(
              new go.Shape('Circle', {
                fill: '#FF0000',
                stroke: null,
                width: 8,
                height: 8,
                alignment: new go.Spot(0.75, 0.6)
              })
            )
            // Terminal connections at bottom
            .add(
              new go.Shape('Rectangle', {
                fill: '#111111',
                stroke: null,
                width: 60,
                height: 6,
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

  // ACB template - Red with white switch - improved design
  const acbTemplate = new go.Node('Auto')
    .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
    .bind('movable', 'movable', null, true)
    .bind('resizable', 'resizable', null, true)
    .add(
      new go.Panel("Vertical")
        .add(
          new go.Panel("Spot")
            .add(
              new go.Shape('Rectangle', {
                name: 'SHAPE',
                fill: '#CC0000',
                stroke: '#880000',
                strokeWidth: 1,
                minSize: new go.Size(70, 120),
                desiredSize: new go.Size(70, 120),
                ...createBaseShadow(go),
                resizable: true
              })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
            )
            // Brand text
            .add(
              new go.TextBlock({
                text: "ACB",
                font: "bold 10px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.5, 0.1)
              })
            )
            // Terminal connections at top
            .add(
              new go.Shape('Rectangle', {
                fill: '#111111',
                stroke: null,
                width: 60,
                height: 6,
                alignment: new go.Spot(0.5, 0.05)
              })
            )
            // Handle/switch - white
            .add(
              new go.Shape('Rectangle', {
                alignment: new go.Spot(0.5, 0.4),
                fill: 'white',
                stroke: '#222222',
                strokeWidth: 1,
                width: 20,
                height: 45
              })
            )
            // Status indicators
            .add(
              new go.TextBlock({
                text: "I",
                font: "bold 12px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.2, 0.3)
              })
            )
            .add(
              new go.TextBlock({
                text: "O",
                font: "bold 12px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.2, 0.5)
              })
            )
            // Rating indicator
            .add(
              new go.TextBlock({
                text: "400A",
                font: "bold 10px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.75, 0.75)
              })
            )
            // Terminal connections at bottom
            .add(
              new go.Shape('Rectangle', {
                fill: '#111111',
                stroke: null,
                width: 60,
                height: 6,
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
  
  // MCB template - Dark gray with white switch and red indicator - improved design
  const mcbTemplate = new go.Node('Auto')
    .bindTwoWay('position', 'pos', go.Point.parse, go.Point.stringify)
    .bind('movable', 'movable', null, true)
    .bind('resizable', 'resizable', null, true)
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
                minSize: new go.Size(50, 110),
                desiredSize: new go.Size(50, 110),
                ...createBaseShadow(go),
                resizable: true
              })
                .bindTwoWay('desiredSize', 'size', go.Size.parse, go.Size.stringify)
            )
            // Brand text
            .add(
              new go.TextBlock({
                text: "MCB",
                font: "bold 8px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.5, 0.1)
              })
            )
            // Terminal connections at top
            .add(
              new go.Shape('Rectangle', {
                fill: '#111111',
                stroke: null,
                width: 40,
                height: 5,
                alignment: new go.Spot(0.5, 0.05)
              })
            )
            // Handle/switch mechanism
            .add(
              new go.Shape('Rectangle', {
                alignment: new go.Spot(0.5, 0.4),
                fill: 'white',
                stroke: '#222222', 
                strokeWidth: 1,
                width: 15,
                height: 40
              })
            )
            // Status indicators
            .add(
              new go.TextBlock({
                text: "I",
                font: "bold 9px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.25, 0.3)
              })
            )
            .add(
              new go.TextBlock({
                text: "O",
                font: "bold 9px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.25, 0.5)
              })
            )
            // Rating
            .add(
              new go.TextBlock({
                text: "32A",
                font: "bold 8px sans-serif",
                stroke: "white",
                alignment: new go.Spot(0.7, 0.75)
              })
            )
            // Terminal connections at bottom
            .add(
              new go.Shape('Rectangle', {
                fill: '#111111',
                stroke: null,
                width: 40,
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

  templates.set("NSX250", nsx250Template);
  templates.set("ACB", acbTemplate);
  templates.set("MCB", mcbTemplate);
  
  return templates;
};
