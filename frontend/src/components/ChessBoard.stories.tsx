import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChessBoard } from './ChessBoard';

const meta = {
  title: 'Components/ChessBoard',
  component: ChessBoard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChessBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StartingPosition: Story = {
  args: {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    currentTurn: 'white',
    moves: [],
    capturedPieces: { white: [], black: [] },
    legalMoves: ['a3', 'a4', 'b3', 'b4', 'c3', 'c4', 'd3', 'd4', 'e3', 'e4', 'f3', 'f4', 'g3', 'g4', 'h3', 'h4', 'Na3', 'Nf3'],
  },
};

export const MidGame: Story = {
  args: {
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    currentTurn: 'white',
    moves: [
      { from: 'e2', to: 'e4', piece: 'P' },
      { from: 'e7', to: 'e5', piece: 'p' },
      { from: 'g1', to: 'f3', piece: 'N' },
      { from: 'b8', to: 'c6', piece: 'n' },
      { from: 'f1', to: 'c4', piece: 'B' },
      { from: 'g8', to: 'f6', piece: 'n' },
    ],
    capturedPieces: { white: [], black: [] },
    legalMoves: ['Qe2', 'Qf3', 'Nxe5'],
  },
};

export const WithCaptures: Story = {
  args: {
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 4',
    currentTurn: 'black',
    moves: [
      { from: 'e2', to: 'e4', piece: 'P' },
      { from: 'e7', to: 'e5', piece: 'p' },
      { from: 'g1', to: 'f3', piece: 'N' },
      { from: 'b8', to: 'c6', piece: 'n' },
      { from: 'f1', to: 'c4', piece: 'B' },
    ],
    capturedPieces: { white: ['p', 'n'], black: ['P', 'N'] },
    legalMoves: ['Bc5', 'Be6', 'd6', 'f6', 'Nxe4'],
  },
};

export const EndGame: Story = {
  args: {
    fen: '6k1/5pp1/8/8/8/8/5PPK w - - 0 1',
    currentTurn: 'white',
    moves: [
      { from: 'e4', to: 'e5', piece: 'P' },
      { from: 'e7', to: 'e6', piece: 'p' },
    ],
    capturedPieces: { white: ['n', 'b', 'r', 'q'], black: ['N', 'B', 'R', 'Q'] },
    legalMoves: ['Kh1', 'Kg2', 'Kg1', 'f3', 'f4', 'h3', 'h4'],
  },
};

export const Interactive: Story = {
  args: {
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    currentTurn: 'white',
    moves: [
      { from: 'e2', to: 'e4', piece: 'P' },
      { from: 'e7', to: 'e5', piece: 'p' },
    ],
    capturedPieces: { white: [], black: [] },
    legalMoves: ['a3', 'a4', 'Nf3', 'Nc3'],
  },
  render: () => {
    const [selected, setSelected] = React.useState<string | null>(null);

    return (
      <ChessBoard
        fen='rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2'
        selectedSquare={selected}
        onSquareClick={(sq) => {
          setSelected(sq);
          console.log(`Clicked: ${sq}`);
        }}
        legalMoves={['a3', 'a4', 'Nf3', 'Nc3']}
        moves={[
          { from: 'e2', to: 'e4', piece: 'P' },
          { from: 'e7', to: 'e5', piece: 'p' },
        ]}
        capturedPieces={{ white: [], black: [] }}
        currentTurn='white'
      />
    );
  },
};
