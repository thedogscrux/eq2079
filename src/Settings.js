const game = {
  active: true,
  score: {
    launch: 200,
    hintCost: 0.25,
    mutliplayerMultiplier: 0.5,
    round: 15,
    item: 3,
    participation: 1
  },
  hints: {
    allowAfterPzAttempts: 3
  },
  clock: {
    pzLoadingSec: 2
  },
  ai: {
    triggerStrength1AtPercentComplete: 10,
    triggerStrength2AtPercentComplete: 50,
    triggerStrength3AtPercentComplete: 70
  }
}

export default game
