//hintCost: 0.25,

const game = {
  active: true,
  score: {
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
    triggerStrength1AtPercentComplete: 40,
    triggerStrength2AtPercentComplete: 55,
    triggerStrength3AtPercentComplete: 70
  }
}

export default game
