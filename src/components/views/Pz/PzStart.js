import React, { Component } from 'react'
import { connect } from 'react-redux'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

const mapStateToProps = (state, props) => {
  return {
    user: state.user
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
    firebase.database().ref('/pzs/' + this.props.pzIndex + '/players/').once('value').then(function(snapshot){
      let userCount = snapshot.val().filter(playerID => playerID == userID)
      if(userCount < 1) {
        let newPlayers = pzPlayerIDs || []
        newPlayers.push(userID)
        firebase.database().ref('/pzs/' + pzIndex).update({
          players: newPlayers
        }).then(function(){
          self.updateUserJoined(true)
        })
      }
    })
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

    return(
      <div className='component-wrapper'>
        <h1>Pz Start: {this.state.pzCode}</h1>
        pz code: {this.props.pzCode}<br/>
        pz index: {this.props.pzIndex}<br/>
        pz attempts: {this.props.pzAttempts}<br/>
        pz players: { !(this.state.pzPlayers) ? '' : this.state.pzPlayers.map(player => player + ', ') }
        {content}
      </div>
    )
  }
}

const PzStartContainer = connect(
  mapStateToProps
)(PzStart)

export default PzStartContainer
