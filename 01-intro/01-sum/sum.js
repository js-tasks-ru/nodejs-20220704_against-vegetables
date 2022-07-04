function sum(a, b) {
  [a, b].forEach((i) => {
    if (typeof i !== 'number' || isNaN(i)) {
      throw new TypeError('Arguments must be numbers!');
    }
  });

  return a + b;
}

module.exports = sum;
