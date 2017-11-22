import React, { Component } from 'react'
import { connect } from 'react-redux'

import game from '../Settings.js'
import { propsPzs } from '../data/propsPzs.js'

const mapStateToProps = (state, props) => {
  return {
    pzs: state.user.pzs
  }
}

class AI extends Component {

  calcTotalScore() {
    // total score = total num of rounds * score per round
    let totalRounds = propsPzs.map(pz => pz.rounds.numOfRounds).reduce((total, rounds) => total + rounds)
    return totalRounds * game.score.round
  }

  render(){
    // get total scores
    let pzScores = this.props.pzs.map(pz => pz.score)
    let myTotalScore = pzScores.reduce((total, score) => total + score)
    let totalGameScore = this.calcTotalScore()
    let percentOfTotal = Math.round((myTotalScore / totalGameScore) * 100)

    let classesFullScreen = ''

    // set the css classses based on AI strength
    if(percentOfTotal > 20) {
      classesFullScreen = 'ai-strength-1'
      document.body.className += ' ' + 'ai-strength-1';
    } else if (percentOfTotal > 70) {
      classesFullScreen = 'ai-strength-2'
      document.body.className += ' ' + 'ai-strength-2';
    } else if (percentOfTotal > 85) {
      classesFullScreen = 'ai-strength-3'
      document.body.className += ' ' + 'ai-strength-3';
    }

    return(
      <div id='ai-component-wrapper'>
        {/*A.I.<br/>
        my score: {myTotalScore}<br/>
        total score: {totalGameScore}<br/>
        percent of total: {percentOfTotal}%<br/>
        AI Threat:*/}

        <div id='full-screen' className={classesFullScreen}></div>
      </div>
    )
  }
}


const AIContainer = connect(
  mapStateToProps
)(AI)

export default AIContainer
