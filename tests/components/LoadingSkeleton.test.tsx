/**
 * LoadingSkeleton Component Tests
 */

import { render } from '@testing-library/react';
import { LoadingSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render with default className', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeleton = container.firstChild;

    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('bg-gray-200');
    expect(skeleton).toHaveClass('rounded');
  });

  it('should accept custom className', () => {
    const { container } = render(<LoadingSkeleton className="h-10 w-full" />);
    const skeleton = container.firstChild;

    expect(skeleton).toHaveClass('h-10');
    expect(skeleton).toHaveClass('w-full');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should render inner div', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    const innerDiv = skeleton?.firstChild;

    expect(innerDiv).toBeInTheDocument();
    expect(innerDiv).toHaveClass('h-full');
    expect(innerDiv).toHaveClass('w-full');
  });
});

describe('TableSkeleton', () => {
  it('should render multiple skeleton rows', () => {
    const { container } = render(<TableSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');

    // Should have 6 skeletons (1 header + 5 rows)
    expect(skeletons.length).toBe(6);
  });

  it('should render with proper spacing', () => {
    const { container } = render(<TableSkeleton />);
    const wrapper = container.firstChild;

    expect(wrapper).toHaveClass('space-y-4');
  });

  it('should render header skeleton', () => {
    const { container } = render(<TableSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    const firstSkeleton = skeletons[0];

    expect(firstSkeleton).toHaveClass('h-12');
    expect(firstSkeleton).toHaveClass('w-full');
  });

  it('should render row skeletons with correct height', () => {
    const { container } = render(<TableSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');

    // Check row skeletons (skip first which is header)
    for (let i = 1; i < skeletons.length; i++) {
      expect(skeletons[i]).toHaveClass('h-16');
      expect(skeletons[i]).toHaveClass('w-full');
    }
  });
});

