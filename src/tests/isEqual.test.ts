import isEqual from '../isEqual';

const arr = ['1', '2', '3'];
const obj = { d: 1, e: 3 };
const func = () => {};

describe('isEqual', () => {
  test.each([
    { objA: null, objB: { a: 2 }, expected: false },
    { objA: undefined, objB: { a: 2 }, expected: false },
    { objA: { a: 2 }, objB: { a: 2, b: 3 }, expected: false },
    {
      objA: { a: 2, fnA: () => {} },
      objB: { a: 2, fnA: () => {} },
      expected: false,
    },
    {
      objA: { a: 2, fnA: func },
      objB: { a: 2, fnA: func },
      expected: true,
    },
    {
      objA: { a: 2, f: arr, c: obj },
      objB: { a: 2, f: arr, c: obj },
      expected: true,
    },
    {
      objA: { a: 2, f: [], c: obj },
      objB: { a: 2, f: [], c: obj },
      expected: false,
    },
    {
      objA: { a: 2, c: {} },
      objB: { a: 2, c: {} },
      expected: false,
    },
  ])('should return shallow comparison', ({ objA, objB, expected }) => {
    const result = isEqual(objA, objB);
    expect(result).toEqual(expected);
  });
});
