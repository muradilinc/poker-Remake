import React from 'react';
import './Card.css';

interface Props {
  suit: string;
}

type Suit = {
  H: {className: string, symbol: string};
  C: {className: string, symbol: string};
  D: {className: string, symbol: string};
  S: {className: string, symbol: string};
};

const suits: Suit = {
  H: {className: 'Card-hearts', symbol: '♥'},
  C: {className: 'Card-clubs', symbol: '♣'},
  D: {className: 'Card-diams', symbol: '♦'},
  S: {className: 'Card-spades', symbol: '♠'}
};

const Card: React.FC<Props> = ({suit}) => {
  const suitClass = suits[suit].className;
  const symbol = suits[suit].symbol;

  const cardClasses = [
    'Card',
    'Card-rank-' + props.rank.toLowerCase(),
    suitClass,
  ];

  if (props.back) {
    cardClasses.push('Card-back');
  }

  return (
    <div className={cardClasses.join(' ')} onClick={props.clicked}>
      <span className="Card-rank">{props.rank.toUpperCase()}</span>
      <span className="Card-suit">{symbol}</span>
    </div>
  );
};

export default Card;