import CardDeck from './CardDeck';
import getCombinations from './Combinations';
import Outcome from './OutCome.ts';

export type Comparator = (params: {
  rank?: string;
  ranks?: string[];
  highRank?: string;
  lowRank?: string;
}) => string;


interface Card {
  suit: string;
  rank: string;
}

interface RanksFrequency {
  get(rank: string): number | undefined;
  set(rank: string, freq: number): void;

  [Symbol.iterator](): IterableIterator<[string, number]>;
}

interface PokerHandOutcome {
  type: keyof typeof OUTCOMES;
  params: string;
  comparableString: Comparator;
}

interface Stringifies {
  [key: string]: (this: PokerHandOutcome) => string;
}

export const OUTCOMES = {
  HIGH_CARD: { id: 'High card', weight: '0' },
  PAIR: { id: 'A Pair', weight: '1' },
  TWO_PAIRS: { id: 'Two Pairs', weight: '2' },
  THREE_OF_A_KIND: { id: 'Three of a Kind', weight: '3' },
  STRAIGHT: { id: 'Straight', weight: '4' },
  FLUSH: { id: 'Flush', weight: '5' },
  FULL_HOUSE: { id: 'Full House', weight: '6' },
  FOUR_OF_A_KIND: { id: 'Four of a Kind', weight: '7' },
  STRAIGHT_FLUSH: { id: 'Straight Flush', weight: '8' },
  ROYAL_FLUSH: { id: 'Royal Flush', weight: '9' }
};

export const comparators: { [key in keyof typeof OUTCOMES]: Comparator } = {
  HIGH_CARD: (params) => {
    if (params.rank !== undefined) {
      return getRankWeight(params.rank).toString(16);
    }
    return '';
  },
  PAIR: (params) => {
    if (params.rank !== undefined){
      getRankWeight(params.rank).toString(16);
    }
    return '';
  },
  TWO_PAIRS: (params) => {
    if (params.ranks !== undefined) {
      return (
        getRankWeight(params.ranks[0]).toString(16) + getRankWeight(params.ranks[1]).toString(16)
      );
    }
    return '';
  },
  THREE_OF_A_KIND: (params) => {
    if (params.rank !== undefined){
      getRankWeight(params.rank).toString(16);
    }
    return '';
  },
  STRAIGHT: (params) => {
    if (params.rank !== undefined){
      getRankWeight(params.rank).toString(16);
    }
    return '';
  },
  FLUSH: () => '',
  FULL_HOUSE: (params) => {
    if (params.highRank !== undefined && params.lowRank !== undefined) {
      return (
        getRankWeight(params.highRank).toString(16) + getRankWeight(params.lowRank).toString(16)
      );
    }
    return '';
  },
  FOUR_OF_A_KIND: (params) => {
    if (params.rank !== undefined){
      getRankWeight(params.rank).toString(16);
    }
    return '';
  },
  STRAIGHT_FLUSH: (params) => {
    if (params.rank !== undefined){
      getRankWeight(params.rank).toString(16);
    }
    return '';
  },
  ROYAL_FLUSH: () => ''
};



export const stringifies: Stringifies = {
  [OUTCOMES.HIGH_CARD.id]: function () {
    return OUTCOMES.HIGH_CARD.id + ` (${this.params})`;
  },
  [OUTCOMES.PAIR.id]: function () {
    return OUTCOMES.PAIR.id + ` (${this.params})`;
  },
  [OUTCOMES.TWO_PAIRS.id]: function () {
    return OUTCOMES.TWO_PAIRS.id + ` (${this.params})`;
  },
  [OUTCOMES.THREE_OF_A_KIND.id]: function () {
    return OUTCOMES.THREE_OF_A_KIND.id + ` (${this.params})`;
  },
  [OUTCOMES.STRAIGHT.id]: function () {
    return OUTCOMES.STRAIGHT.id + ` (${this.params} high`;
  },
  [OUTCOMES.FLUSH.id]: function () {
    return OUTCOMES.FLUSH.id + ` (${this.params})`;
  },
  [OUTCOMES.FULL_HOUSE.id]: function () {
    return OUTCOMES.FULL_HOUSE.id + ` (${this.params})`;
  },
  [OUTCOMES.FOUR_OF_A_KIND.id]: function () {
    return OUTCOMES.FOUR_OF_A_KIND.id + ` (${this.params})`;
  },
  [OUTCOMES.STRAIGHT_FLUSH.id]: function () {
    return OUTCOMES.STRAIGHT_FLUSH.id + ` (${this.params})`;
  }
};



export const CARD_RANK_WEIGHTS: string[] = [
  CardDeck.RANKS.TWO,
  CardDeck.RANKS.THREE,
  CardDeck.RANKS.FOUR,
  CardDeck.RANKS.FIVE,
  CardDeck.RANKS.SIX,
  CardDeck.RANKS.SEVEN,
  CardDeck.RANKS.EIGHT,
  CardDeck.RANKS.NINE,
  CardDeck.RANKS.TEN,
  CardDeck.RANKS.JACK,
  CardDeck.RANKS.QUEEN,
  CardDeck.RANKS.KING,
  CardDeck.RANKS.ACE,
];

