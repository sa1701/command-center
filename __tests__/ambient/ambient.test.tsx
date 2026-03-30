/**
 * Ambient component unit tests
 *
 * Run with: npx jest __tests__/ambient/ambient.test.tsx
 *
 * Setup required (not yet installed):
 *   npm install --save-dev jest jest-environment-jsdom @testing-library/react
 *                          @testing-library/jest-dom @types/jest
 *                          ts-jest babel-jest @babel/preset-env @babel/preset-react
 *                          @babel/preset-typescript
 *
 * jest.config.ts (project root):
 *   export default {
 *     testEnvironment: 'jsdom',
 *     transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
 *     moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
 *     setupFilesAfterFramework: ['@testing-library/jest-dom'],
 *   };
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// ---------------------------------------------------------------------------
// Mock canvas API — jsdom does not implement HTMLCanvasElement.getContext
// ---------------------------------------------------------------------------
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  // Mock requestAnimationFrame
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    setTimeout(() => cb(performance.now()), 0);
    return 0;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(jest.fn());

  // Mock ResizeObserver
  global.ResizeObserver = class {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  };
});

afterAll(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Mock Zustand store
// ---------------------------------------------------------------------------
jest.mock('@/lib/store', () => {
  const actual = jest.requireActual('@/lib/store');
  return {
    __esModule: true,
    default: (selector: (s: { themeId: string }) => unknown) =>
      selector({ themeId: 'ot-raimi' }),
  };
});

// ---------------------------------------------------------------------------
// Lazy imports after mocks are set up
// ---------------------------------------------------------------------------
import Starfield from '@/components/ambient/Starfield';
import WebPattern from '@/components/ambient/WebPattern';
import ScanLines from '@/components/ambient/ScanLines';
import HalftoneOverlay from '@/components/ambient/HalftoneOverlay';
import AmbientRenderer from '@/components/ambient/AmbientRenderer';

// ---------------------------------------------------------------------------
// Starfield
// ---------------------------------------------------------------------------
describe('Starfield', () => {
  it('renders a canvas element', () => {
    const { container } = render(<Starfield />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('canvas is aria-hidden', () => {
    const { container } = render(<Starfield />);
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true');
  });

  it('canvas has pointer-events: none', () => {
    const { container } = render(<Starfield />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.pointerEvents).toBe('none');
  });

  it('canvas has fixed position', () => {
    const { container } = render(<Starfield />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.position).toBe('fixed');
  });

  it('accepts speed and density props without crashing', () => {
    expect(() => render(<Starfield speed={0.4} density={0.5} />)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// WebPattern
// ---------------------------------------------------------------------------
describe('WebPattern', () => {
  it('renders an SVG element', () => {
    const { container } = render(<WebPattern />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('wrapper div is aria-hidden', () => {
    const { container } = render(<WebPattern />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('wrapper has pointer-events: none', () => {
    const { container } = render(<WebPattern />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.pointerEvents).toBe('none');
  });

  it('wrapper has fixed position', () => {
    const { container } = render(<WebPattern />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.position).toBe('fixed');
  });

  it('renders path and circle elements for web geometry', () => {
    const { container } = render(<WebPattern />);
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('circle').length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// ScanLines
// ---------------------------------------------------------------------------
describe('ScanLines', () => {
  it('renders without crashing', () => {
    expect(() => render(<ScanLines />)).not.toThrow();
  });

  it('wrapper is aria-hidden', () => {
    const { container } = render(<ScanLines />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('wrapper has pointer-events: none', () => {
    const { container } = render(<ScanLines />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.pointerEvents).toBe('none');
  });

  it('renders CRT band when animated=true', () => {
    // The animated band is the second child div inside the wrapper
    const { container } = render(<ScanLines animated={true} />);
    // wrapper has 3 children: scan lines div, band div, vignette div
    expect(container.firstChild?.childNodes.length).toBe(3);
  });

  it('omits CRT band when animated=false', () => {
    const { container } = render(<ScanLines animated={false} />);
    // wrapper has 2 children: scan lines div, vignette div
    expect(container.firstChild?.childNodes.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// HalftoneOverlay
// ---------------------------------------------------------------------------
describe('HalftoneOverlay', () => {
  it('renders without crashing', () => {
    expect(() => render(<HalftoneOverlay />)).not.toThrow();
  });

  it('wrapper is aria-hidden', () => {
    const { container } = render(<HalftoneOverlay />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('wrapper has pointer-events: none', () => {
    const { container } = render(<HalftoneOverlay />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.pointerEvents).toBe('none');
  });

  it('applies dotSize and spacing to backgroundSize', () => {
    const { container } = render(<HalftoneOverlay dotSize={4} spacing={18} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.backgroundSize).toBe('18px 18px');
  });
});

// ---------------------------------------------------------------------------
// AmbientRenderer
// ---------------------------------------------------------------------------
describe('AmbientRenderer', () => {
  it('renders without crashing', () => {
    expect(() => render(<AmbientRenderer />)).not.toThrow();
  });

  it('outer wrapper is aria-hidden', () => {
    const { container } = render(<AmbientRenderer />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('outer wrapper has fixed position and zero z-index', () => {
    const { container } = render(<AmbientRenderer />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.position).toBe('fixed');
    expect(wrapper.style.zIndex).toBe('0');
  });

  it('outer wrapper has pointer-events: none', () => {
    const { container } = render(<AmbientRenderer />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.pointerEvents).toBe('none');
  });

  // Theme switching: override mock for different themeId values
  it.each([
    ['ot-raimi'],
    ['prequel'],
    ['sequel'],
    ['webb-verse'],
    ['spider-verse'],
    ['mcu-spider'],
    ['unknown-theme'],
  ])('renders without throwing for themeId "%s"', (themeId) => {
    jest.resetModules();
    // Re-mock store with the specific themeId for this test
    jest.doMock('@/lib/store', () => ({
      __esModule: true,
      default: (selector: (s: { themeId: string }) => unknown) =>
        selector({ themeId }),
    }));
    expect(() => render(<AmbientRenderer />)).not.toThrow();
  });
});
