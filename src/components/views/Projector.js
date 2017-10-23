import React, { Component } from 'react'

import { staticLaunches, staticUsers } from '../../data/static.js'

class Projector extends Component {

  getLaunchStatus() {
    let html = ''
    let launch = staticLaunches.filter( launch => launch.status === 'active')
    launch = launch[0]
    return(
      <div>
        Start: {launch.start}<br/>
        Players: {launch.players}<br/>
        Total Score: {launch.totalScore}<br/>
      </div>
    )
  }

  getPastLaunches() {
    let html = ''
    html = staticLaunches.filter( launch => launch.status == 'inactive').map( (launch, key) => {
      return (
        <div key={key}>
          End: {launch.end}<br/>
          Players: {launch.players}<br/><br/>
        </div>
      )
    })
    return html
  }

  getUsers() {
    let html = ''
    // build array of active users
    let users = staticUsers.filter( user => user.status == 'active').map( (user,key) => {
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
        {this.getUsers()}

        <h2>Past Launches</h2>
        {this.getPastLaunches()}
      </div>
    )
  }
}

export default Projector
