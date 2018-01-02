import React, { Component } from 'react'

import { propsPzs } from '../data/propsPzs.js'
import game from '../Settings.js'

const FLAT_PZ_SCORE = game.score.pz
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

    // method 1: for calculating total score (round score x num of rounds)
    //let totalRoundScore = this.numOfRounds * ROUND_SCORE

    // method 2: flat score for all pz's
    let totalRoundScore = FLAT_PZ_SCORE

    let userHintsCost = numUserHints * HINT_COST
    // totalBaseScore = totalRoundScore - Math.round((totalRoundScore * userHintsCost))
    totalBaseScore = totalRoundScore - userHintsCost

    if(numOfUsers > 1) {
      console.log('XXX adding multi to score for X players:',numOfUsers);
      totalScore = totalBaseScore + (totalBaseScore * MULTI)
    } else {
      totalScore = totalBaseScore
    }

    // never let the max drop below zero
    //totalScore = (totalScore <= 0) ? 1 : totalScore

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
        {/*Score: {score.round}/{score.total}/{score.max} [round/total/max]*/}
        Score: {score.round}
      </div>
    )
  }

}

export default Score
