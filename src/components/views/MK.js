import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import moment from 'moment'
import tz from 'moment-timezone'
import Random from 'random-js'

import game from '../../Settings.js'

import { staticPzs, staticLaunches, staticUsers } from '../../data/static.js'
import { schemaLaunch, schemaUser, schemaPz } from '../../data/schemas.js'
import { propsPzs } from '../../data/propsPzs.js'

import { genSettingsPz1 } from '../pzs/pz1/Pz1'
import { genSettingsPz2 } from '../pzs/pz2/Pz2'
import { genSettingsPz3} from '../pzs/pz3/Pz3'
import { genSettingsPz4 } from '../pzs/pz4/Pz4'
import { genSettingsPz5 } from '../pzs/pz5/Pz5'
import { genSettingsPz6 } from '../pzs/pz6/Pz6'
import { genSettingsPz7 } from '../pzs/pz7/Pz7'
import { genSettingsPz8 } from '../pzs/pz8/Pz8'
import { genSettingsPz9 } from '../pzs/pz9/Pz9'

const pzSettingsMap = {
  genSettingsPz1,
  genSettingsPz2,
  genSettingsPz3,
  genSettingsPz4,
  genSettingsPz5,
  genSettingsPz6,
  genSettingsPz7,
  genSettingsPz8,
  genSettingsPz9
}

// Clock
const pzLoadingSec = 5

class MK extends Component {
  constructor(props) {
    super(props)
    this.state = {
      timeNow: 0,
      activeLaunch: {},
      pastLaunches: [],
      users: [],
      pzs: [],
      launching: false
    }
    this.clock = this.clock.bind(this);
  }

  componentDidMount() {
    this.watchDB()
    this.timer = setTimeout(() => {
      this.clock()
    }, 2000);
  }

  componentWillUnmount() {
    this.unwatchDB()
  }

  // -----------------------------------------------------------------
  // WATCH
  // -----------------------------------------------------------------

