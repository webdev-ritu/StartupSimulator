/// <reference types="node" />
/// <reference types="vite/client" />

// Support for importing SVG files
declare module '*.svg' {
    import * as React from 'react';
    export const ReactComponent: React.FunctionComponent<
      React.SVGProps<SVGSVGElement> & { title?: string }
    >;
    export default ReactComponent;
  }
  
  // Support for importing JSON files
  declare module '*.json' {
    const content: any;
    export default content;
  }