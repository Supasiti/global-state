import makeStore from '../store';

interface TestStore {
  state: {
    counts: number;
  };
  actions: {
    addCounts: (by?: number) => void;
  };
}

describe('makeStore', () => {
  describe('getStore', () => {
    it('will return without typing', () => {
      const result = makeStore(() => ({
        state: {
          counts: 2,
        },
      }));

      const store = result.getStore();
      expect(store.state.counts).toEqual(2);
    });

    it('will return an object with getState', () => {
      const result = makeStore<TestStore>(() => ({
        state: {
          counts: 2,
        },
        actions: {
          addCounts: () => {},
        },
      }));
      const { state, actions } = result.getStore();
      expect(state.counts).toEqual(2);
      expect(typeof actions.addCounts).toBe('function');
    });

    it('will mutate counts, but keep the same action instance', () => {
      const { getStore } = makeStore<TestStore>((set) => ({
        state: {
          counts: 2,
        },
        actions: {
          addCounts: () => {
            set({ counts: 5 });
          },
        },
      }));
      const {
        state: originalState,
        actions: { addCounts: prevAddCounts },
      } = getStore();
      expect(originalState.counts).toEqual(2);

      prevAddCounts();

      const {
        state: newState,
        actions: { addCounts: newAddCounts },
      } = getStore();
      expect(newState.counts).toEqual(5);
      expect(newAddCounts).toEqual(prevAddCounts);
    });

    it('will mutate counts by some number', () => {
      const { getStore } = makeStore<TestStore>((set) => ({
        state: {
          counts: 2,
        },
        actions: {
          addCounts: (by?: number) => {
            set({ counts: by ?? 4 });
          },
        },
      }));

      expect(getStore().state.counts).toEqual(2);

      getStore().actions.addCounts();
      expect(getStore().state.counts).toEqual(4);

      getStore().actions.addCounts(6);
      expect(getStore().state.counts).toEqual(6);
    });

    it('will handle mutation that depends on previous state', () => {
      const { getStore } = makeStore<TestStore>((set) => ({
        state: {
          counts: 2,
        },
        actions: {
          addCounts: (by?: number) => {
            const toAdd = by ?? 4;
            set((prev) => ({ counts: prev.counts + toAdd }));
          },
        },
      }));

      expect(getStore().state.counts).toEqual(2);

      getStore().actions.addCounts();
      expect(getStore().state.counts).toEqual(6);

      getStore().actions.addCounts(6);
      expect(getStore().state.counts).toEqual(12);
    });

    it('will support get function', () => {
      interface TestGet {
        state: {
          counts: number;
        };
        actions: {
          getCounts: () => number;
        };
      }
      const { getStore } = makeStore<TestGet>((_set, get) => ({
        state: {
          counts: 2,
        },
        actions: {
          getCounts: () => get().state.counts + 3,
        },
      }));

      expect(getStore().state.counts).toEqual(2);

      const newCounts = getStore().actions.getCounts();
      expect(newCounts).toEqual(5);
      expect(getStore().state.counts).toEqual(2);
    });
  });

  describe('subscribe', () => {
    it('will handle subscribe', () => {
      const subscriber = jest.fn();
      const publisher = makeStore<TestStore>((set) => ({
        state: {
          counts: 2,
        },
        actions: {
          addCounts: (by?: number) => {
            const toAdd = by ?? 4;
            set((prev) => ({ counts: prev.counts + toAdd }));
          },
        },
      }));
      publisher.subscribe(subscriber);
    });

    it('will call subcriber when state changed', () => {
      let outerCounts = 0;
      const subscriber = jest.fn(
        (store: TestStore) => (outerCounts = store.state.counts),
      );
      const { subscribe, getStore } = makeStore<TestStore>((set) => ({
        state: {
          counts: 2,
        },
        actions: {
          addCounts: (by?: number) => {
            const toAdd = by ?? 0;
            set((prev) => ({ counts: prev.counts + toAdd }));
          },
        },
      }));
      subscribe(subscriber);

      expect(getStore().state.counts).toEqual(2);

      getStore().actions.addCounts(); // state doesn't change
      expect(getStore().state.counts).toEqual(2);
      expect(subscriber).not.toBeCalled();

      getStore().actions.addCounts(2);
      expect(getStore().state.counts).toEqual(4);
      expect(outerCounts).toEqual(4);
    });

    it('will unsubscribe subcriber', () => {
      const subscriber = jest.fn();
      const { subscribe, getStore } = makeStore<TestStore>((set) => ({
        state: {
          counts: 2,
        },
        actions: {
          addCounts: () => {
            set((prev) => ({ counts: prev.counts + 2 }));
          },
        },
      }));
      const unsubscribe = subscribe(subscriber);

      expect(getStore().state.counts).toEqual(2);

      getStore().actions.addCounts();
      expect(getStore().state.counts).toEqual(4);
      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();

      getStore().actions.addCounts();
      expect(getStore().state.counts).toEqual(6);
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });
});
