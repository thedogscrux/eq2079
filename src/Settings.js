//hintCost: 0.25,

const game = {
  active: true,
  score: {
    flat: true,
    launch: 100,
    hintCost: 0.99,
    mutliplayerMultiplier: 0.5,
    pz: 5,
    round: 1,
    item: 1,
    participation: 1
  },
  hints: {
    allowAfterPzAttempts: 1
  },
  story: {
    chapterRanks: false
  },
  clock: {
    pzLoadingSec: 7
  },
  ai: {
    triggerStrength1AtPercentComplete: 60,
    triggerStrength2AtPercentComplete: 75,
    triggerStrength3AtPercentComplete: 90
  }
}

export default game
