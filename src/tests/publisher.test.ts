import { makePublicationHandler } from '../publisher';

interface TestState {
  counts: number;
}
describe('makePublicationHandler', () => {
  beforeEach(jest.clearAllMocks);

  it('will return a publication handler', () => {
    const result = makePublicationHandler<TestState>();

    expect(typeof result.subscribe).toBe('function');
    expect(typeof result.notify).toBe('function');
  });

  it('will notify subcriber', () => {
    const subcriber = jest.fn();
    const { subscribe, notify } = makePublicationHandler<TestState>();

    subscribe(subcriber);
    notify({ counts: 4 }, { counts: 2 });

    expect(subcriber).toBeCalledWith({ counts: 4 }, { counts: 2 });
  });

  it('will notify multiple subcribers', () => {
    const nSubscribers = Math.floor(Math.random() * 9) + 1;
    const subscribers = Array.from({ length: nSubscribers }, () => jest.fn());

    const { subscribe, notify } = makePublicationHandler<TestState>();

    subscribers.forEach((s) => {
      subscribe(s);
    });
    notify({ counts: 4 }, { counts: 2 });

    subscribers.forEach((s) => {
      expect(s).toBeCalledWith({ counts: 4 }, { counts: 2 });
    });
  });

  it('will unsubscribe subcriber', () => {
    const subscriber = jest.fn();
    const { subscribe, notify } = makePublicationHandler<TestState>();

    const unsubscribe = subscribe(subscriber);
    notify({ counts: 4 }, { counts: 2 });

    expect(subscriber).toBeCalledWith({ counts: 4 }, { counts: 2 });
    expect(subscriber).toHaveBeenCalledTimes(1);

    unsubscribe();
    notify({ counts: 5 }, { counts: 4 });
    expect(subscriber).toHaveBeenCalledTimes(1); // no call
  });
});
