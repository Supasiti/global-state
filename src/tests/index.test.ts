import makeStorePublisher from '..';

interface TestState {
  counts: number;
  addCounts: (by?: number) => void;
}

describe('makeStorePublisher', () => {
  describe('getState', () => {
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

    it('should support get function', () => {
      interface TestGet {
        counts: number;
        getCounts: () => number;
      }
      const result = makeStorePublisher<TestGet>((_set, get) => ({
        counts: 2,
        getCounts: () => get().counts + 3,
      }));

      expect(result.getState().counts).toEqual(2);

      const newCounts = result.getState().getCounts();
      expect(newCounts).toEqual(5);
      expect(result.getState().counts).toEqual(2);
    });
  });

  describe('subscribe', () => {
    it('should handle subscribe', () => {
      const subscriber = jest.fn();
      const publisher = makeStorePublisher<TestState>((set) => ({
        counts: 2,
        addCounts: (by?: number) => {
          const toAdd = by ?? 4;
          set((prev) => ({ counts: prev.counts + toAdd }));
        },
      }));
      publisher.subscribe(subscriber);
    });

    it('should call subcriber when state changed', () => {
      let outerCounts = 0;
      const subscriber = jest.fn(
        (state: TestState) => (outerCounts = state.counts),
      );
      const publisher = makeStorePublisher<TestState>((set) => ({
        counts: 2,
        addCounts: (by?: number) => {
          const toAdd = by ?? 0;
          set((prev) => ({ counts: prev.counts + toAdd }));
        },
      }));
      publisher.subscribe(subscriber);

      expect(publisher.getState().counts).toEqual(2);

      publisher.getState().addCounts();
      expect(publisher.getState().counts).toEqual(2);
      expect(subscriber).not.toBeCalled();

      publisher.getState().addCounts(2);
      expect(publisher.getState().counts).toEqual(4);
      expect(outerCounts).toEqual(4);
    });
  });
});
