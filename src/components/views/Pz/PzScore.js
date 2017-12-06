import React, { Component } from 'react'
import { connect } from 'react-redux'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Score, { calcMaxScore, calcHintCost } from '../../../utils/Score.js'
import { propsPzs } from '../../../data/propsPzs.js'
import { staticPzEndMsg } from '../../../data/static.js'

import PzStart from './PzStart'

const mapStateToProps = (state, props) => {
  return {
    userId: state.user.id,
    debug: state.admin.debug
  }
}

class PzScore extends Component {
  constructor(props){
      super(props)
      let pzIndex = propsPzs.findIndex(pz => pz.code === this.props.pzCode)
      let score = new Score(pzIndex)
      this.state = {
        pzCode: this.props.pzCode,
        pzIndex: pzIndex,
        pz: {},
        playAgain: false,
        maxScore: score.calcMaxScore(props.user.pzs[pzIndex].hints, 1),
      }
  }

  componentDidMount() {
    this.watchDB()
  }

  componentWillUnmount() {
    this.unwatchDB()
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      let pzIndex = propsPzs.findIndex(pz => pz.code === nextProps.pzCode)
      this.setState({
        pzCode: nextProps.pzCode,
        pzIndex: pzIndex
      })
      //if(pzIndex==0) pzIndex = '0' // workaround for firebase zero/null starting index
      this.watchDB(pzIndex)
    }
  }

  // WATCH

  unwatchDB() {
    firebase.database().ref('users/' + this.props.userId + '/pzs/' + this.state.pzIndex).off()
  }

  watchDB(index) {
    let pzIndex = index
    if(!pzIndex) pzIndex = this.state.pzIndex
    var self = this
    firebase.database().ref('users/' + this.props.userId + '/pzs/' + pzIndex).on('value', function(snapshot) {
      self.updateStatePz(snapshot.val())
    })

  }

  updateStatePz(pz) {
    this.setState({
      pz: pz
    })
  }

  render(){
    let playAgainStart = (this.state.playAgain) ?
      <PzStart pzCode={this.props.pzCode} pzIndex={this.props.pzIndex} pzStatus={this.props.pzStatus} pzPlayerIDs={this.props.pzPlayerIDs}/>
      :
      <button onClick={() => this.setState({playAgain: true})}>Play Again? (add pzs to app state to control -app-state-pzs-0-playAgain: true)</button>

    let htmlAdmin = (this.props.debug) ? <div>Pz Score: {this.state.pzCode}<br/>index: {this.state.pzIndex}</div> : ''

    return(
      <div id='component-pz-score' className='component-wrapper'>
        {htmlAdmin}
        <h2>Score</h2>
        {staticPzEndMsg[this.state.pz.rank-1]}<br/>
        {propsPzs[this.state.pzIndex].rankMsg[this.state.pz.rank-1]}<br/>

        my score: {(this.state.pz) ? this.state.pz.score : ''}<br/>
        max score: {this.state.maxScore}<br/>

        {/*}{playAgainStart}*/}
      </div>
    )
  }
}

const PzScoreContainer = connect(
  mapStateToProps
)(PzScore)

export default PzScoreContainer
