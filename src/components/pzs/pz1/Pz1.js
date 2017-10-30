import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

const pzIndex = 0

class Pz1 extends Component {
  constructor(props){
    super(props)
    this.state = {
      points: 0,
      round: 0
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        round: nextProps.round
      })
    }
  }

  componentWillUnmount() {
    let self = this
    let score = this.state.points
    firebase.database().ref('/pzs/' + pzIndex + '/status').once('value').then(function(snapshot){
      if(snapshot.val() === 'inactive') self.props.endGame(score)
    })
  }

  getPoint(){
    let points = this.state.points + 1
    this.setState({
      points: points
    })
  }

  render(){
    return(
      <div className='component-wrapper'>
        <h1>Pz One</h1>
        Round: {this.state.round}<br/>
        <button onClick={() => this.getPoint()}>Points {this.state.points}</button>
      </div>
    )
  }
}

export default Pz1
