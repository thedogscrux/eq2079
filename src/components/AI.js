import React, { Component } from 'react'
import { connect } from 'react-redux'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { setUserAIStrength } from '../actions/userActions'

import game from '../Settings.js'
import { propsPzs } from '../data/propsPzs.js'

const mapStateToProps = (state, props) => {
  return {
    userId: state.user.id,
    userPzs: state.user.pzs
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    updateAIStrength: (strength) => {
      dispatch(setUserAIStrength(strength))
    }
  }
}

class AI extends Component {
  constructor(props) {
    super(props)
    this.state = {
      aiStrength: 0
    }
  }

  componentWillMount() {
    let aiStrength = this.calcAIStrength()
    if (aiStrength != this.state.aiStrength) {
      this.setState({ aiStrength: aiStrength })
      this.props.updateAIStrength(aiStrength)
      firebase.database().ref('/users/' + this.props.userId + '/ai').update({ strength: aiStrength })
    }
  }

  calcAIStrength() {
    // total game score = total num of rounds * score per round
    let totalRounds = propsPzs.map(pz => pz.rounds.numOfRounds).reduce((total, rounds) => total + rounds)
    let totalGameScore = totalRounds * game.score.round

    // get total scores
    let pzScores = this.props.userPzs.map(pz => pz.score)
    let myTotalScore = pzScores.reduce((total, score) => total + score)
    let percentOfTotal = Math.round((myTotalScore / totalGameScore) * 100)
    console.log('AI: myTotalScore/totalGameScore/percentOfTotal',myTotalScore,'/',totalGameScore,'/',percentOfTotal);
    let aiStrength = 0

    if(percentOfTotal > game.ai.triggerStrength1AtPercentComplete) {
      aiStrength = 1
    } else if (percentOfTotal > game.ai.triggerStrength2AtPercentComplete) {
      aiStrength = 2
    } else if (percentOfTotal > game.ai.triggerStrength3AtPercentComplete) {
      aiStrength = 3
    }

    return aiStrength
  }

  render(){
    let classesFullScreen = ''
    let aiStrength = this.calcAIStrength()

    // set the css classses based on AI strength
    if(aiStrength === 1) {
      classesFullScreen = 'ai-strength-1'
      document.body.className += ' ' + 'ai-strength-1';

    } else if (aiStrength === 2) {
      classesFullScreen = 'ai-strength-2'
      document.body.className += ' ' + 'ai-strength-2';

    } else if (aiStrength === 3) {
      classesFullScreen = 'ai-strength-3'
      document.body.className += ' ' + 'ai-strength-3';
    }

    return(
      <div id='component-ai'>
        <div id='full-screen' className={classesFullScreen}></div>
      </div>
    )
  }
}

const AIContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AI)

export default AIContainer
