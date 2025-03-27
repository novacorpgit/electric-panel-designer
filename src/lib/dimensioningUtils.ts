
import { GoJSDiagram } from './goJsInterop';

// Function to create dimensioning links between nodes
export const createDimensioningLink = (
  diagramInstance: any,
  goInstance: GoJSDiagram,
  from: any, 
  to: any, 
  orientation: string
) => {
  // Calculate distance based on bounding boxes
  let distance = 0;
  let fromPt, toPt;
  
  if (orientation === "Horizontal") {
    // For horizontal links, measure the x-distance between the sides
    if (from.actualBounds.right < to.actualBounds.left) {
      // from is to the left of to
      distance = to.actualBounds.left - from.actualBounds.right;
      fromPt = new goInstance.Point(from.actualBounds.right, from.actualBounds.center.y);
      toPt = new goInstance.Point(to.actualBounds.left, to.actualBounds.center.y);
    } else if (to.actualBounds.right < from.actualBounds.left) {
      // to is to the left of from
      distance = from.actualBounds.left - to.actualBounds.right;
      fromPt = new goInstance.Point(to.actualBounds.right, to.actualBounds.center.y);
      toPt = new goInstance.Point(from.actualBounds.left, from.actualBounds.center.y);
    } else {
      // overlapping x
      return null;
    }
  } else { // Vertical
    // For vertical links, measure the y-distance between the sides
    if (from.actualBounds.bottom < to.actualBounds.top) {
      // from is above to
      distance = to.actualBounds.top - from.actualBounds.bottom;
      fromPt = new goInstance.Point(from.actualBounds.center.x, from.actualBounds.bottom);
      toPt = new goInstance.Point(to.actualBounds.center.x, to.actualBounds.top);
    } else if (to.actualBounds.bottom < from.actualBounds.top) {
      // to is above from
      distance = from.actualBounds.top - to.actualBounds.bottom;
      fromPt = new goInstance.Point(to.actualBounds.center.x, to.actualBounds.bottom);
      toPt = new goInstance.Point(from.actualBounds.center.x, from.actualBounds.top);
    } else {
      // overlapping y
      return null;
    }
  }
  
  // Only create links if the distance is positive and meaningful
  if (distance <= 0) return null;
  
  // Create the link data
  const linkData = {
    from: from.key,
    to: to.key,
    fromSpot: goInstance.Spot.None,
    toSpot: goInstance.Spot.None,
    points: [fromPt, toPt],
    distanceText: `${Math.round(distance)}px`
  };
  
  // Add the link to the diagram
  diagramInstance.model.addLinkData(linkData);
  return linkData;
};

// Function to clear distance links
export const clearDistanceLinks = (diagramInstance: any) => {
  if (!diagramInstance) return;
  
  // Remove any existing distance links
  diagramInstance.startTransaction("Remove distance links");
  const linksToRemove = [];
  diagramInstance.links.each((link: any) => {
    if (link.data.distanceText) {
      linksToRemove.push(link.data);
    }
  });
  
  // Remove all the links
  linksToRemove.forEach((linkData: any) => {
    diagramInstance.model.removeLinkData(linkData);
  });
  
  diagramInstance.commitTransaction("Remove distance links");
};

// Function to create dimensioning links between components
export const setupDimensioningLinks = (diagramInstance: any, goInstance: GoJSDiagram) => {
  if (!diagramInstance || !goInstance) return [];
  
  clearDistanceLinks(diagramInstance); // Clear existing links first
  
  // Get all nodes that are components
  const nodes: any[] = [];
  diagramInstance.nodes.each((node: any) => {
    if (!node.isGroup && node.actualBounds && node.actualBounds.width > 0) {
      nodes.push(node);
    }
  });
  
  const createdLinks: any[] = [];
  
  // Create dimensioning links between nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      
      // Create horizontal dimensioning links (if nodes are roughly aligned horizontally)
      if (Math.abs(node1.location.y - node2.location.y) < 100) {
        const link = createDimensioningLink(diagramInstance, goInstance, node1, node2, "Horizontal");
        if (link) createdLinks.push(link);
      }
      
      // Create vertical dimensioning links (if nodes are roughly aligned vertically)
      if (Math.abs(node1.location.x - node2.location.x) < 100) {
        const link = createDimensioningLink(diagramInstance, goInstance, node1, node2, "Vertical");
        if (link) createdLinks.push(link);
      }
    }
  }
  
  // Create dimensioning links between enclosures (groups)
  const groups: any[] = [];
  diagramInstance.groups.each((group: any) => {
    groups.push(group);
  });
  
  // Create links between groups
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const group1 = groups[i];
      const group2 = groups[j];
      
      // Measure distances between enclosures horizontally and vertically
      if (Math.abs(group1.location.y - group2.location.y) < 150) {
        const link = createDimensioningLink(diagramInstance, goInstance, group1, group2, "Horizontal");
        if (link) createdLinks.push(link);
      }
      
      if (Math.abs(group1.location.x - group2.location.x) < 150) {
        const link = createDimensioningLink(diagramInstance, goInstance, group1, group2, "Vertical");
        if (link) createdLinks.push(link);
      }
    }
  }
  
  return createdLinks;
};
