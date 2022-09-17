import * as React from 'react';
import { renderHook, waitFor, act, render } from '@testing-library/react';
import makeStoreHook from '../react';

interface TestStore {
  state: {
    counts: number;
  };
  actions: {
    addCounts: (by?: number) => void;
  };
}

describe('makeStoreHook', () => {
  it('will make a hook', () => {
    const useStore = makeStoreHook(() => ({
      state: {
        counts: 2,
      },
    }));

    const { result } = renderHook(() => useStore());

    expect(result.current.state.counts).toEqual(2);
  });

  it('will update when state changes', async () => {
    const useStore = makeStoreHook<TestStore>((set) => ({
      state: {
        counts: 2,
      },
      actions: {
        addCounts: () => {
          set({ counts: 5 });
        },
      },
    }));

    const { result } = renderHook(() => useStore());
    expect(result.current.state.counts).toEqual(2);

    await act(() => {
      result.current.actions.addCounts();
    });

    expect(result.current.state.counts).toEqual(5);
  });

  it('will accept selector', async () => {
    const useStore = makeStoreHook<TestStore>((set) => ({
      state: {
        counts: 2,
      },
      actions: {
        addCounts: () => {
          set({ counts: 5 });
        },
      },
    }));

    const { result } = renderHook(() => useStore((s) => s.state.counts));
    expect(result.current.state.counts).toEqual(2);

    await act(() => {
      result.current.actions.addCounts();
    });

    expect(result.current.state.counts).toEqual(5);
  });
});
