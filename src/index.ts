import isEqual from './isEqual';

// templates
export type StoreTemplate = {
  state: object;
  actions?: Record<string, (...params: any[]) => void>;
};
export type StateOf<TStore extends StoreTemplate> = TStore['state'];

// selectors
type SelectorFunc<T extends object> = (arg: T) => Partial<T>;
export type Selector<T extends object> = Partial<T> | SelectorFunc<T>;

// setter and getters
export type Mutate<T extends object> = (partial: Selector<T>) => void;
export type GetStore<T> = () => T;

// store config
// take  (set, get) => { state: T, actions: U }
export type StoreConfig<TStore extends StoreTemplate> = (
  set: Mutate<StateOf<TStore>>,
  get: GetStore<TStore>,
) => TStore;

// publisher and subscriber
export type StorePublisher<TStore extends object> = {
  getStore: GetStore<TStore>;
  subscribe: (subscriber: StoreSubscriber<TStore>) => () => boolean;
};

export type StoreSubscriber<TStore extends object> = (
  store: TStore,
  prevState: TStore,
) => void;

//-------------
// Implementation
//
const makeStorePublisher = <TStore extends StoreTemplate>(
  config: StoreConfig<TStore>,
): StorePublisher<TStore> => {
  let store: TStore;
  const subcribers = new Set<StoreSubscriber<TStore>>();

  const setState: Mutate<StateOf<TStore>> = (
    partial: Selector<StateOf<TStore>>,
  ) => {
    const partialState =
      typeof partial === 'function' ? partial(store.state) : partial;
    const newStore = { ...store, state: { ...store.state, ...partialState } };
    const prevStore = store;

    if (!isEqual(newStore.state, prevStore.state)) {
      subcribers.forEach((subcriber) => subcriber(newStore, prevStore));
    }

    store = newStore;
  };

  const getStore = () => store;

  const subscribe = (subcriber: StoreSubscriber<TStore>) => {
    subcribers.add(subcriber);
    return () => subcribers.delete(subcriber);
  };

  store = config(setState, getStore);
  return { getStore, subscribe };
};

export default makeStorePublisher;
