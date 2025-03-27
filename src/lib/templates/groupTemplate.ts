
import { GoJSDiagram } from '../goJsInterop';
import { TemplateOptions } from './baseTemplates';

export const createGroupTemplate = ({ go, CellSize, highlightGroup }: TemplateOptions) => {
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
