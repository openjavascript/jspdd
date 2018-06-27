export default class Library {
  constructor(props = {}) {
    this.id = props.id;
  }

  foo() {
    return `foo ${this.id}`;
  }
}
