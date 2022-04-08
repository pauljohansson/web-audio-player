class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
    this.previous = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.isCircular = false;
  }

  prependElement(value) {
    const newNode = new Node(value);

    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.previous = newNode;
      this.head = newNode;
      if (this.isCircular) {
        newNode.previous = this.tail;
        this.tail.next = newNode;
      }
    }
    this.length++;
  }

  appendElement(value) {
    const newNode = new Node(value);

    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.previous = this.tail;
      this.tail = newNode;
      if (this.isCircular) {
        newNode.next = this.head;
        this.head.previous = newNode;
      }
    }
    this.length++;
  }

  getElementAtIndex(index) {
    if (index < 0 || index >= this.length) return null;
    if (index === 0) return this.head;

    let currentIndex = 0;
    let currentNode = this.head;

    while (currentIndex !== index) {
      currentNode = currentNode.next;
      currentIndex++;
    }
    return currentNode;
  }

  getFirstElement() {
    if (this.head === null) return null;

    return this.head;
  }

  getLastElement() {
    if (this.tail === null) return null;

    return this.tail;
  }

  getIndexOfElement(value) {
    let currentIndex = 0;
    let currentNode = this.head;

    while (currentNode) {
      if (currentNode.value === value) return currentIndex;
      currentNode = currentNode.next;
      currentIndex++;
    }
    return -1;
  }

  insertElementAtIndex(index, value) {
    if (index === 0) return this.prependElement(value);
    if (index === this.length) return this.appendElement(value);
    if (index > 0 && index < this.length) {
      const newNode = new Node(value);
      const after = this.getElementAtIndex(index);
      const before = after.previous;

      newNode.previous = before;
      newNode.next = after;
      newNode.previous.next = newNode;
      after.previous = newNode;

      this.length++;
      return newNode;
    }
  }

  removeFirstElement() {
    if (this.head !== null) {
      let oldHead = this.head;
      this.head = this.head.next;
      if (this.isCircular) {
        this.head.previous = this.tail;
        this.tail.next = this.head;
      } else this.head.previous = null;

      this.length--;
      return oldHead;
    }
  }

  removeLastElement() {
    if (this.tail !== null) {
      let oldTail = this.tail;
      this.tail = this.tail.previous;
      if (this.isCircular) {
        this.tail.next = this.head;
        this.head.previous = this.tail;
      } else this.tail.next = null;

      this.length--;
      return oldTail;
    }
  }

  removeAllElements() {
    if (this.head !== null && this.tail !== null) {
      this.head = null;
      this.tail = null;
      this.length = 0;
    }
  }

  removeElementAtIndex(index) {
    if (index < 0 || index >= this.length) return null;
    if (index === 0) return this.removeFirstElement();
    if (index === this.length - 1) return this.removeLastElement();

    const elementToBeRemoved = this.getElementAtIndex(index);
    elementToBeRemoved.next.previous = elementToBeRemoved.previous;
    elementToBeRemoved.previous.next = elementToBeRemoved.next;

    this.length--;
    return elementToBeRemoved;
  }

  removeElement(value) {
    let index = this.getIndexOfElement(value);

    if (index !== -1) return this.removeElementAtIndex(index);
    else return null;
  }

  convertToCircularDoublyLinkedList() {
    if (this.head === null || this.tail === null) return null;

    this.head.previous = this.tail;
    this.tail.next = this.head;
    this.isCircular = true;
  }

  revertBackToDoublyLinkedList() {
    if (this.head === null || this.tail === null) return null;

    this.head.previous = null;
    this.tail.next = null;
    this.isCircular = false;
  }
}

module.exports = DoublyLinkedList;
