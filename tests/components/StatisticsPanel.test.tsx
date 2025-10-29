/**
 * StatisticsPanel Component Tests
 */

import { render, screen } from '@testing-library/react';
import StatisticsPanel from '@/components/report/StatisticsPanel';
import type { ReportStatistics } from '@/types';

describe('StatisticsPanel', () => {
  const mockStatistics: ReportStatistics = {
    totalServices: 10,
    totalNewComplaints: 5,
    recurringComplaints: 2,
    complaintsUnresolved: 3,
    complaintsResolved: 4,
  };

  it('should render all statistics cards', () => {
    render(<StatisticsPanel statistics={mockStatistics} />);

    expect(screen.getByText('Total Services')).toBeInTheDocument();
    expect(screen.getByText('New Complaints')).toBeInTheDocument();
    expect(screen.getByText('Recurring')).toBeInTheDocument();
    expect(screen.getByText('Unresolved')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('should display correct values', () => {
    render(<StatisticsPanel statistics={mockStatistics} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should render with zero values', () => {
    const zeroStats: ReportStatistics = {
      totalServices: 0,
      totalNewComplaints: 0,
      recurringComplaints: 0,
      complaintsUnresolved: 0,
      complaintsResolved: 0,
    };

    render(<StatisticsPanel statistics={zeroStats} />);

    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(5);
  });

  it('should render with large numbers', () => {
    const largeStats: ReportStatistics = {
      totalServices: 999,
      totalNewComplaints: 888,
      recurringComplaints: 777,
      complaintsUnresolved: 666,
      complaintsResolved: 555,
    };

    render(<StatisticsPanel statistics={largeStats} />);

    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('888')).toBeInTheDocument();
    expect(screen.getByText('777')).toBeInTheDocument();
    expect(screen.getByText('666')).toBeInTheDocument();
    expect(screen.getByText('555')).toBeInTheDocument();
  });

  it('should have grid layout', () => {
    const { container } = render(<StatisticsPanel statistics={mockStatistics} />);
    const grid = container.querySelector('.grid');

    expect(grid).toBeInTheDocument();
  });

  it('should render all stat cards', () => {
    const { container } = render(<StatisticsPanel statistics={mockStatistics} />);
    const cards = container.querySelectorAll('.rounded-lg');

    // Should have 5 cards
    expect(cards.length).toBeGreaterThanOrEqual(5);
  });
});

