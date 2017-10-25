import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { staticPzs, staticLaunches, staticUsers } from '../../data/static.js'
import { schemaLaunch, schemaUser, schemaPz } from '../../data/schemas.js'
import { propsPzs } from '../../data/propsPzs.js'

class MK extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeLaunch: {},
      pastLaunches: [],
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
        let launches = Object.keys(snapshot.val()).map( (launch, key) => {
          let launchObj = snapshot.val()[launch]
          launchObj.id = Object.keys(snapshot.val())[key]
          return launchObj
        })
        self.updateStateLaunches(launches)
      }
    })
    // watch users
    firebase.database().ref('/users/').on('value', function(snapshot) {
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
    let activeLaunchKey = launches.findIndex(launch => launch.status === 'active')
    let activeLaunch = launches[activeLaunchKey]
    this.setState({
      pastLaunches: launches,
      activeLaunch: activeLaunch
    })
  }

  updateStateUsers(users) {
    this.setState({ users: users })
  }

  updateStatePzs(pzs) {
    this.setState({ pzs: pzs })
  }

  // GET HTML
  htmlActiveLaunch() {
    return(
      <div className='row'>
        <div className='col'>
          Status: {this.state.activeLaunch.status}<br/>
          Start: {this.state.activeLaunch.start}<br/>
          End: {this.state.activeLaunch.end}<br/>
        </div>
        <div className='col'>
          Players: {this.state.activeLaunch.players}<br/>
          Total Score: {this.state.activeLaunch.totalScore}<br/>
          Total Game Plays: {this.state.activeLaunch.totalGamePlays}<br/>
        </div>
      </div>
    )
  }

  htmlPastLaunches(status) {
    let html = ''
    html = this.state.pastLaunches.map( (launch, key) => {
      if(launch.status != status) {
        return
      }
      return(
        <div key={key} className='row'>
          <div className='col'>
            Status: {launch.status}<br/>
            Start: {launch.start}<br/>
            End: {launch.end}<br/>
          </div>
          <div className='col'>
            Players: {launch.players}<br/>
            Total Score: {launch.totalScore}<br/>
            Total Game Plays: {launch.totalGamePlays}<br/>
          </div>
        </div>
      )
    })
    return html
  }

  htmlUsers() {
    let html = ''
    html = this.state.users.map( (user, key) => {
      return (
        <article key={key}>
          <h3>{user.name}</h3>
          <div className='row'>
            <div className='col'>
              Job: {user.job}<br/>
              Status: {user.status}<br/>
              Time Last Checkin: {user.timeLastCheckin}<br/>
              IP: {user.ip}<br/>
              Agent: {user.agent}<br/>
              Location: {user.loc.lat}, {user.loc.long}<br/>
              <button>Block User IP</button>
              <button>Delete User</button>
              <button>Reset User</button>
            </div>
            <div className='col'>
              { user.pzs.map( (pz, key) => {
                return(
                  <div key={key}>
                    Pz Name: {pz.name}<br/>
                    Pz Attempts: {pz.attempts}<br/>
                    Pz Score: {pz.score}<br/><br/>
                  </div>
                )
              })}
            </div>
            <div className='col'>
              {/* placholder */}
            </div>
          </div>
        </article>
      )
    })
    return html
  }

  htmlPzs() {
    let html = ''
    html = this.state.pzs.map( (pz, key) => {
      return (
        <article key={key}>
          <h3>{pz.name}</h3>
          <div className='row'>
            <div className='col'>
              players: {pz.players}<br/>
              status: {pz.status}<br/>
              <button>Reset {pz.name}</button>
            </div>
            <div className='col'>
              Round: {pz.round}<br/>
              Game Starts: {pz.timeGameStarts}<br/>
              Game Ends: {pz.timeGameEnds}<br/>
              Seconds Till Next Round: {pz.secTillNextRoundStarts}<br/>
            </div>
            <div className='col'>
              Total Plays: {pz.totalPlays}<br/>
              Total Players: {pz.totalPlayers}<br/>
            </div>
          </div>
        </article>
      )
    })
    return html
  }

  // SET

  newGame() {
    let newLaunch = schemaLaunch
    newLaunch.status = 'active'
    firebase.database().ref('/launches/').push(newLaunch, function(error) {
      console.log('New game started (callback)');
    })
  }

  resetPzs() {
    console.log('Reset Pzs.');
    let pzs = []
    pzs = propsPzs.map( (pzProps, key) => {
      let pz = {
        name: '',
        code: '',
        players: 0,
        status: 'inactive|loading|active',
        location: {
          lat: 0,
          long: 0
        },
        mapPos: {
          floor: 'ground',
          top: '0%',
          left: '0%'
        },
        timeGameStarts: '00:00:00',
        timeGameEnds: '00:00:00',
        secTillNextRoundStarts: 0,
        round: 0,
        totalPlays: 0,
        totalPlayers: 0
      }
      pz.name = pzProps.name
      pz.code = pzProps.code
      pz.location = pzProps.location
      pz.mapPos = pzProps.mapPos
      pz.status = 'inactive'
      return pz
    })
    firebase.database().ref('/pzs/').set(pzs)
  }

  render(){
    let test = ''
    return(
      <div id='component-mk'>
        <h1>Mission Kontrol</h1>
        <button style={{display:'inline-block'}} onClick={() => this.newGame()}>New Game</button>
        <button style={{display:'inline-block'}} onClick={() => this.resetPzs()}>Reset Pzs</button>
        <br/>
        <button style={{display:'inline-block', backgroundColor: 'rgba(255,0,0,.4)'}}>Reset Game</button>
        <button style={{display:'inline-block'}}>Start/Pause Game</button>
        <button style={{display:'inline-block'}}>Stop Game</button>

        <h2>Active Launch</h2>
        {this.htmlActiveLaunch()}

        <h2>Pzs</h2>
        {this.htmlPzs()}

        <h2>Past Launches</h2>
        {this.htmlPastLaunches('complete')}

        <h2>Users</h2>
        {this.htmlUsers()}
      </div>
    )
  }
}

export default MK
