import React, { Component } from 'react'

import { staticPzs, staticLaunches, staticUsers } from '../../data/static.js'

class MK extends Component {

  getLaunchStatus(status) {
    let html = ''
    html = Object.keys(staticLaunches).map( (key, launchIndex) => {
      let launch = staticLaunches[launchIndex]
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

  getUsers() {
    let html = ''
    html = Object.keys(staticUsers).map( (userIndex, key) => {
      let user = staticUsers[userIndex]
      return (
        <div key={key} className='row'>
          <div className='col'>
            Name: {user.name}<br/>
            Job: {user.job}<br/>
            Status: {user.status}<br/>
            Time Last Checkin: {user.timeLastCheckin}<br/>
            IP: {user.ip}<br/>
            Agent: {user.agent}<br/>
            Location: {user.loc.lat}, {user.loc.long}<br/>
            <button>Block User IP</button>
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

          </div>
        </div>
      )
    })
    return html
  }

  getPzs() {
    let html = ''
    html = Object.keys(staticPzs).map( (key, pzIndex) => {
      let pz = staticPzs[pzIndex]
      return (
        <div key={key} className='row'>
          <div className='col'>
            Name: {pz.name}<br/>
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
      )
    })
    return html
  }

  render(){
    return(
      <div id='mk'>
        <h1>Mission Kontrol</h1>

        <h2>Active Launch</h2>
        {this.getLaunchStatus('active')}

        <h2>Pzs</h2>
        {this.getPzs()}

        <h2>Launches</h2>
        {this.getLaunchStatus('inactive')}

        <h2>Users</h2>
        {this.getUsers()}
      </div>
    )
  }
}

export default MK
