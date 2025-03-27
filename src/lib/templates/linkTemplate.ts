
import { GoJSDiagram } from '../goJsInterop';

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
