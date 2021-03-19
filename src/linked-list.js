'use strict';

class _Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  // a linked list has 6 methods for insertion - insertFirst, insertLast, insertAt, insertBefore, insertAfter
  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }

  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item);
    } else {
      let tempNode = this.head;
      while (tempNode.next !== null) {
        tempNode = tempNode.next;
      }
      tempNode.next = new _Node(item, null);
    }
  }

  insertBefore(newValue, beforeTarget) {
  }

  insertAfter(newValue, afterTarget) {
  }


}
