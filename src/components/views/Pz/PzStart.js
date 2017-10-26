import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

class PzStart extends Component {
  constructor(props){
      super(props)
      this.state = {
        pzCode: this.props.pzCode
      }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        pzCode: nextProps.pzCode
      });
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

  }


  render(){
    const pzStatus = this.props.pzStatus
    let content = null
    if(pzStatus === 'active') {
      content = <button disabled='disabled'>Game in Progress</button>
    } else if( pzStatus === 'inactive') {
      content = <button onClick={() => this.requestNewGame() }>Start</button>
    } else if (pzStatus === 'loading') {
      content = <button onClick={() => this.requestJoin() }>Join</button>
    }

    return(
      <div className='component-wrapper'>
        <h1>Pz Start: {this.state.pzCode}</h1>
        pz code: {this.props.pzCode}<br/>
        pz index: {this.props.pzIndex}
        {content}
      </div>
    )
  }
}

export default PzStart
