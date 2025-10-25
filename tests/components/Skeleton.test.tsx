/**
 * Skeleton Component Tests
 */

import { render } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton', () => {
  it('should render with animate-pulse class', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', 'custom-class');
  });

  it('should accept additional props', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveAttribute('data-testid', 'skeleton');
  });
});

