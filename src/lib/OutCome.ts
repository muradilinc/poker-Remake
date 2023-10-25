import {Comparator, comparators, OUTCOMES, stringifies} from './PokerHand.ts';

class Outcome {
  type: keyof typeof OUTCOMES;
  params: string;
  comparableString: Comparator;

  constructor(type: keyof typeof OUTCOMES, params: string) {
    this.type = type;
    this.params = params;
    this.comparableString = comparators[this.type].bind(this);
  }

  valueOf() {
    return this._createComparableValue();
  }

  toString() {
    return this._createComparableValue();
  }

  getTxt() {
    return stringifies[OUTCOMES[this.type].id].call(this);
  }

  _createComparableValue() {
    return OUTCOMES[this.type].weight + this.comparableString({ rank: this.params });
  }
}

export default Outcome;