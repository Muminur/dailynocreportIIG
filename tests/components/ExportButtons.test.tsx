/**
 * ExportButtons Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportButtons from '@/components/report/ExportButtons';

// Mock fetch
global.fetch = jest.fn();

// Mock URL methods
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();

Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: mockCreateObjectURL,
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
  writable: true,
  value: mockRevokeObjectURL,
});

describe('ExportButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render XLSX and PDF export buttons', () => {
    render(<ExportButtons reportId="test-123" />);

    expect(screen.getByText('Export XLSX')).toBeInTheDocument();
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });

  it('should call API when XLSX button is clicked', async () => {
    const mockBlob = new Blob(['mock data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    render(<ExportButtons reportId="test-123" />);

    const xlsxButton = screen.getByText('Export XLSX');
    fireEvent.click(xlsxButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reports/test-123/export?format=xlsx');
    });
  });

  it('should call API when PDF button is clicked', async () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    render(<ExportButtons reportId="test-123" />);

    const pdfButton = screen.getByText('Export PDF');
    fireEvent.click(pdfButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reports/test-123/export?format=pdf');
    });
  });

  it('should show loading state while exporting', async () => {
    let resolveExport: (value: any) => void;
    const exportPromise = new Promise(resolve => {
      resolveExport = resolve;
    });

    (global.fetch as jest.Mock).mockImplementation(() => exportPromise);

    render(<ExportButtons reportId="test-123" />);

    const xlsxButton = screen.getByText('Export XLSX');
    fireEvent.click(xlsxButton);

    // Check that buttons show loading state (both buttons are disabled)
    await waitFor(() => {
      const exportingButtons = screen.getAllByText('Exporting...');
      expect(exportingButtons.length).toBeGreaterThan(0);
    });

    // Resolve the promise
    resolveExport!({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });
  });

  it('should disable buttons while exporting', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob()),
      }), 100))
    );

    render(<ExportButtons reportId="test-123" />);

    const xlsxButton = screen.getByText('Export XLSX') as HTMLButtonElement;
    const pdfButton = screen.getByText('Export PDF') as HTMLButtonElement;
    
    fireEvent.click(xlsxButton);

    await waitFor(() => {
      expect(xlsxButton.disabled).toBe(true);
      expect(pdfButton.disabled).toBe(true);
    });
  });

  it('should show error message on export failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    render(<ExportButtons reportId="test-123" />);

    const xlsxButton = screen.getByText('Export XLSX');
    fireEvent.click(xlsxButton);

    await waitFor(() => {
      expect(screen.getByText('Export failed')).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ExportButtons reportId="test-123" />);

    const xlsxButton = screen.getByText('Export XLSX');
    fireEvent.click(xlsxButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should download file on successful export', async () => {
    const mockBlob = new Blob(['mock data']);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    render(<ExportButtons reportId="test-123" />);

    const xlsxButton = screen.getByText('Export XLSX');
    fireEvent.click(xlsxButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  it('should cleanup blob URL after download', async () => {
    const mockBlob = new Blob(['mock data']);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    render(<ExportButtons reportId="test-123" />);

    const xlsxButton = screen.getByText('Export XLSX');
    fireEvent.click(xlsxButton);

    await waitFor(() => {
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});

