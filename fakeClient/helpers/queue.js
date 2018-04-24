class Queue {
  constructor() {
    this.in = [];
    this.out = [];
  }
  enqueue(value) {
    return this.in.push(value);
  }
  dequeue() {
    if (!this.out.length) {
      while(this.in.length) {
        this.out.push(this.in.pop());
      }
    }
    return this.out.pop();
  }
}

module.exports = Queue
