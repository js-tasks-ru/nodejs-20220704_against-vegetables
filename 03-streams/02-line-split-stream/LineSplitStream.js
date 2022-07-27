const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.items = [];
    this.currentString = '';
  }

  _transform(chunk, encoding, callback) {
    this.currentString += chunk.toString();
    this.items = this.currentString.split(os.EOL);
    this.currentString = this.items.pop();
    this.items.forEach((item) => {
      this.push(item);
    });
    callback(null);
  }

  _flush(callback) {
    callback(null, this.currentString);
  }
}

module.exports = LineSplitStream;
