import { propsPzs } from '../data/propsPzs.js'
import game from '../Settings.js'

const ROUND_SCORE = game.score.round
const HINT_COST = game.score.hintCost
const MULTI = game.score.mutliplayerMultiplier

class Score {

  constructor(pzIndex) {
    this.pzProps = propsPzs[pzIndex]
    this.numOfRounds = this.pzProps.rounds.numOfRounds
  }

  calcMaxScore(numUserHints = 0, numOfUsers = 0) {
    // total score - hints
    let totalScore = 0
    let totalRoundScore = this.numOfRounds * ROUND_SCORE
    let userHintsCost = numUserHints * HINT_COST
    let totalBaseScore = totalRoundScore - (totalRoundScore * userHintsCost)
    if(numOfUsers > 1) {
      console.log('XXX adding multi to score for X players:',numOfUsers);
      totalScore = totalBaseScore + (totalBaseScore * MULTI)
    } else {
      totalScore = totalBaseScore
    }
    return totalScore
  }

  calcHintCost() {
    return (this.numOfRounds*ROUND_SCORE) * HINT_COST
  }

}

export default Score
