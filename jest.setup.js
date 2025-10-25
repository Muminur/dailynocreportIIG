/**
 * Jest Setup File
 */

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock canvas for jsPDF
if (typeof document !== 'undefined') {
  document.createElementNS = function() {
    return {
      getContext: function() {
        return {
          fillRect: function() {},
          clearRect: function() {},
          getImageData: function() {
            return {
              data: new Array(4)
            };
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
      }
    };
  };
}
