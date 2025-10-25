/**
 * StatsCards Component Tests
 */

import { render, screen } from '@testing-library/react';
import { StatsCards } from '@/components/dashboard/StatsCards';

describe('StatsCards', () => {
  it('should render all three stat cards', () => {
    render(<StatsCards />);
    
    expect(screen.getByText('Total Reports')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Avg Time')).toBeInTheDocument();
  });

  it('should display placeholder values', () => {
    render(<StatsCards />);
    
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues).toHaveLength(2);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should have responsive grid layout', () => {
    const { container } = render(<StatsCards />);
    const gridDiv = container.querySelector('.grid.gap-4.md\\:grid-cols-3');
    expect(gridDiv).toBeInTheDocument();
  });
});

