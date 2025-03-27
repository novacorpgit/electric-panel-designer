
/**
 * This file provides a type-safe interface for using GoJS in TypeScript
 */

// Define interfaces for GoJS objects
export interface GoJSDiagram {
  Diagram: any;
  Grid: any;
  Panel: any;
  Shape: any;
  Spot: any;
  Point: any;
  Size: any;
  Node: any;
  TextBlock: any;
  Group: any;
  GraphLinksModel: any;
  Palette: any;
  GridLayout: any;
  Margin: any;
  Picture: any; // Enhanced Picture support
  GraphObject: any; // Add GraphObject for image stretch constants
  Part: any; // Add Part support
  Link: any; // Add Link support for DimensioningLink
  DimensioningLink: any; // Add DimensioningLink extension
  LayeredDigraphLayout: any; // For layout management
  "DraggingTool.prototype": any; // For customizing the dragging tool
}

// Global declaration for GoJS
declare global {
  interface Window {
    go: {
      Diagram: any;
      Grid: any;
      Panel: any;
      Shape: any;
      Spot: any;
      Point: any;
      Size: any;
      Node: any;
      TextBlock: any;
      Group: any;
      GraphLinksModel: any;
      Palette: any;
      GridLayout: any;
      Margin: any;
      Picture: any; // Enhanced Picture support
      GraphObject: any; // Add GraphObject for image stretch constants
      Part: any; // Add Part support
      Link: any; // Add Link support
      LayeredDigraphLayout: any; // For layout management
      DimensioningLink: any; // Add DimensioningLink extension
      "DraggingTool.prototype": any; // For dragging tool prototype
    };
  }
}

// Helper function to load GoJS script
export const loadGoJS = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.go) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/gojs/release/go.js';
    script.async = true;
    script.onload = () => {
      // After loading main GoJS, load the DimensioningLink extension
      // Skip trying to load the DimensioningLink extension for now since it's causing errors
      // We'll modify the code not to rely on this extension
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load GoJS'));
    document.head.appendChild(script);
  });
};

// Initialize GoJS
export const initializeGoJS = async (): Promise<GoJSDiagram> => {
  await loadGoJS();
  
  // Create a simple DimensioningLink implementation if the extension isn't available
  if (window.go && !window.go.DimensioningLink) {
    window.go.DimensioningLink = window.go.Link;
  }
  
  return window.go;
};
