import React, { Component } from 'react'
import { connect } from 'react-redux'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { showAlert } from '../../Alert'

import { propsPzs } from '../../../data/propsPzs.js'

const mapStateToProps = (state, props) => {
  return {
    user: state.user,
    debug: state.admin.debug
  }
}

class PzStart extends Component {
  constructor(props){
    super(props)
    this.state = {
      pzCode: this.props.pzCode,
      pzPlayerIDs: [],
      pzPlayers: [],
      userJoined: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        pzCode: nextProps.pzCode,
        pzPlayerIDs: nextProps.pzPlayerIDs,
        pzPlayers: []
      });
      this.watchDB()
    }
  }

  componentWillUnmount() {
    this.unwatchDB()
  }

  // WATCH

  unwatchDB() {
    firebase.database().ref('pzs/' + this.props.pzIndex + '/players').off()
  }

  watchDB() {
    let self = this
    firebase.database().ref('pzs/' + this.props.pzIndex + '/players').on('value', function(snapshot) {
      firebase.database().ref('/users/').once('value', function(snapshot){
        self.updatePlayers(snapshot.val())
      })
    })
  }

  updatePlayers(users) {
    if(this.props.pzPlayerIDs) {
      let players = this.state.pzPlayerIDs.map(player => users[player].name)
      this.setState({
        pzPlayers: players,
        userJoined: (this.state.pzPlayerIDs.indexOf(this.props.user.id) > -1) ? true : false
      })
    }
  }

  updateUserJoined(joined){
    this.setState({
      userJoined: joined
    })
  }

  // FUNCS

  linkDashboard() {
    this.props.history.push('/dashboard')
  }

  requestNewGame() {
    var self = this
    firebase.database().ref('/pzs/' + this.props.pzIndex).once('value').then(function(snapshot){
      let pz = snapshot.val()
      if(pz.status === 'active') {
        alert('Game is locked')
      } else if (pz.status === 'inactive') {
        self.loadGame()
      } else if(pz.status === 'loading') {
        self.joinGame()
      } else {
        console.log('Pz state undefined!', pz);
      }
      return
    })
  }

  loadGame() {
    // start a new game by setting it to LOADING status
    let self = this
    firebase.database().ref('/pzs/' + this.props.pzIndex).update({
      status: 'loading',
      players: [this.props.user.id]
    }).then(function(){
      self.updateUserJoined(true)
    })
  }

  joinGame() {
    let self = this
    let pzPlayerIDs = this.props.pzPlayerIDs
    let userID = this.props.user.id
    let pzIndex = this.props.pzIndex
    let maxPlayers = propsPzs[pzIndex].maxPlayers || 2
    firebase.database().ref('/pzs/' + this.props.pzIndex + '/players/').once('value').then(function(snapshot){
      let userCount = snapshot.val().filter(playerID => playerID == userID)
      if(userCount < 1 && snapshot.val().length < maxPlayers ) {
        let newPlayers = pzPlayerIDs || []
        newPlayers.push(userID)
        firebase.database().ref('/pzs/' + pzIndex).update({
          players: newPlayers
        }).then(function(){
          self.updateUserJoined(true)
        })
      } else if (snapshot.val().length >= maxPlayers) {
        showAlert('Maximum Number of Players have already joined.')
      }
    })
  }

  htmlAdmin() {
    return(
      <div>
        <h1>Pz Start: {this.state.pzCode}</h1>
        pz code: {this.props.pzCode}<br/>
        pz index: {this.props.pzIndex}<br/>
      </div>
    )
  }

  htmlPlayers() {
    let players = this.state.pzPlayers.map(player => player + ', ')
    return (
      <div>
        pz players: {players}
      </div>
    )
  }

  render(){
    const pzStatus = this.props.pzStatus
    let content = null
    if(pzStatus === 'active') {
      content = <button disabled='disabled'>Game in Progress</button>
    } else if( pzStatus === 'inactive') {
      content = <button onClick={() => this.requestNewGame() }>{(this.props.pzAttempts >= 1) ? 'Play Again' : 'Start'}</button>
    } else if (pzStatus === 'loading' && !this.state.userJoined) {
      content = <button onClick={() => this.joinGame() }>Join</button>
    }

    let htmlAdmin = (this.props.debug) ? this.htmlAdmin() : ''

    let htmlPlayers = (this.state.pzPlayers.length >= 1) ? this.htmlPlayers() : ''

    return(
      <div id='component-pz-start' className='component-wrapper'>
        [Sn]/Pz/PzStart.js
        {htmlAdmin}
        {/*pz attempts: {this.props.pzAttempts}<br/>*/}
        {htmlPlayers}
        {content}
        <button onClick={() => this.linkDashboard() }>Return to Dashboard</button>
      </div>
    )
  }
}

const PzStartContainer = connect(
  mapStateToProps
)(PzStart)

export default PzStartContainer
