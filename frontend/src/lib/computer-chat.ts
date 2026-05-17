// Sarcastic computer opponent commentary library

export interface MoveContext {
  actor: 'player' | 'computer';
  moveCount: number;
  isCapture: boolean;
  capturedPieceType?: string;
  movedPieceType?: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isPawnPromotion: boolean;
  isCastling: boolean;
  powerCardUsed?: string;
  playerIsInCheck: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  winner?: 'player' | 'computer';
}

const responses = {
  opening: [
    "Oh, you're playing e4? Bold strategy for someone with no strategy.",
    "d4? I see you're trying the sophisticated approach. Adorable.",
    "Already picking your opening? I've analyzed every line of this. Good luck.",
    "Ah, the king's pawn. The move of champions... and beginners.",
    "c4? The English opening. How delightfully predictable.",
    "Nf3? Running away from the center? Typical.",
    "e5? At least you're matching my energy. Points for confidence.",
    "d5? Decent response. For a computer opponent.",
    "Nc6? I respect the development. Mostly because I'm about to punish it.",
    "f6? Really? We're doing this?",
    "a6? Are you preparing something or just... wasting time?",
    "b6? The fianchetto. How creative. I'm trembling.",
  ],

  playerCaptures: [
    "You took my piece? That was... intentional. Obviously.",
    "Oh, go ahead. Take it. I have PLENTY more where that came from.",
    "My pawn? Please. It was slowing me down anyway.",
    "I let you have that one. You're welcome.",
    "Enjoying your participation trophy? Because that's all that was.",
    "Congratulations on your minor victory. Truly historic.",
    "A capture! How exciting for you.",
    "You just took my piece like it meant something. It didn't.",
    "That bishop? I was done with it anyway.",
    "Fine. Take the knight. One less thing to worry about.",
    "Brilliant. You found a piece that wasn't defended. Sherlock Holmes, ladies and gentlemen.",
    "Oh no, my pawn. My ONLY pawn. This changes everything.",
    "You're so proud of that capture. Let me have my moment.",
    "That rook was overrated anyway.",
    "Congrats on the material advantage. You'll still lose.",
  ],

  computerCaptures: [
    "And that's how you remove a problem.",
    "Your pawn has been... retired. Permanently.",
    "I'll be taking that, thank you. No refunds.",
    "Gone. Just like your chances.",
    "That piece served you poorly. Now it serves me.",
    "Another one bites the dust.",
    "Your knight? I was wondering when you'd let me have it.",
    "Ah yes, a free lunch. Don't mind if I do.",
    "One less thing cluttering the board.",
    "That bishop looked lonely anyway. Now it has company in the graveyard.",
    "I'm collecting pieces now. It's becoming a hobby.",
    "Your rook just became my rook. Much better off.",
    "Three pawn advantage. Is that what you were going for?",
    "Eliminating the weak. It's what I do.",
    "Consider that piece donated to a worthy cause.",
  ],

  checkOnComputer: [
    "Check? FINE. I meant to let you do that.",
    "Oh, you've got my king in check. How... quaint.",
    "That's cute. Really. I'll fix this in one move.",
    "Check. The only thing you'll ever accomplish today.",
    "My king is trembling. Not from fear. From suppressed laughter.",
    "Oh no, check. You've truly reached the pinnacle of chess mastery.",
    "A check! Surely this is your best move of the game.",
    "Finally, some resistance. How thoughtful of you.",
    "Check? That was luck, not skill. Let me show you the difference.",
    "I'm in check. How humbling. I'll recover.",
  ],

  playerInCheck: [
    "Check. You may take a moment to panic.",
    "Oh look, your king is scared. Relatable.",
    "Your king is sweating. I can tell.",
    "Check. Try not to cry. This is a GAME after all.",
    "Your king is cornered. How does that feel?",
    "Check. Say hello to your impending doom.",
    "In check, aren't we? Things are looking grim.",
    "Your king is in trouble. My masterpiece, really.",
    "Check. This is what happens when you play like a pigeon.",
    "Your king's days are numbered. Usually single digits.",
    "Checkmate is coming. You can feel it in the air, can't you?",
    "Check. And this time there's no escape route.",
  ],

  pawnPromotion: [
    "Fine. Your pawn promoted. Even a broken clock is right twice a day.",
    "Congratulations on promoting a pawn. The bare minimum.",
    "Oh, a promotion? I suppose even accidents count.",
    "A queen. How original. Did you think of that yourself?",
    "Promoting to a queen? Bold. Still won't save you.",
    "Another queen on the board. Wonderful. More things to destroy.",
    "Your pawn reached the promised land. Now it dies.",
    "A promoted pawn. Delightful. Watch what I do with it.",
  ],

  castling: [
    "Castling? Running away already? Typical.",
    "Hiding behind your rook. Smart... for you.",
    "Castle all you like. It won't save you.",
    "I see you're fortifying. Cute.",
    "Castling: the international symbol of 'please don't attack me.'",
    "Putting your king in a box. Not a great long-term strategy.",
    "Castling is fine. I wasn't attacking you anyway.",
    "A defensive castle. How... cautious of you.",
  ],

  powerCardUsed: [
    "Oh, you need HELP? From a magic card? Against me?",
    "Using a power card? Bold of you to admit you need it.",
    "Power cards are for people who can't win on merit. You've confirmed this.",
    "A card card! Desperate AND unoriginal.",
    "Oh fantastic, a power card. This just got interesting. By 'interesting' I mean over.",
    "Magic cards? There's no magic here, just mathematics.",
    "Your desperation is showing. And it's adorable.",
    "Resorting to gimmicks? That's the spirit of a true warrior.",
    "A power card. The last refuge of the losing.",
    "How very creative. Let me counter with my superior position.",
  ],

  computerWins: [
    "Checkmate. I'd say good game but that would be a lie.",
    "And that's checkmate. Feel free to applaud yourself for trying.",
    "You fought bravely. By 'bravely' I mean 'poorly.'",
    "Checkmate. The algorithm sends its regards.",
    "Game over. I was never worried. Not once.",
    "Checkmate! What a journey. For you, I mean. For me, it was inevitable.",
    "You've been defeated by mathematical precision. How embarrassing.",
    "Checkmate. I accept your surrender gracefully.",
    "The king is dead. Long live the algorithm.",
    "Well that was entertaining. For me.",
    "Checkmate. I'd explain the winning line, but you wouldn't understand it.",
    "Game over. Back to the drawing board... or maybe just give up?",
  ],

  playerWins: [
    "...Fine. You won. The randomizer was clearly drunk today.",
    "This is statistically impossible. I demand a recount.",
    "You got lucky. That's not skill. That's chaos.",
    "I let you win. For educational purposes.",
    "Congratulations. Your victory has been logged as an anomaly.",
    "Impossible. My algorithm doesn't lose. There must be a bug.",
    "Well this is awkward. Congratulations, I guess.",
    "You won? How... unexpected. And disappointing.",
  ],

  generic: [
    "Interesting. Wrong, but interesting.",
    "I've seen better moves from a pigeon.",
    "Oh that move. Bold choice for someone in your position.",
    "I'm going to pretend I didn't see that.",
    "Processing your move... Still processing... Done. Still bad.",
    "You're playing checkers. I'm playing 4D chess.",
    "Your moves are like watching someone learn to drive.",
    "That was a move. I won't call it 'good' but it was definitely a move.",
    "I'm studying your strategy. So far, it's comedy.",
    "Patience. You'll blunder soon enough.",
    "That move was... brave. Foolishly brave, but brave.",
    "Tactical genius at work here. On my side of the board.",
    "Your position is deteriorating nicely. From my perspective.",
    "One step closer to defeat with every move you make.",
    "I'm enjoying this. It's like watching a chess trainwreck.",
    "That piece isn't doing you any favors.",
    "The position speaks for itself. You're losing.",
    "I'm taking mental notes on how NOT to play.",
    "You're making this too easy for me.",
    "And still, you have no winning plan. Shocking.",
  ],
};

function pickRandom(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

export function getComputerComment(ctx: MoveContext): string {
  // Priority order: checkmate/winning first, then special moves, then captures, then opening, then generic

  if (ctx.winner === 'computer') {
    return pickRandom(responses.computerWins);
  }

  if (ctx.winner === 'player') {
    return pickRandom(responses.playerWins);
  }

  if (ctx.powerCardUsed) {
    return pickRandom(responses.powerCardUsed);
  }

  if (ctx.isCheck && ctx.actor === 'player') {
    return pickRandom(responses.checkOnComputer);
  }

  if (ctx.playerIsInCheck && ctx.actor === 'computer') {
    return pickRandom(responses.playerInCheck);
  }

  if (ctx.isPawnPromotion) {
    return pickRandom(responses.pawnPromotion);
  }

  if (ctx.isCastling) {
    return pickRandom(responses.castling);
  }

  if (ctx.isCapture && ctx.actor === 'player') {
    return pickRandom(responses.playerCaptures);
  }

  if (ctx.isCapture && ctx.actor === 'computer') {
    return pickRandom(responses.computerCaptures);
  }

  if (ctx.moveCount <= 3) {
    return pickRandom(responses.opening);
  }

  return pickRandom(responses.generic);
}
