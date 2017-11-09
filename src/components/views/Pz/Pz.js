import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import moment from 'moment'
import tz from 'moment-timezone'

import { setUserPz } from '../../../actions/userActions'

import PzStart from './PzStart'
import PzScore from './PzScore'

import { propsPzs } from '../../../data/propsPzs.js'

import pz1 from '../../pzs/pz1/Pz1'
import pz2 from '../../pzs/pz2/Pz2'
import pz3 from '../../pzs/pz3/Pz3'
import pz4 from '../../pzs/pz4/Pz4'
import pz5 from '../../pzs/pz5/Pz5'

import clock0 from '../../../images/pz/clock/clock-0.svg'
import clock1 from '../../../images/pz/clock/clock-1.svg'
import clock2 from '../../../images/pz/clock/clock-2.svg'
import clock3 from '../../../images/pz/clock/clock-3.svg'
import clock4 from '../../../images/pz/clock/clock-4.svg'

const pzMap = {
  pz1,
  pz2,
  pz3,
  pz4,
  pz5
}

const clockMap = {
  clock0, clock1, clock2, clock3, clock4
}

const mapStateToProps = (state, props) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    setUserPz: (pz, val) => {
      dispatch(setUserPz(pz, val))
    }
  }
}

class Pz extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userID: this.props.user.id,
      pzCode: this.props.match.params.pzCode,
      pzIndex: propsPzs.findIndex(pz => pz.code === this.props.match.params.pzCode),
      round: 0,
      pz: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      let pzIndex = propsPzs.findIndex(pz => pz.code === nextProps.match.params.pzCode)
      this.setState({
        pzCode: nextProps.match.params.pzCode,
        pzIndex: pzIndex
      });
      if(pzIndex==0) pzIndex = '0' // workaround for firebase zero/null starting index
      this.watchDB(pzIndex)
    }
  }

  componentDidMount() {
    this.watchDB()
  }

  componentWillUnmount() {
    this.unwatchDB()
  }

  // WATCH

  unwatchDB() {
    firebase.database().ref('/pzs/' +  this.state.pzIndex).off()
  }

  watchDB(index) {
    let pzIndex = index
    if(!pzIndex) pzIndex = this.state.pzIndex
    var self = this
    firebase.database().ref('/pzs/' +  pzIndex).on('value', function(snapshot){
      self.updateStatePz(snapshot.val())
    })
  }

  updateStatePz(value) {
    this.setState({ pz: value })
  }

  // CHILD FUNCS

  endRound() {
    //set the round # and time of next round (if any)
    let newRoundNum = this.state.pz.round + 1
    if (newRoundNum <= propsPzs[this.state.pzIndex].rounds.numOfRounds) {
      console.log('*** END ROUND ***');
      // go to next round
      let timeNextRound = moment().tz('America/Los_Angeles')
      timeNextRound.add(propsPzs[this.state.pzIndex].rounds.roundSec, 's')
      let update = {
        round: newRoundNum,
        timeNextRound: timeNextRound.format("kk:mm:ss"),
        clock: 0
      }
      firebase.database().ref('/pzs/' + this.state.pzIndex).update(update)
    } else {
      console.log('*** END GAME ***');
      // end the game
      // hack job: end the game by setting end time to past to let MK do the job
      let timeInPast = moment().tz('America/Los_Angeles')
      timeInPast.subtract(1, 's')
      firebase.database().ref('/pzs/' + this.state.pzIndex).update({
        timeGameEnds: timeInPast.format("kk:mm:ss")
      })
    }
  }

  endGame(score) {
    console.log('*** END GAME ***');
    let attempts = this.props.user.pzs[this.state.pzIndex].attempts + 1
    let oldScore = this.props.user.pzs[this.state.pzIndex].score
    let totalScore = this.state.pz.totalScore
    let rank = (score/totalScore > .50) ? ( (score/totalScore > .85) ? 1 : 2 ) : 3
    let chapter = (attempts === 1) ? this.props.user.chapter + 1 : this.props.user.chapter
    let pzCode = this.state.pzCode
    let refPz = '/users/' + this.props.user.id + '/pzs/' + this.state.pzIndex
    let refUser = '/users/' + this.props.user.id
    if(attempts > 1 && score <= oldScore) {
      console.log('You didnt beat your last score of: ' + oldScore)
      score = oldScore
    }
    let val = {
      attempts: attempts,
      code: pzCode,
      score: score/totalScore,
      rank: rank
    }
    this.props.setUserPz(this.state.pzIndex, val) // update app state for user pz
    this.forceUpdate() // because new attempts value isnt recognized
    // update the user score
    firebase.database().ref(refPz).update({
      score: score,
      code: pzCode,
      attempts: attempts,
      rank: rank
    }).then(function(){
      firebase.database().ref(refUser).update({
        chapter: chapter,
        chapterRank: rank
      })
    })
  }

  render(){
    const PzCode = pzMap[this.state.pzCode]
    let contentScore = null
    let content = null
    let pzAttempts = this.props.user.pzs[this.state.pzIndex].attempts
    if(pzAttempts >= 1 && this.state.pz.status != 'active') {
      contentScore = <PzScore
        pzCode={this.state.pzCode}
        pzIndex={this.state.pzIndex}
        pzStatus={this.state.pz.status}
        pzPlayerIDs={this.state.pz.players}
      />
    }
    // see if you are in players list
    if(this.state.pz.status == 'active' && this.state.pz.players && this.state.pz.players.indexOf(this.state.userID) >= 0) {
      let clockImg = clockMap['clock' +  this.state.pz.clock]
      content = <PzCode
        endGame={(score) => this.endGame(score)}
        endRound={() => this.endRound()}
        round={this.state.pz.round}
        user={this.props.user}
        clock={clockImg}
      />
    } else {
      content = <PzStart
        pzCode={this.state.pzCode}
        pzIndex={this.state.pzIndex}
        pzStatus={this.state.pz.status}
        pzPlayerIDs={this.state.pz.players}
        pzAttempts={pzAttempts}
      />
    }
    return(
      <div>
        <h1>round: {this.state.pz.round}</h1>
        {contentScore}
        {content}
      </div>
    )
  }
}

const PzContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Pz)

export default PzContainer
