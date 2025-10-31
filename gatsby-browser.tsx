import React from 'react';
import { AuthProvider } from './src/features/layout/AuthProvider';

export const wrapRootElement = ({ element }: { element: React.ReactNode }) => (
  <AuthProvider>
    {element}
  </AuthProvider>
);
