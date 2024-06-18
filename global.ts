// global.ts

// Only define `global.window` if it does not already exist
if (typeof global.window === 'undefined') {
  (global as any).window = {};
}

// Define userAgent based on the environment
const isWindowDefined = typeof window !== 'undefined';
const userAgent = isWindowDefined ? window?.navigator?.userAgent : 'Node.js';

// Export the variables for use in other parts of the application
export { isWindowDefined, userAgent };
