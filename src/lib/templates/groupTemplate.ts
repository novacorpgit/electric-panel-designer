
import { GoJSDiagram } from '../goJsInterop';
import { createBaseShadow, TemplateOptions } from './baseTemplates';

export const createGroupTemplate = (options: TemplateOptions) => {
  const { go, CellSize, highlightGroup } = options;
  
  return new go.Group("Auto", {
      selectionObjectName: "PLACEHOLDER",
      ungroupable: true,
      layerName: "Background",
      layout: new go.GridLayout({
        wrappingColumn: 1,
        cellSize: CellSize,
        spacing: new go.Size(4, 4),
        alignment: go.GridLayout.Position
      }),
      computesBoundsAfterDrag: true,
      computesBoundsIncludingLocation: true,
      computesBoundsIncludingLinks: false,
      mouseDragEnter: (e, grp, prev) => highlightGroup(grp, true),
      mouseDragLeave: (e, grp, next) => highlightGroup(grp, false),
      mouseDrop: (e, grp) => {
        const ok = grp.addMembers(grp.diagram.selection, true);
        if (!ok) grp.diagram.currentTool.doCancel();
      },
      handlesDragDropForMembers: true,
      ...createBaseShadow(go),
      resizable: true,
      resizeObjectName: "SHAPE",
      movable: true
    })
    .bindTwoWay("location", "loc", go.Point.parse, go.Point.stringify)
    .bindTwoWay("desiredSize", "size", go.Size.parse, go.Size.stringify)
    .add(
      new go.Shape("Rectangle", {
        name: "SHAPE",
        fill: "rgba(173, 216, 230, 0.15)",
        stroke: "#3498db",
        strokeWidth: 2,
        minSize: new go.Size(100, 100)
      })
    )
    .add(
      new go.Panel("Vertical")
        .add(
          new go.Panel("Auto", { margin: 8 })
            .add(
              new go.Shape("Rectangle", {
                fill: "#3498db",
                stroke: null,
                shadowVisible: false
              })
            )
            .add(
              new go.TextBlock({
                margin: new go.Margin(4, 4, 2, 2),
                font: "bold 12px sans-serif",
                stretch: go.GraphObject.Horizontal,
                stroke: "white",
                textAlign: "center",
                editable: true
              }).bind("text", "key")
            )
        )
        .add(
          new go.Placeholder({
            padding: new go.Margin(10, 10),
            name: "PLACEHOLDER",
            alignment: go.Spot.TopLeft
          })
        )
    );
};
