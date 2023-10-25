type CommonType = {[key: string]: string};
type card = {
  suit: string;
  rank: string;
};

class CardDeck {
  static SUITS: CommonType = {
    DIAMONDS: 'D',
    HEARTS: 'H',
    CLUBS: 'C',
    SPADES: 'S'
  };

  static RANKS: CommonType = {
    TWO: '2',
    THREE: '3',
    FOUR: '4',
    FIVE: '5',
    SIX: '6',
    SEVEN: '7',
    EIGHT: '8',
    NINE: '9',
    TEN: '10',
    JACK: 'J',
    QUEEN: 'Q',
    KING: 'K',
    ACE: 'A',
  };

  cards: card[] = [];

  constructor() {
    for (const suit in CardDeck.SUITS) {
      for (const rank in CardDeck.RANKS) {
        this.cards.push({
          suit: CardDeck.SUITS[suit],
          rank: CardDeck.RANKS[rank]
        });
      }
    }
  }

  getCard() {
    const randomCardIndex = Math.floor(Math.random() * this.cards.length);
    const [card] = this.cards.splice(randomCardIndex, 1);

    return card;
  }

  getCards(howMany: number) {
    const cards = [];

    for (let i = 0; i < howMany; i++) {
      cards.push(this.getCard());
    }

    return cards;
  }
}

export default CardDeck;