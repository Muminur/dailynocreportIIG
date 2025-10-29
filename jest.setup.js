/**
 * Jest Setup File
 */

// Import jest-dom matchers
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock SVG and canvas elements for JSDOM compatibility
if (typeof document !== 'undefined') {
  const originalCreateElementNS = document.createElementNS?.bind(document);
  
  if (originalCreateElementNS) {
    document.createElementNS = function(namespaceURI, qualifiedName) {
      const element = originalCreateElementNS(namespaceURI, qualifiedName);
      
      // Add missing methods for SVG elements
      if (!element.setAttribute) {
        element.setAttribute = function(name, value) {
          this[name] = value;
        };
      }
      if (!element.getAttribute) {
        element.getAttribute = function(name) {
          return this[name];
        };
      }
      if (!element.removeAttribute) {
        element.removeAttribute = function(name) {
          delete this[name];
        };
      }
      
      // Add canvas context mock for jsPDF
      if (!element.getContext && qualifiedName === 'canvas') {
        element.getContext = function() {
          return {
            fillRect: function() {},
            clearRect: function() {},
            getImageData: function() {
              return { data: new Array(4) };
            },
            putImageData: function() {},
            createImageData: function() { return []; },
            setTransform: function() {},
            drawImage: function() {},
            save: function() {},
            fillText: function() {},
            restore: function() {},
            beginPath: function() {},
            moveTo: function() {},
            lineTo: function() {},
            closePath: function() {},
            stroke: function() {},
            translate: function() {},
            scale: function() {},
            rotate: function() {},
            arc: function() {},
            fill: function() {},
            measureText: function() {
              return { width: 0 };
            },
            transform: function() {},
            rect: function() {},
            clip: function() {},
          };
        };
      }
      
      return element;
    };
  }
}
