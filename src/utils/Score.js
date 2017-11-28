import React, { Component } from 'react'

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

  // CALCS

  calcMaxScore(numUserHints = 0, numOfUsers = 1) {
    // total score - hints
    let totalScore = 0
    let totalBaseScore = 0
    let totalRoundScore = this.numOfRounds * ROUND_SCORE
    let userHintsCost = numUserHints * HINT_COST
    // totalBaseScore = totalRoundScore - Math.round((totalRoundScore * userHintsCost))
    totalBaseScore = totalRoundScore - userHintsCost

    if(numOfUsers > 1) {
      console.log('XXX adding multi to score for X players:',numOfUsers);
      totalScore = totalBaseScore + (totalBaseScore * MULTI)
    } else {
      totalScore = totalBaseScore
    }
    return Math.round(totalScore)
  }

  calcHintCost() {
    return (this.numOfRounds*ROUND_SCORE) * HINT_COST
  }

  // BUILD HTML

  htmlAdmin(score) {
    return (
      <div>
        <h2>Score:<br/>{score.round} / {score.total} / {score.max}</h2>
        round / total / max<br/>
        hint cost: {score.hintCost}<br/>
      </div>
    )
  }

  htmlSimpleDisplay(score, debug = false) {
    let htmlAdmin = ''
    htmlAdmin = (debug) ? this.htmlAdmin(score) : ''
    return(
      <div id='component-score'>
        {htmlAdmin}
        Score: {score.round}/{score.total}/{score.max} [round/total/max]
      </div>
    )
  }

}

export default Score
