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

const pzIndex = 0

class Pz1 extends Component {
  constructor(props){
    super(props)
    this.state = {
      points: 0
    }
  }

  componentWillUnmount() {
    console.log('*** END GAME ***');
    this.endGame()
  }

  endGame() {
    let ref = '/users/' + this.props.user.id + '/pzs/' + pzIndex
    let attempts = 0
    let score = this.state.points
    firebase.database().ref(ref).once('value').then(function(snapshot){
      attempts = (snapshot.val()) ? snapshot.val().attempts + 1 : 1
      // upload score
      firebase.database().ref(ref).update({
        score: score,
        attempts: attempts
      });
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
        <button onClick={() => this.getPoint()}>Points {this.state.points}</button>
      </div>
    )
  }
}

const Pz1Container = connect(
  mapStateToProps
)(Pz1)

export default Pz1Container
