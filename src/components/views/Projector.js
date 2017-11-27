import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { staticLaunches, staticUsers } from '../../data/static.js'
import game from '../../Settings.js'
import { propsPzs } from '../../data/propsPzs.js'

const LEADERBAR_COLORS = [
  'red',
  'yellow',
  'cyan',
  'blue',
  'magenta',
  'BlueViolet',
  'BlanchedAlmond',
  'Coral',
  'DarkGreen',
  'Grey'
]

class Projector extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeLaunch: {},
      launches: [],
      users: [],
      pzs: [],
      render: false
    }
  }

  componentDidMount() {
    this.watchDB()
  }

  // WATCH

  watchDB() {
    var self = this
    // watch users
    firebase.database().ref('/users/').orderByChild('status').equalTo('active').on('value', function(snapshot) {
      if(snapshot.val()) {
        let users = Object.keys(snapshot.val()).map( (user, key) => snapshot.val()[user] )
        self.updateStateUsers(users)
      }
    })
    // watch launches
    firebase.database().ref('/launches/').on('value', function(snapshot) {
      if(snapshot.val()) {
        let launches = Object.keys(snapshot.val()).map( (launch, key) => {
          let newLaunch = snapshot.val()[launch]
          newLaunch.id = launch
          return newLaunch
        })
        self.updateStateLaunches(launches)
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
    this.updateStateActiveLaunch()
    if (this.state.users.length >= 1 && this.state.pzs.length >= 1 && !this.state.render) this.setState({ render: true })
  }

  updateStateActiveLaunch() {
    let activeLaunch = this.state.launches.filter( (launch, key) => launch.status === 'active')
    if (activeLaunch.length <= 0) return
    activeLaunch = activeLaunch[0]
    activeLaunch.totalScore = this.calcTotalLaunchScore()
    this.setState({ activeLaunch: activeLaunch })
  }

  updateStateUsers(users) {
    this.setState({ users: users })
    this.updateStateActiveLaunch()
    if (this.state.launches.length >= 1 && this.state.pzs.length >= 1 && !this.state.render) this.setState({ render: true })
  }

  updateStatePzs(pzs) {
    this.setState({ pzs: pzs })
    this.updateStateActiveLaunch()
    if (this.state.users.length >= 1 && this.state.launches.length >= 1 && !this.state.render) this.setState({ render: true })
  }

  // GET

  getLaunchStatus() {
    let html = ''
    let launchId = ''
    return(
      <div>
        Start: {this.state.activeLaunch.start}<br/>
        Players: {this.state.activeLaunch.players}<br/>
        Total Score: {this.state.activeLaunch.totalScore} / {game.score.launch}<br/>
      </div>
    )
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

  // CALC

  calcTotalLaunchScore() {
    let userPzs = this.state.users.map( user => user.pzs)
    let totalScore = 0
    userPzs.forEach( (pzs,key) => {
      pzs.forEach( (pz,key) => {
        totalScore = totalScore + pz.score
      })
    })
    return totalScore
  }

  htmlLeaderbar() {
    let html = ''
    // build array of active users
    let users = this.state.users.map( (user,key) => {
      // calc total score
      let totalScore = 0
      for(let key in user.pzs) {
        totalScore += user.pzs[key].score
      }
      return {
        ...user,
        score: totalScore
      }
    })
    // sort array based on score in DESC
    users.sort(function (a, b) { return b.score - a.score });
    // buid bar
    //give the user a bar the size equal to the amount of points they have contributed to the total scores
    let colorIndex = 0
    html = users.map( (user,key) => {
      // get user info (inc height)
      let cssUser = {}
      let userPercentContribution = (user.score / game.score.launch) * 100
      cssUser.height = userPercentContribution + '%'
      cssUser.borderBottom = 'solid 1px ' + LEADERBAR_COLORS[colorIndex]
      // get bar info
      let cssBar = {}
      cssBar.backgroundColor = LEADERBAR_COLORS[colorIndex]
      colorIndex = (colorIndex >= LEADERBAR_COLORS.length - 1) ? 0 : colorIndex + 1
      return(
        <div key={key} className='user' style={cssUser}>
          <div className='bar-segment' style={cssBar}></div>
          <div className='text'>{user.name}{(user.ai.strength > 0) ? ' [AI'+user.ai.strength+']' : ''} : {user.score}</div>
        </div>
      )
    })
    return html
  }

  render(){

    let htmlLaunchStatus = ''
    let htmlLeaderbar = ''
    let htmlPastLaunches = ''

    if(this.state.render) {
      console.log('updating...');
      htmlLaunchStatus = this.getLaunchStatus()
      htmlLeaderbar = this.htmlLeaderbar()
      htmlPastLaunches = this.getPastLaunches()
    }

    return(
      <div id='component-projector'>
        <h1>Projector</h1>

        <div id='status-wrapper'>
          <div id='active-launch-stats'>{htmlLaunchStatus}</div>
          <div id='leaderbar'>{htmlLeaderbar}</div>
        </div>



        <h2>Past Launches</h2>
        {htmlPastLaunches}
      </div>
    )
  }
}

export default Projector
