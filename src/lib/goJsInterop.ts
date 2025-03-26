
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
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load GoJS'));
    document.head.appendChild(script);
  });
};

// Initialize GoJS
export const initializeGoJS = async (): Promise<GoJSDiagram> => {
  await loadGoJS();
  return window.go;
};
