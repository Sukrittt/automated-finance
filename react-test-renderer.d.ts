declare module 'react-test-renderer' {
  import type * as React from 'react';

  export type ReactTestRenderer = {
    toJSON: () => unknown;
    unmount: () => void;
  };

  export function create(element: React.ReactElement): ReactTestRenderer;
  export function act<T>(callback: () => Promise<T> | T): Promise<T>;

  const renderer: {
    create: typeof create;
  };

  export default renderer;
}
