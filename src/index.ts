import isEqual from './isEqual';

type SetPartialStateFunc<TState> = (prevState: TState) => Partial<TState>;
type SetPartialState<TState> = Partial<TState> | SetPartialStateFunc<TState>;

interface SetState<TState> {
  (partial: SetPartialState<TState>): void;
}
interface GetState<TState> {
  (): TState;
}
interface StorePublisher<TState extends object> {
  getState: GetState<TState>;
  subscribe: (subscriber: StoreSubscriber<TState>) => void;
}

interface StoreConfig<TState> {
  (set: SetState<TState>, get: GetState<TState>): TState;
}

type StoreSubscriber<TState> = (state: TState, prevState: TState) => void;

// take something like (set, get) => state
// return {getState, subscribe, destroy}
const makeStorePublisher = <T extends object>(
  config: StoreConfig<T>,
): StorePublisher<T> => {
  let state: T;
  const subcribers = new Set<StoreSubscriber<T>>();

  const setState: SetState<T> = (partial: SetPartialState<T>) => {
    const partialState =
      typeof partial === 'function' ? partial(state) : partial;
    const newState = { ...state, ...partialState };
    const prevState = state;

    if (!isEqual(newState, prevState)) {
      subcribers.forEach((subcriber) => subcriber(newState, prevState));
    }

    state = newState;
  };

  const getState = () => state;

  const subscribe = (subcriber: StoreSubscriber<T>) => {
    subcribers.add(subcriber);
  };

  state = config(setState, getState);

  return { getState, subscribe };
};

export default makeStorePublisher;
