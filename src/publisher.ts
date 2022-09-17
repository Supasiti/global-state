export type Publisher<T> = {
  subscribe: (subscriber: Subscriber<T>) => () => void;
};

export type Subscriber<T> = (next: T, prev: T) => void;

export type PublicationHandler<T> = Publisher<T> & {
  notify: (next: T, prev: T) => void;
};

// ----------------
// implementation
//
export const makePublicationHandler = <T>(): PublicationHandler<T> => {
  const subcribers = new Set<Subscriber<T>>();

  const subscribe = (subcriber: Subscriber<T>) => {
    subcribers.add(subcriber);
    return () => subcribers.delete(subcriber);
  };

  const notify = (next: T, prev: T) => {
    subcribers.forEach((subcriber) => subcriber(next, prev));
  };

  return { subscribe, notify };
};