const last = <T>(arr: T[]): T | undefined => {
  return arr[arr.length - 1];
};

export const getRankWeight = (rank: string): number => {
  return CARD_RANK_WEIGHTS.indexOf(rank);
};

class PokerHand {
  cards: Card[];
  sortedCards: Card[];
  ranksFreq: RanksFrequency;
  threes: string[];
  pairs: string[];
  four: string | null;
  outcomes: PokerHandOutcome[];

  constructor(cards: Card[]) {
    this.cards = [...cards];

    this.sortedCards = this.cards.slice().sort((card1, card2) => {
      return getRankWeight(card1.rank) - getRankWeight(card2.rank);
    });

    this.ranksFreq = this.sortedCards.reduce<RanksFrequency>((freq, card) => {
      const rankFreq = freq.get(card.rank) || 0;
      freq.set(card.rank, rankFreq + 1);
      return freq;
    }, new Map<string, number>());

    this.threes = [];
    this.pairs = [];
    this.four = null;

    for (const [rank, freq] of this.ranksFreq) {
      if (freq === 4) this.four = rank;
      if (freq === 3) this.threes.push(rank);
      if (freq === 2) this.pairs.push(rank);
    }

    this.outcomes = [];
  }

  _addOutcome(outcome: PokerHandOutcome) {
    this.outcomes.push(outcome);
  }

  _determinePossibleOutcomes() {
    const combinations = getCombinations(this.sortedCards, 5);

    for (const combo of combinations) {
      const isStraight = this.isStraight(combo);
      const isFlush = this.isFlushSet(combo);

      const lastCard = last(combo);
      if (isStraight && isFlush) {
        if (lastCard && lastCard.rank === CardDeck.RANKS.ACE) {
          this._addOutcome(new Outcome('ROYAL_FLUSH', ''));
        } else {
          this._addOutcome(new Outcome('STRAIGHT_FLUSH', `rank: ${lastCard?.rank}, suit: ${lastCard?.suit}`));
        }
      } else if (isStraight) {
        this._addOutcome(new Outcome('STRAIGHT', `rank: ${lastCard?.rank}`));
      } else if (isFlush) {
        this._addOutcome(new Outcome('FLUSH', `suit: ${lastCard?.suit}`));
      }
    }

    if (this.four) {
      this._addOutcome(new Outcome('FOUR_OF_A_KIND', `rank: ${this.four}`));
    } else if (this.threes.length >= 1) {
      const highRank = last(this.threes);

      if (this.threes.length >= 2 || this.pairs.length >= 1) {
        const remainingThrees = [...this.threes];
        remainingThrees.pop();
        const remainingRanks = remainingThrees.concat(this.pairs);
        remainingRanks.sort((rank1, rank2) => {
          return getRankWeight(rank1) - getRankWeight(rank2);
        });

        const lowRank = last(remainingRanks);
        this._addOutcome(new Outcome('FULL_HOUSE', `highRank: ${highRank}, lowRank: ${lowRank}`));
      } else {
        this._addOutcome(new Outcome('THREE_OF_A_KIND', `rank: ${highRank}`));
      }
    } else if (this.pairs.length >= 2) {
      this._addOutcome(new Outcome('TWO_PAIRS', `ranks: ${this.pairs.slice(-2).join(', ')}`));
    } else if (this.pairs.length === 1) {
      this._addOutcome(new Outcome('PAIR', `rank: ${this.pairs[0]}`));
    } else {
      this._addOutcome(new Outcome('HIGH_CARD', `rank: ${last(this.sortedCards)?.rank}`));
    }
  }


  isFlushSet(cards: Card[]) {
    return cards.every((card) => card.suit === cards[0].suit);
  }

  isStraight(cards: Card[]) {
    let sequenceLength = 1;
    let isStraight = cards.every((currCard, index) => {
      if (index === 0) return true;
      const prevCard = cards[index - 1];
      const currRank = currCard?.rank;
      const prevRank = prevCard?.rank;

      if (currRank && prevRank) {
        const weightDiff = getRankWeight(currRank) - getRankWeight(prevRank);
        if (weightDiff === 1) {
          sequenceLength++;
          return true;
        }
      }

      return false;
    });

    if (sequenceLength === 4 &&
      cards[3]?.rank === CardDeck.RANKS.FIVE &&
      cards[4]?.rank === CardDeck.RANKS.ACE
    ) {
      const card = cards.pop();
      if (card) {
        cards.unshift(card);
        isStraight = true;
      }
    }

    return isStraight;
  }

  getOutcome() {
    this._determinePossibleOutcomes();

    this.outcomes.sort((a, b) => {
      const aValue = a.valueOf();
      const bValue = b.valueOf();
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

    return last(this.outcomes);
  }
}

export default PokerHand;
