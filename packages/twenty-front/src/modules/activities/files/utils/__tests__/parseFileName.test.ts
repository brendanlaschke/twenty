import { parseFileName } from '../parseFileName';

describe('parseFileName', () => {
  it('should return the correct file name and extension', () => {
    expect(parseFileName('test.doc')).toEqual({
      name: 'test',
      extension: 'doc',
    });
    expect(parseFileName('test.xls')).toEqual({
      name: 'test',
      extension: 'xls',
    });
    expect(parseFileName('abc.ppt')).toEqual({ name: 'abc', extension: 'ppt' });
    expect(parseFileName('def.png')).toEqual({ name: 'def', extension: 'png' });
    expect(parseFileName('test.ab.mp4')).toEqual({
      name: 'test.ab',
      extension: 'mp4',
    });
    expect(parseFileName('test')).toEqual({ name: 'test', extension: '' });
  });
});
