const { readData } = require('../src/fileStore');

describe('readData', () => {
    test('returns the input path', () => {
        expect(readData('/tmp/test.txt')).toBe('/tmp/test.txt');
    });

    test('returns default for null input', () => {
        expect(readData(null)).toBe('default');
    });
});
