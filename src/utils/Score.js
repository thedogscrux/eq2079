import { propsPzs } from '../data/propsPzs.js'
import game from '../Settings.js'

const ROUND_SCORE = game.score.round
const HINT_COST = game.score.hintCost

class Score {

  constructor(pzIndex) {
    this.pzProps = propsPzs[pzIndex]
    this.numOfRounds = this.pzProps.rounds.numOfRounds
  }

  calcMaxScore(numUserHints = 0, numOfUsers = 0) {
    // total score - hints
    return this.numOfRounds*ROUND_SCORE - ((this.numOfRounds*ROUND_SCORE) * (numUserHints*HINT_COST))
  }

  calcHintCost() {
    return (this.numOfRounds*ROUND_SCORE) * HINT_COST
  }

}

export default Score
