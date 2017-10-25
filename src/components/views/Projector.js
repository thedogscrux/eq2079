import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { staticLaunches, staticUsers } from '../../data/static.js'

class Projector extends Component {
  constructor(props) {
    super(props)
    this.state = {
      launches: [],
      users: [],
      pzs: []
    }
  }

  componentDidMount() {
    this.watchDB()
  }

  // WATCH

  watchDB() {
    var self = this
    // watch launches
    firebase.database().ref('/launches/').on('value', function(snapshot) {
      if(snapshot.val()) {
        let launches = Object.keys(snapshot.val()).map( (launch, key) => snapshot.val()[launch] )
        self.updateStateLaunches(launches)
      }
    })
    // watch users
    firebase.database().ref('/users/').orderByChild('status').equalTo('active').on('value', function(snapshot) {
      if(snapshot.val()) {
        let users = Object.keys(snapshot.val()).map( (user, key) => snapshot.val()[user] )
        self.updateStateUsers(users)
      }
    })
    // watch pzs
    firebase.database().ref('/pzs/').on('value', function(snapshot) {
      if(snapshot.val()) {
        let pzs = Object.keys(snapshot.val()).map( (pz, key) => snapshot.val()[pz] )
        self.updateStatePzs(pzs)
      }
    })
  }

  updateStateLaunches(launches) {
    this.setState({ launches: launches })
  }

  updateStateUsers(users) {
    this.setState({ users: users })
  }

  updateStatePzs(pzs) {
    this.setState({ pzs: pzs })
  }

  // GET

  getLaunchStatus() {
    let html = ''
    let launch = this.state.launches.filter( launch => launch.status === 'active')
    launch = launch[0]
    if(launch) {
      return(
        <div>
          Start: {launch.start}<br/>
          Players: {launch.players}<br/>
          Total Score: {launch.totalScore}<br/>
        </div>
      )
    }
    return ''
  }

  getPastLaunches() {
    let html = ''
    let launches = this.state.launches.filter( launch => launch.status !== 'active')
    html = launches.map( (launch, key) => {
      return (
        <div key={key}>
          End: {launch.end}<br/>
          Players: {launch.players}<br/><br/>
        </div>
      )
    })
    return html
  }

  htmlUsers() {
    let html = ''
    // build array of active users
    let users = this.state.users.map( (user,key) => {
      // calc total score
      let totalScore = 0
      for(let key in user.pzs) {
        totalScore += user.pzs[key].score
      }
      return {
        name: user.name,
        score: totalScore
      }
    })
    // sort array based on score in DESC
    users.sort(function (a, b) {
      return b.score - a.score
    });
    html = users.map( (user,key) => {
      return(
        <div key={key}>
          Name: {user.name}<br/>
          Total Score: {user.score}<br/><br/>
        </div>
      )
    })
    return html
  }

  render(){
    return(
      <div>
        <h1>Projector</h1>

        <h2>Active Launch</h2>
        {this.getLaunchStatus()}

        <h2>Active Players</h2>
        {this.htmlUsers()}

        <h2>Past Launches</h2>
        {this.getPastLaunches()}
      </div>
    )
  }
}

export default Projector
