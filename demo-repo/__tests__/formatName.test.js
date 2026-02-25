const { formatName } = require('../src/formatName');

describe('formatName', () => {
    test('formats first and last name with space', () => {
        expect(formatName('John', 'Doe')).toBe('John Doe');
    });

    test('formats single names', () => {
        expect(formatName('Alice', 'Smith')).toBe('Alice Smith');
    });
});