  unwatchDB() {
    firebase.database().ref('/launches/').off()
    firebase.database().ref('/users/').off()
    firebase.database().ref('/pzs/').off()
  }

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
        //self.calcActiveLaunchTotalScore()
      }
    })
    // watch users
    firebase.database().ref('/users/').on('value', function(snapshot) {
      if(snapshot.val()) {
        let users = Object.keys(snapshot.val()).map( (user, key) => {
          let newUser = snapshot.val()[user]
          newUser.userID = user
          return newUser
        })
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

  updateStateLaunching(launching) {
    this.setState({
      launching: launching
    })
  }

  updateStateUsers(users) {
    let oldNumOfUsers = this.state.users.length
    this.setState({ users: users })
    if(oldNumOfUsers == 0 || oldNumOfUsers == users.length) {
      // existing users update
      this.calcActiveLaunchTotalScore()
    }
  }

  updateStatePzs(newPzs) {
    let oldPzs = this.state.pzs
    // check pz state, and update if needed (not sure if this comparison is working..)
    if(JSON.stringify(this.state.pzs) != JSON.stringify(newPzs)) {
      this.setState({ pzs: newPzs })
      oldPzs.map((oldPz, key) => {
        let newPz = newPzs[key]
        if(oldPz.status != newPz.status && newPz.status == 'loading') {
          this.pzStartLoding(key)
        } else if(oldPz.status != newPz.status && newPz.status == 'inactive') {
          console.log('pz just ended:', oldPz.name);
        } else if(oldPz.status != newPz.status && newPz.status == 'active') {
          console.log('pz just started:', oldPz.name);
        }
      })
    }
  }

  updateStateLaunchTotalScore(score) {
    this.setState({
      activeLaunch: {
        ...this.state.activeLaunch,
        totalScore: score
      }
    })
  }

  // updateStatePz(pzIndex, pzUpdates) {
  //   let pzs = this.state.pzs
  //   let pz = Object.assign({}, this.state.pzs[pzIndex], pzUpdates);
  //   if(JSON.stringify(this.state.pzs[pzIndex]) != JSON.stringify(pz)) {
  //     pzs[pzIndex] = pz
  //     // aparently above line is the same as update state?
  //     // this.setState({
  //     //   pzs: pzs
  //     // })
  //   }
  // }

  // -----------------------------------------------------------------
  // CLOCK
  // -----------------------------------------------------------------

  clock () {
    let timeNow = moment().tz('America/Los_Angeles')
    // Check each pz to see if action needs to be taken
    this.state.pzs.map((pz, key) => {
      if(pz.status === 'loading') {
        // start time is reached and changes status of pz
        if(timeNow.diff(moment(pz.timeGameStarts, 'kk:mm:ss'), 'seconds') > 0) this.pzStart(key)
      } else if(pz.status === 'active' && timeNow.diff(moment(pz.timeGameEnds, 'kk:mm:ss'), 'seconds') > 0) {
        // end time is reached, end the Pz
        this.pzEnd(key)
      } else if(pz.status === 'active' && pz.round <= propsPzs[key].rounds.numOfRounds) {
        if(timeNow.diff(moment(pz.timeNextRound, 'kk:mm:ss'), 'seconds') > 0) {
          // end of round detected, start next round
          this.pzNextRound(key)
        } else {
          let clockInterval = pz.rounds.roundSec / 4
          if ( timeNow.diff(moment(pz.timeGameStarts, 'kk:mm:ss'), 'seconds') >
            ( ((pz.round+1) * pz.rounds.roundSec) - (pz.rounds.roundSec - (clockInterval*pz.clock)) ) ) {
            // basically: if NOW is after the END of the round, minus the amount of seconds in an interval
            this.pzUpdateClock(key)
          }
        }
      }
    })

    // for debugging set timer to randomly update for realism
    // let random = new Random(Random.engines.mt19937().autoSeed())
    // let delay = (random.integer(1, 10) >= 5) ? 3000 : 1000
    let delay = 1000

    this.setState({
      timeNow: timeNow.format('kk:mm:ss')
    }, () => {
      this.timeout = window.setTimeout(this.clock, delay)
    });
  }

  clearTimeout = () => {
    // use clearTimeout on the stored timeout in the class property "timeout"
    window.clearTimeout(this.timeout);
    clearTimeout(this.timer);
  }

  // -----------------------------------------------------------------
  // PZS (possibly move to new file)
  // -----------------------------------------------------------------

  pzStartLoding(pzIndex) {
    let self = this
    // set the timeGameStarts and timeGameEnds
    let roundTotalSec = propsPzs[pzIndex].rounds.numOfRounds * propsPzs[pzIndex].rounds.roundSec
    let timeGameStarts = moment().tz('America/Los_Angeles')
    timeGameStarts.add(game.clock.pzLoadingSec, 's')
    let timeGameEnds = moment().tz('America/Los_Angeles')
    timeGameEnds.add(game.clock.pzLoadingSec + roundTotalSec, 's')
    // set the timeNextRound
    // TODO is this needed?
    // TODO clean up clock. calculate all roundEndTimes and place in array at beggining of game
    let update = {
      status: 'loading',
      timeGameStarts: timeGameStarts.format("kk:mm:ss"),
      timeGameEnds: timeGameEnds.format("kk:mm:ss")
    }
    firebase.database().ref('/pzs/' + pzIndex).update(update).then(function() {
      // self.updateStatePz(pzIndex, update) // update state manually, because watch is not seeing firebase update for some reason
    })
  }

  pzStart(pzIndex) {
    console.log('** start pz **')
    //set the status, round 1 and time of next round (if any)
    let timeNextRound = moment().tz('America/Los_Angeles')
    timeNextRound.add(propsPzs[pzIndex].rounds.roundSec, 's')
    let update = {
      status: 'active',
      round: 0,
      clock: 0,
      timeNextRound: (propsPzs[pzIndex].rounds.numOfRounds > 1) ? timeNextRound.format("kk:mm:ss") : '00:00:00'
    }
    firebase.database().ref('/pzs/' + pzIndex + '/players').once('value').then(function(snapshot){
      let totalScore = pzSettingsMap['genSettingsPz' + (pzIndex+1)]({
        players: snapshot.val()
      })
      update.totalScore = totalScore
      firebase.database().ref('/pzs/' + pzIndex).update(update)
    })
  }

  pzUpdateClock(pzIndex) {
    // TODO fix hack of forcing it to be 4
    let clock = (this.state.pzs[pzIndex].clock >= 4) ? 4 : this.state.pzs[pzIndex].clock + 1
    firebase.database().ref('/pzs/' + pzIndex).update({
      clock: clock
    })
  }

  pzNextRound(pzIndex) {
    //set the round # and time of next round (if any)
    let pz = this.state.pzs[pzIndex]
    let newRoundNum = pz.round + 1
    let finalRound = (newRoundNum >= propsPzs[pzIndex].rounds.numOfRounds - 1) ? true : false
    let timeNextRound = moment().tz('America/Los_Angeles')
    if(finalRound) {
      timeNextRound = moment(this.state.pzs[pzIndex].timeGameEnds, 'kk:mm:ss') // set the end of the round to the end of the game so the clock works
      newRoundNum = pz.round // roll back the round counter, since we are not addng a new round
    } else {
      timeNextRound.add(propsPzs[pzIndex].rounds.roundSec, 's')
    }
    let update = {
      round: newRoundNum,
      timeNextRound: timeNextRound.format("kk:mm:ss"),
      clock: 0
    }
    firebase.database().ref('/pzs/' + pzIndex).update(update)
  }

  pzEnd(pzIndex) {
    //set the status, reset players to empty
    let newTotalPlays = this.state.pzs[pzIndex].totalPlays + 1
    let newTotalPlayers = this.state.pzs[pzIndex].totalPlayers + this.state.pzs[pzIndex].players.length
    let update = {
      players: [],
      status: 'inactive',
      timeGameStarts: '00:00:00',
      timeGameEnds: '00:00:00',
      timeNextRound: '00:00:00',
      round: -1,
      clock: 0,
      totalPlays: newTotalPlays,
      totalPlayers: newTotalPlayers
    }
    firebase.database().ref('/pzs/' + pzIndex).update(update)
  }

  // -----------------------------------------------------------------
  // CALC
  // -----------------------------------------------------------------

  calcActiveLaunchTotalScore() {
    if (!this.state.activeLaunch || !this.state.activeLaunch.id) return
    let self = this
    let newScore = 0
    let oldScore = this.state.activeLaunch.totalScore || 0
    this.state.users.map((user,key) => {
      if(this.state.activeLaunch && (user.launchId == this.state.activeLaunch.id) && user.status == 'active') {
        user.pzs.map(pz => {
          newScore += pz.score
        })
      }
    })
    //console.log(this.state.activeLaunch.id, ' newScore:', newScore, ' - oldScore: ', oldScore);
    // this.setState({
    //   activeLaunch: {
    //     ...this.state.activeLaunch,
    //     totalScore: newScore
    //   }
    // })
    // check if mission complete?
    newScore = parseInt(newScore)
    if(newScore >= game.score.launch && this.state.launching === false) {
      this.setState({ launching: true })
      this.launchRocket(newScore)
    } else if(newScore > oldScore && this.state.launching === false) {
      firebase.database().ref('/launches/' + this.state.activeLaunch.id).update({
        totalScore: newScore
      }).then(function(){
        self.updateStateLaunchTotalScore(newScore)
        // if(newScore >= game.score.launch) {
        //   self.launchRocket(newScore)
        // }
      })
    }
  }

  launchRocket() {
    console.log('*** END GAME! launch rocket! ***')
    let self = this
    // get all active players
    let deactivateLaunchUsers = {}
    this.state.users.map( (user, key) => {
      let launchUser = {}
      if(user.launchId == this.state.activeLaunch.id) {
        launchUser = user
        launchUser.status = 'inactive'
        deactivateLaunchUsers[user.userID] = launchUser
        deactivateLaunchUsers[user.userID].userID = null
      }
    })
    // end current game
    firebase.database().ref('/launches/' + this.state.activeLaunch.id).update({
      status: 'complete',
      totalScore: game.score.launch
    }).then(function(){
      // deactivate current launch players
      firebase.database().ref('/users/').update(deactivateLaunchUsers).then(function(){
        // start new game
        self.newGame()
      })
    })
  }

  // -----------------------------------------------------------------
  // GET HTML
  // -----------------------------------------------------------------

  htmlActiveLaunch() {
    if(this.state.activeLaunch){
      return(
        <div className='row'>
          <div className='col'>
            Status: {this.state.activeLaunch.status}<br/>
            Start: {this.state.activeLaunch.start}<br/>
            End: {this.state.activeLaunch.end}<br/>
          </div>
          <div className='col'>
            Players: {this.state.activeLaunch.players}<br/>
            Total Score: {this.state.activeLaunch.totalScore} / {game.score.launch}<br/>
            Total Game Plays: {this.state.activeLaunch.totalGamePlays}<br/>
          </div>
        </div>
      )
    }
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

  htmlUsers(status) {
    let html = ''
    html = this.state.users.map( (user, key) => {
      if(user.status == status) {
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
                      Pz Code: {pz.code}<br/>
                      Pz Attempts: {pz.attempts}<br/>
                      Pz Max Score: {pz.score}<br/><br/>
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
      }
    })
    return html
  }

  htmlPzs() {
    let html = ''
    html = this.state.pzs.map( (pz, key) => {
      let pzIndex = propsPzs.findIndex(pzProp => pzProp.code === pz.code)
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
              Time next Round: {pz.timeNextRound}<br/>
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

  // -----------------------------------------------------------------
  // SET
  // -----------------------------------------------------------------

  newGame() {
    let self = this
    let newLaunch = schemaLaunch
    newLaunch.status = 'active'
    firebase.database().ref('/launches/').push(newLaunch, function(error) {
      console.log('*** New game started ***');
      self.updateStateLaunching(false)
    })
  }

  resetGame() {
    console.log(('*** Reset Game ***'))
    if(window.confirm('Are you sure? This will delete all Launches, Users and reset all Pzs')) {
      firebase.database().ref('/launches').remove()
      firebase.database().ref('/users').remove()
      this.resetPzs()
      this.newGame()
    }
  }

  resetPzs() {
    console.log('*** Reset Pzs ***');
    let pzs = []
    pzs = propsPzs.map( (pzProps, key) => {
      let pz = {
        name: '',
        code: '',
        players: [],
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
        rounds: {
          numOfRounds: 0,
          roundSec: 0
        },
        timeGameStarts: '00:00:00',
        timeGameEnds: '00:00:00',
        timeNextRound: '00:00:00',
        round: -1,
        clock: 0,
        totalPlays: 0,
        totalPlayers: 0,
        totalScore: 0
      }
      pz.name = pzProps.name
      pz.code = pzProps.code
      pz.location = pzProps.location
      pz.mapPos = pzProps.mapPos
      pz.status = 'inactive'
      pz.rounds.numOfRounds = pzProps.rounds.numOfRounds
      pz.rounds.roundSec = pzProps.rounds.roundSec
      return pz
    })
    firebase.database().ref('/pzs/').set(pzs)
  }

  render(){
    let test = ''
    return(
      <div id='component-mk'>
        <h1>Mission Kontrol</h1>
        <h3>{this.state.timeNow}</h3>
        <button onClick={() => this.newGame()} style={{display:'inline-block'}}>New Game</button>
        <button onClick={() => this.resetPzs()} style={{display:'inline-block'}}>Reset Pzs</button>
        <br/>
        <button onClick={() => this.resetGame() } style={{display:'inline-block', backgroundColor: 'rgba(255,0,0,.4)'}}>Reset Game</button>
        <button style={{display:'inline-block'}}>Start/Pause Game</button>
        <button style={{display:'inline-block'}}>Stop Game</button>

        <h2>Active Launch</h2>
        {this.htmlActiveLaunch()}

        <h2>Pzs</h2>
        {this.htmlPzs()}

        <h2>Past Launches</h2>
        {this.htmlPastLaunches('complete')}

        <h2>Active Users</h2>
        {this.htmlUsers('active')}

        <h2>Inactive Users</h2>
        {this.htmlUsers('inactive')}
      </div>
    )
  }
}

export default MK
