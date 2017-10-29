import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { setUserPz } from '../../../actions/userActions'

import PzStart from './PzStart'
import PzScore from './PzScore'

import { propsPzs } from '../../../data/propsPzs.js'

import pz1 from '../../pzs/pz1/Pz1'
import pz2 from '../../pzs/pz2/Pz2'
import pz3 from '../../pzs/pz3/Pz3'

const pzMap = {
  pz1,
  pz2,
  pz3
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

  endGame(score) {
    console.log('*** END GAME ***');
    let attempts = this.props.user.pzs[this.state.pzIndex].attempts + 1
    let oldScore = this.props.user.pzs[this.state.pzIndex].score
    let chapter = (attempts === 1) ? this.props.user.chapter + 1 : this.props.user.chapter
    let pzCode = this.state.pzCode
    let refPz = '/users/' + this.props.user.id + '/pzs/' + this.state.pzIndex
    let refUser = '/users/' + this.props.user.id
    if(attempts > 1 && score <= oldScore) {
      alert('You didnt beat your last score of: ' + oldScore)
      score = oldScore
    }
    let val = {
      attempts: attempts,
      code: pzCode,
      score: score
    }
    this.props.setUserPz(this.state.pzIndex, val) // update app state for user pz
    this.forceUpdate() // because new attempts value isnt recognized
    // update the user score
    firebase.database().ref(refPz).update({
      score: score,
      code: pzCode,
      attempts: attempts
    }).then(function(){
      firebase.database().ref(refUser).update({
        chapter: chapter
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
    if(this.state.pz.status == 'active') {
      content = <PzCode
        endGame={(score) => this.endGame(score)}
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
