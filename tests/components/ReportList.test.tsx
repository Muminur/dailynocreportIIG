/**
 * ReportList Component Tests
 */

import { render, screen } from '@testing-library/react';
import { ReportList } from '@/components/dashboard/ReportList';

describe('ReportList', () => {
  it('should render empty state by default', () => {
    render(<ReportList />);
    
    expect(screen.getByText('No reports yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first NOC report to get started')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate report/i })).toBeInTheDocument();
  });

  it('should display loading skeleton when isLoading is true', () => {
    const { container } = render(<ReportList isLoading={true} />);
    
    // Check for skeleton elements
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should have disabled generate button', () => {
    render(<ReportList />);
    
    const button = screen.getByRole('button', { name: /generate report/i });
    expect(button).toBeDisabled();
  });

  it('should show coming soon message', () => {
    render(<ReportList />);
    
    expect(screen.getByText('Feature coming in Milestone 5')).toBeInTheDocument();
  });
});

