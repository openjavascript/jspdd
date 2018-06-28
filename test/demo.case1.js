import { expect } from 'chai';
import { util } from '../src/demo-case1';

describe('util', () => {
  it(`should return object contains foo`, () => {
    const foo = 'foo';
    expect(util(foo)).to.be.deep.equal({ foo });
  });
});
