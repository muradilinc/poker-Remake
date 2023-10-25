import React, {Component} from 'react';

// interface Card {
//
// }

interface AppState {
  cards: [];
  outcome: string | null;
  selectedCard: [];
  deck: any; // Определите тип данных для свойства deck
  stage: string;
  credits: number;
  currentBit: number;
  currentWin: number;
}

class App extends Component {
  state = {
    cards: [],
    outcome: null,
    selectedCard: [],
    deck: null,
    stage: 'start',
    credits: 100,
    currentBit: 0,
    currentWin: 0
  };

  render() {
    return (
      <div>
        
      </div>
    );
  }
}

export default App;