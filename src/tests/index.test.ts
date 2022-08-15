import makeStorePublisher from '..';

interface TestState {
  counts: number;
  addCounts: (by?: number) => void;
}

describe('makeStorePublisher', () => {
  it('should return without typing', () => {
    const result = makeStorePublisher(() => ({
      counts: 2,
    }));

    const state = result.getState();
    expect(state.counts).toEqual(2);
  });

  it('should return an object with getState', () => {
    const result = makeStorePublisher<TestState>(() => ({
      counts: 2,
      addCounts: () => {},
    }));

    const state = result.getState();
    expect(state.counts).toEqual(2);
    expect(typeof state.addCounts).toBe('function');
  });

  it('should mutate counts', () => {
    const result = makeStorePublisher<TestState>((set) => ({
      counts: 2,
      addCounts: () => {
        set({ counts: 5 });
      },
    }));

    expect(result.getState().counts).toEqual(2);

    result.getState().addCounts();
    expect(result.getState().counts).toEqual(5);
  });

  it('should mutate counts by some number', () => {
    const result = makeStorePublisher<TestState>((set) => ({
      counts: 2,
      addCounts: (by?: number) => {
        set({ counts: by ?? 4 });
      },
    }));

    expect(result.getState().counts).toEqual(2);

    result.getState().addCounts();
    expect(result.getState().counts).toEqual(4);

    result.getState().addCounts(6);
    expect(result.getState().counts).toEqual(6);
  });

  it('should handle mutation that depends on previous state', () => {
    const result = makeStorePublisher<TestState>((set) => ({
      counts: 2,
      addCounts: (by?: number) => {
        const toAdd = by ?? 4;
        set((prev) => ({ counts: prev.counts + toAdd }));
      },
    }));

    expect(result.getState().counts).toEqual(2);

    result.getState().addCounts();
    expect(result.getState().counts).toEqual(6);

    result.getState().addCounts(6);
    expect(result.getState().counts).toEqual(12);
  });
});
