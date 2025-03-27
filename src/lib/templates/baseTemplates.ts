
import { GoJSDiagram } from '../goJsInterop';

export interface TemplateOptions {
  go: GoJSDiagram;
  CellSize: any;
  highlightGroup: (grp: any, show: boolean) => boolean;
}

export const createBaseShadow = (go: GoJSDiagram) => {
  return {
    shadowVisible: true,
    shadowOffset: new go.Point(2, 2),
    shadowBlur: 3,
    shadowColor: 'rgba(0, 0, 0, 0.2)'
  };
};
