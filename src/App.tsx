import {Component} from 'react';
import CardDeck, {Card} from './lib/CardDeck.ts';
import PokerHand, {CARD_RANK_WEIGHTS, OUTCOMES} from './lib/PokerHand.ts';
import OutCome from './lib/OutCome.ts';
import CardView from './components/Card/Card.tsx';

import './App.css';

interface OutComeView {
  id: string;
  weight: string;
}

interface AppState {
  cards: Card[];
  outcome: OutCome | null;
  selectedCards: number[];
  deck: CardDeck | null;
  stage: string;
  credits: number;
  currentBet: number;
  currentWin: number;
}

type Comparator = {
  rank?: string;
  ranks?: string[];
  highRank?: string;
  lowRank?: string;
};

interface WinTableItem {
  title?: string;
  outcome: OutComeView;
  winMultiplier: number;
  addCheck?(params: Comparator): boolean;
  addMult?(coins: number): number;
}

const winTable: WinTableItem[] = [
  {
    title: 'Jacks or better', outcome: OUTCOMES.PAIR, winMultiplier: 1, addCheck: (params) => {
      if (params.rank !== undefined) {
        return CARD_RANK_WEIGHTS.indexOf(params.rank) >= CARD_RANK_WEIGHTS.indexOf(CardDeck.RANKS.JACK);
      }
      return false;
    }
  },
  {outcome: OUTCOMES.TWO_PAIRS, winMultiplier: 2},
  {outcome: OUTCOMES.THREE_OF_A_KIND, winMultiplier: 3},
  {outcome: OUTCOMES.STRAIGHT, winMultiplier: 4},
  {outcome: OUTCOMES.FLUSH, winMultiplier: 6},
  {outcome: OUTCOMES.FULL_HOUSE, winMultiplier: 9},
  {outcome: OUTCOMES.FOUR_OF_A_KIND, winMultiplier: 25},
  {outcome: OUTCOMES.STRAIGHT_FLUSH, winMultiplier: 50},
  {outcome: OUTCOMES.ROYAL_FLUSH, winMultiplier: 250, addMult: (coins: number) => coins === 5 ? 4 : 1},
];

winTable.reverse();

const coinAmount = [1, 2, 3, 4, 5];

class App extends Component<[], AppState> {
  constructor(props: []) {
    super(props);
    this.state = {
      cards: [],
      outcome: null,
      selectedCards: [],
      deck: null,
      stage: 'start',
      credits: 100,
      currentBet: 0,
      currentWin: 0
    };
  }

  initGame = () => {
    const deck = new CardDeck();
    const cards = deck.getCards(5);
    const selectedCards = [0, 1, 2, 3, 4, 5];
    this.setState({cards, selectedCards});
  };

  componentDidMount() {
    this.initGame();
  }

  deal = () => {
    const deck = new CardDeck();
    const cards = deck.getCards(5);

    const calc = new PokerHand(cards);
    const outcome = calc.getOutcome();

    const selectedCards: number[] = [];

    this.setState({deck, cards, outcome, selectedCards, stage: 'dealt', currentWin: 0});
  };

  determineCurrentWin = (outcome: OutCome) => {
    const winItem = winTable.find(winItem => winItem.outcome.id === outcome.type.id);

    let currentWin = 0;

    if (winItem && (winItem.addCheck ? winItem.addCheck(outcome.params) : true)) {
      currentWin = this.state.currentBet
        * winItem.winMultiplier
        * (winItem.addMult ? winItem.addMult() : 1);
    }

    return currentWin;
  };

  draw = () => {
    this.setState(prevState  => {
      const cards = [...prevState.cards];
      for (const index of prevState.selectedCards) {
        cards[index] = prevState.deck.getCard();
      }

      const hand = new PokerHand(cards);
      const outcome = hand.getOutcome();

      const currentWin = this.determineCurrentWin(outcome);
      const credits = prevState.credits += currentWin;

      return {selectedCards: [], stage: 'end', cards, outcome, currentWin, credits};
    });
  };

  dealOrDraw = () => {
    this.state.stage === 'dealt' ? this.draw() : this.deal();
  };

  cardSelected = index => {
    if (this.state.stage === 'dealt') {
      this.setState(prevState => {
        console.log(index);
        const selectedCards = [...prevState.selectedCards];
        const isSelected = selectedCards.indexOf(index);
        if (isSelected === -1) {
          selectedCards.push(index);
        } else {
          selectedCards.splice(isSelected, 1);
        }

        return {selectedCards};
      });
    }
  };

  isSelected = (index: number) => {
    return this.state.selectedCards.indexOf(index) !== -1;
  };

  isCurrentWinItem = (winItem: WinTableItem) => {
    if (this.state.outcome && winItem.outcome.id === this.state.outcome.type.id) {
      if (winItem.addCheck) {
        return winItem.addCheck(this.state.outcome.params);
      }
      return true;
    }
    return false;
  };

  bet = (amount: number) => {
    this.setState(prevState => {

      let currentBet = prevState.currentBet;

      if (prevState.stage === 'end') {
        currentBet = 0;
      }

      let credits = prevState.credits;

      if (currentBet + amount > 5) {
        amount = 5 - currentBet;
      }

      currentBet += amount;
      credits -= amount;

      return {currentBet, credits, stage: 'start'};
    });
  };

  maxBet = () => {
    this.bet(5);
    this.deal();
  };

  isDrawDisabled = () => {
    return (this.state.stage === 'start' && this.state.currentBet === 0) ||
      this.state.stage === 'end';
  };

  isBetDisabled = () => {
    return (this.state.stage === 'start' && this.state.currentBet === 5) ||
      this.state.stage === 'dealt';
  };

  render() {
    return (
      <div className="App playingCards faceImages cards">
        <div>
          <table className="WinTable">
            <tbody>
            {
              winTable.map((winItem) => (
                <tr key={winItem.outcome.id} className={this.isCurrentWinItem(winItem) ? 'CurrentWin' : ''}>
                  <td>{winItem.title ? winItem.title : winItem.outcome.id}</td>
                  {coinAmount.map(coins => (
                    <td key={coins} className={this.state.currentBet === coins ? 'SelectedBet' : ''}>
                      {coins * winItem.winMultiplier * (winItem.addMult ? winItem.addMult(coins) : 1)}
                    </td>
                  ))}
                </tr>
              ))
            }
            </tbody>
          </table>
        </div>
        <div className="StatusBar">
          <div className="Bet">{this.state.currentBet ? 'Bet: ' + this.state.currentBet : ''}</div>
          <div className="Win">{this.state.stage === 'end' ? 'Win: ' + this.state.currentWin : ''}</div>
          <div className="Credits">Credits: {this.state.credits}</div>
        </div>
        <div className="CurrentOutcome">
          {this.state.outcome ? this.state.outcome.getTxt() : <span>&nbsp;</span>}
        </div>
        <div>
          {
            this.state.cards.map((card, index) => {
              return <CardView
                key={index}
                suit={card.suit}
                rank={card.rank}
                back={this.isSelected(index) || this.state.stage === 'start'}
                clicked={() => this.cardSelected(index)}
              />;
            })
          }
        </div>

        <div className="Buttons">
          <button onClick={() => this.bet(1)} disabled={this.isBetDisabled()}>Bet one</button>
          <button onClick={this.maxBet} disabled={this.isBetDisabled()}>Max bet</button>
          <button onClick={this.dealOrDraw} disabled={this.isDrawDisabled()}>Deal Draw</button>
        </div>
      </div>
    );
  }
}

export default App;