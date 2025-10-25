/**
 * useAutoSave Hook Tests
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';

describe('useAutoSave Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should call onSave after delay', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const data = { test: 'data' };

    renderHook(() =>
      useAutoSave({
        data,
        onSave,
        delay: 2000,
      })
    );

    // Fast-forward time
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(data);
    });
  });

  it('should debounce multiple changes', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    let data = { test: 'data1' };

    const { rerender } = renderHook(() =>
      useAutoSave({
        data,
        onSave,
        delay: 2000,
      })
    );

    // Change data multiple times
    data = { test: 'data2' };
    rerender();

    jest.advanceTimersByTime(1000);

    data = { test: 'data3' };
    rerender();

    jest.advanceTimersByTime(1000);

    data = { test: 'data4' };
    rerender();

    // Complete the timer
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      // Should only be called once with the last data
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  it('should not save when disabled', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const data = { test: 'data' };

    renderHook(() =>
      useAutoSave({
        data,
        onSave,
        delay: 2000,
        enabled: false,
      })
    );

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  it('should handle save errors', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));
    const data = { test: 'data' };

    const { result } = renderHook(() =>
      useAutoSave({
        data,
        onSave,
        delay: 100,
      })
    );

    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(result.current.error).toBe('Save failed');
    });
  });

  it('should update saving state', async () => {
    const onSave = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    const data = { test: 'data' };

    const { result } = renderHook(() =>
      useAutoSave({
        data,
        onSave,
        delay: 100,
      })
    );

    expect(result.current.isSaving).toBe(false);

    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(result.current.lastSaved).toBeTruthy();
    });
  });
});

