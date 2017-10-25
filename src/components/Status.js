import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { staticLaunches } from '../data/static.js'

class Status extends Component {
  constructor(props) {
    super(props)
    this.state = {
      launch: {}
    }
  }

  componentDidMount() {
    this.watchDB()
  }

  // GET
  watchDB() {
    var self = this
    firebase.database().ref('/launches/').orderByChild('status').equalTo('active').on('value', function(snapshot) {
      let numOfLaunches = Object.keys(snapshot.val()).length
      if(numOfLaunches > 1) {
        console.log('*** Alert: More than one active game ***');
      } else {
        let launch = Object.keys(snapshot.val()).map( (launch, key) => snapshot.val()[launch] )
        self.updateStateLaunch(launch[0])
      }
    })

  }

  updateStateLaunch(launch) {
    this.setState({ launch: launch })
  }

  getLaunchStatus() {
    let html = ''
    return(
      <div>
        Status: {this.state.launch.status}<br/>
        Start: {this.state.launch.start}<br/>
        End: {this.state.launch.end}<br/>
        Players: {this.state.launch.players}<br/>
        Total Score: {this.state.launch.totalScore}<br/>
        Total Game Plays: {this.state.launch.totalGamePlays}<br/>
      </div>
    )
  }

  render(){
    return(
      <div className='component-wrapper'>
        <h2>Launch Status</h2>
        {this.getLaunchStatus()}
      </div>
    )
  }
}

export default Status
