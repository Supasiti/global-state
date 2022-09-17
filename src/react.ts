import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import makeStore, { StoreConfig, StoreTemplate } from './store';

export type Selector<T> = (from: T) => any;
export type StoreHook<TStore extends StoreTemplate, TSlice> = (
  selector?: (from: TStore) => TSlice,
) => TSlice;

const makeStoreHook = <TStore extends StoreTemplate>(
  config: StoreConfig<TStore>,
) => {
  const store = makeStore(config);

  function useStore(): TStore;
  function useStore<TSlice>(selector: (from: TStore) => TSlice): TSlice;
  function useStore<TSlice>(selector?: (from: TStore) => TSlice) {
    const select = useCallback(
      (from: TStore) => (selector ? selector(from) : from),
      [selector],
    );

    const state = useSyncExternalStore(store.subscribe, () =>
      select(store.getStore()),
    );

    return state;
  }

  return useStore;
};

export default makeStoreHook;
