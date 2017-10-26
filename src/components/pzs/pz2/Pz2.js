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

const pzIndex = 1

class Pz2 extends Component {
  constructor(props){
    super(props)
    this.state = {
      points: 0
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
        <button onClick={() => this.getPoint()}>Points {this.state.points}</button>
      </div>
    )
  }
}

const Pz2Container = connect(
  mapStateToProps
)(Pz2)

export default Pz2Container
