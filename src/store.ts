import isEqual from './isEqual';
import { makePublicationHandler, Publisher } from './publisher';

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
    partial: Selector<StateOf<TStore>>,
  ) => {
    const partialState =
      typeof partial === 'function' ? partial(store.state) : partial;
    const newStore = { ...store, state: { ...store.state, ...partialState } };
    const prevStore = store;

    if (!isEqual(newStore.state, prevStore.state)) {
      notify(newStore, prevStore);
    }

    store = newStore;
  };

  const getStore = () => store;

  store = config(setState, getStore);

  return { getStore, subscribe };
};

export default makeStore;
