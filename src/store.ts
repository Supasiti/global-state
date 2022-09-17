import isEqual from './isEqual';
import { makePublicationHandler, Publisher } from './publisher';

// templates
export type StoreTemplate = {
  state: object;
  actions?: Record<string, (...params: any[]) => void>;
};
export type StateOf<TStore extends StoreTemplate> = TStore['state'];

// selectors
type PartialStateFunc<T extends object> = (arg: T) => Partial<T>;
export type PartialState<T extends object> = Partial<T> | PartialStateFunc<T>;

// setter and getters
export type Mutate<T extends object> = (partial: PartialState<T>) => void;
export type GetStore<T> = () => T;

// store config
// take  (set, get) => { state: T, actions: U }
export type StoreConfig<TStore extends StoreTemplate> = (
  set: Mutate<StateOf<TStore>>,
  get: GetStore<TStore>,
) => TStore;

// store
export type Store<TStore extends object> = Publisher<TStore> & {
  getStore: GetStore<TStore>;
};

//-------------
// Implementation
//
const makeStore = <TStore extends StoreTemplate>(
  config: StoreConfig<TStore>,
): Store<TStore> => {
  let store: TStore;
  const { subscribe, notify } = makePublicationHandler<TStore>();

  const setState: Mutate<StateOf<TStore>> = (
    partial: PartialState<StateOf<TStore>>,
  ) => {
    const partialState =
      typeof partial === 'function' ? partial(store.state) : partial;
    const newStore = { ...store, state: { ...store.state, ...partialState } };

    if (!isEqual(newStore.state, store.state)) {
      const prevStore = store;
      store = newStore; // need to set new state before notifying
      notify(newStore, prevStore);
    }
  };

  const getStore = () => store;

  store = config(setState, getStore);

  return { getStore, subscribe };
};

export default makeStore;
