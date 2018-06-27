import { expect } from 'chai';
import Library from '../src/index';

describe('Library', () => {
  describe('constructor', () => {
    it(`should return "foo bar" when its id is bar.`, () => {
      const lib = new Library({ id: 'bar' });
      expect(lib.foo()).to.be.equal(`foo bar`);
    });
  });
});
