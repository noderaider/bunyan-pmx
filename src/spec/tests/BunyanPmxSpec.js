describe('bunyan-pmx', () => {
  const BunyanPmx = require('../../lib').default

  const data = {}
  const res = { send: () => {}, error: () => {} }

  it('requires params', () => expect(() => new BunyanPmx()).toThrow())
  it('returns an object', () => expect(new BunyanPmx({ data, res })).toEqual(jasmine.any(Object)))
  it('has write function', () => expect(new BunyanPmx({ data, res }).write).toBeDefined())
  it('has error function', () => expect(new BunyanPmx({ data, res }).error).toBeDefined())
})
