type SetPartialState<TState> =
  | Partial<TState>
  | { (prevState: TState): Partial<TState> };

interface SetState<TState> {
  (partial: SetPartialState<TState>): void;
}
interface GetState<TState> {
  (): TState;
}
interface StorePublisher<TState extends object> {
  getState: GetState<TState>;
}

interface StoreConfig<TState> {
  (set: SetState<TState>): TState;
}

// take something like (set, get) => state
// return {getState, subscribe, destroy}
const makeStorePublisher = <T extends object>(
  config: StoreConfig<T>,
): StorePublisher<T> => {
  let state: T;

  const setState: SetState<T> = (partial: SetPartialState<T>) => {
    const partialState =
      typeof partial === 'function' ? partial(state) : partial;
    const newState = { ...state, ...partialState };
    state = newState;
  };

  state = config(setState);

  const getState = () => state;

  return { getState };
};

export default makeStorePublisher;
