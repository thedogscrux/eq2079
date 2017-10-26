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
      pzPlayers: []
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
        pzPlayers: players
      })
    }
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
    firebase.database().ref('/pzs/' + this.props.pzIndex).update({
      status: 'loading'
    })
  }

  joinGame() {
    let newPlayers = this.props.pzPlayerIDs || []
    newPlayers.push(this.props.user.id)
    firebase.database().ref('/pzs/' + this.props.pzIndex).update({
      players: newPlayers
    })
  }


  render(){
    const pzStatus = this.props.pzStatus
    let content = null
    if(pzStatus === 'active') {
      content = <button disabled='disabled'>Game in Progress</button>
    } else if( pzStatus === 'inactive') {
      content = <button onClick={() => this.requestNewGame() }>Start</button>
    } else if (pzStatus === 'loading') {
      content = <button onClick={() => this.joinGame() }>Join</button>
    }

    return(
      <div className='component-wrapper'>
        <h1>Pz Start: {this.state.pzCode}</h1>
        pz code: {this.props.pzCode}<br/>
        pz index: {this.props.pzIndex}<br/>
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
