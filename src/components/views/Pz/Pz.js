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

import Score, { calcMaxScore, calcHintCost } from '../../../utils/Score.js'
import AI from '../../AI'
import { showAlert } from '../../Alert'

import game from '../../../Settings.js'
import { propsPzs } from '../../../data/propsPzs.js'

import sms from '../../pzs/sms/Pz1'
import oop from '../../pzs/oop/Pz2'
import rfid from '../../pzs/rfid/Pz3'
import asimo from '../../pzs/asimo/Pz4'
import rgba from '../../pzs/rgba/Pz5'
import foss from '../../pzs/foss/Pz6'
import gwbasic from '../../pzs/gwbasic/Pz7'
import nan from '../../pzs/nan/Pz8'
import oom from '../../pzs/oom/Pz9'
import onegl from '../../pzs/onegl/Pz10'

import clock0 from '../../../images/pz/clock/clock-0.svg'
import clock1 from '../../../images/pz/clock/clock-1.svg'
import clock2 from '../../../images/pz/clock/clock-2.svg'
import clock3 from '../../../images/pz/clock/clock-3.svg'
import clock4 from '../../../images/pz/clock/clock-4.svg'
import clock5 from '../../../images/pz/clock/clock-5.svg'

const pzMap = {
  sms,
  oop,
  rfid,
  asimo,
  rgba,
  foss,
  gwbasic,
  nan,
  oom,
  onegl
}

const clockMap = {
  clock0, clock1, clock2, clock3, clock4, clock5
}

const mapStateToProps = (state, props) => {
  return {
    user: state.user,
    debug: state.admin.debug
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
    if (value.round != this.state.pz.round) this.pzAlert('roundChange', value)
    this.setState({ pz: value })
  }

  pzAlert(action, val) {
    let msg = ''
    let type = 'default'
    let pzProps = propsPzs[this.state.pzIndex]
    if(action === 'roundChange' && val.players && val.players.indexOf(this.state.userID) >= 0) {
      if (val.round=== 0) {
        msg = 'First Round'
      } else if (val.round < pzProps.rounds.numOfRounds - 1 && val.round >= 0) {
        msg = 'Next Round'
      } else if (val.round >= pzProps.rounds.numOfRounds - 1) {
        msg = 'Final Round'
      }
      let delay = (pzProps.alerts && pzProps.alerts.nextRoundDelaySec) ? pzProps.alerts.nextRoundDelaySec : 0
      if (msg === 'Next Round' && delay > 0) {
        let timer = setTimeout(() => {
          showAlert(msg, type)
        }, delay * 1000)
      } else {
        showAlert(msg, type)
      }
      return
    }

    if (msg !== '') showAlert(msg, type)
  }

  // CHILD FUNCS

  endRound(endGame = false) {
    //set the round # and time of next round (if any)
    let newRoundNum = this.state.pz.round+1
    this.setState({ endGame: endGame })

    if (newRoundNum === propsPzs[this.state.pzIndex].rounds.numOfRounds - 1 && !endGame) {
      console.log('*** FINAL ROUND ***');
      //showAlert('Final Round')
      let timeNextRound = moment(this.state.pz.timeGameEnds, 'kk:mm:ss') // set the end of the round to the end of the game so the clock works
      //newRoundNum = this.state.pz.round // roll back the round counter, since we are not addng a new round
      let update = {
        round: newRoundNum,
        timeNextRound: 'timeNextRound.format("kk:mm:ss")',
        clock: 0
      }
      firebase.database().ref('/pzs/' + this.state.pzIndex).update(update)
    } else if (newRoundNum < propsPzs[this.state.pzIndex].rounds.numOfRounds && !endGame) {
      console.log('*** END ROUND ***');
      //showAlert('Next Round')
      // go to next round
      let timeNextRound = moment().tz('America/Los_Angeles')
      timeNextRound.add(propsPzs[this.state.pzIndex].rounds.roundSec, 's')
      let update = {
        round: newRoundNum,
        timeNextRound: 'timeNextRound.format("kk:mm:ss")',
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
        timeGameEnds: timeInPast.format("kk:mm:ss"),
        expired: endGame
      })
    }
  }

  endGame(score) {
    console.log('*** END GAME ***');
    let attempts = this.props.user.pzs[this.state.pzIndex].attempts + 1
    let oldScore = this.props.user.pzs[this.state.pzIndex].score
    // add user points to base (thanks-for-playing) points
      let basePoints = game.score.pz - (this.state.pz.rounds.numOfRounds * game.score.round)
      let scoreUtil = new Score(this.state.pzIndex)
      let maxScore = scoreUtil.calcMaxScore(this.props.user.pzs[this.state.pzIndex].hints, 1)
      let newScore = ((basePoints + score) > maxScore) ? maxScore : basePoints + score
      if (this.state.endGame) newScore = 1 // give them one point for finding the Pz
    let totalScore = game.score.pz // use method 2 flat score, as opposed to: this.state.pz.totalScore
    let rank = (newScore/totalScore > .50) ? ( (newScore/totalScore > .85) ? 1 : 2 ) : 3
    let chapter = (attempts === 1) ? this.props.user.chapter + 1 : this.props.user.chapter
    let pzCode = this.state.pzCode
    let refPz = '/users/' + this.props.user.id + '/pzs/' + this.state.pzIndex
    let refUser = '/users/' + this.props.user.id
    if(attempts > 1 && newScore <= oldScore) {
      //showAlert('You didnt beat your last score')
      newScore = oldScore
    }
    let val = {
      attempts: attempts,
      code: pzCode,
      score: newScore,
      rank: rank
    }
    this.props.setUserPz(this.state.pzIndex, val) // update app state for user pz
    this.forceUpdate() // because new attempts value isnt recognized
    // update the user score
    firebase.database().ref(refPz).update({
      score: newScore,
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

  htmlPzInfo() {
    return(
      <div>
        <h1>{propsPzs[this.state.pzIndex].title}</h1>
        <p>{propsPzs[this.state.pzIndex].desc}</p>
        <p>{propsPzs[this.state.pzIndex].instructions}</p>
      </div>
    )
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
        user={this.props.user}
      />
    }
    // see if you are in players list
    if(this.state.pz.status == 'active' && this.state.pz.players && this.state.pz.players.indexOf(this.state.userID) >= 0) {
      let clockImg = clockMap['clock' +  this.state.pz.clock]
      content = <PzCode
        endGame={(score) => this.endGame(score)}
        endRound={(endGame) => this.endRound(endGame)}
        round={this.state.pz.round}
        user={this.props.user}
        clock={clockImg}
        numOfUsers={(this.state.pz) ? this.state.pz.players.length : 1}
        expired={this.state.pz.expired}
      />
    } else {
      content = <PzStart
        pzCode={this.state.pzCode}
        pzIndex={this.state.pzIndex}
        pzStatus={this.state.pz.status}
        pzPlayerIDs={this.state.pz.players}
        pzAttempts={pzAttempts}
        history={this.props.history}
      />
    }

    // pz info (dont show if game is active)
    let htmlPzInfo = (this.state.pz.status === 'active') ? '' : this.htmlPzInfo()

    // debug
    let htmlRound = (this.props.debug) ? <h1>round: {this.state.pz.round}</h1> : ''

    return(
      <div id='component-pz'>
        <AI />
        {htmlPzInfo}


        {htmlRound}
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
