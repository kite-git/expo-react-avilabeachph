// Run with: node src/money.check.mts
import assert from 'node:assert/strict';
import { parseAmount } from './money.ts';

assert.equal(parseAmount('1,250.50'), 1250.5);
assert.equal(parseAmount(' 800 '), 800);
assert.equal(parseAmount('0.05'), 0.05);
assert.equal(parseAmount(''), null);
assert.equal(parseAmount('0'), null);
assert.equal(parseAmount('0.00'), null);
assert.equal(parseAmount('12.345'), null);
assert.equal(parseAmount('-50'), null);
assert.equal(parseAmount('abc'), null);
assert.equal(parseAmount('1.'), null);
console.log('money checks passed');
