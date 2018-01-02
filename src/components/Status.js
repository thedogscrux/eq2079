import React, { Component } from 'react'
import { connect } from 'react-redux'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { staticLaunches } from '../data/static.js'
import game from '../Settings.js'
import { propsPzs } from '../data/propsPzs.js'

const mapStateToProps = (state, ownProps) => {
  return {
    debug: state.admin.debug,
    userPzs: state.user.pzs
  }
}

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

  componentWillUnmount() {
    this.unwatchDB()
  }

  // GET

  unwatchDB() {
    firebase.database().ref('/launches/').off()
  }

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
    return(
      <div>
        <br/>Launch Status: {this.state.launch.totalScore}/{game.score.launch}
        <br/>You can see a video of the shuttle being build projected in the street on the factory.
      </div>
    )
  }

  render(){

    // calc my total score
    let pzScores = this.props.userPzs.map(pz => pz.score)
    let myTotalScore = pzScores.reduce((total, score) => total + score)

    // calc total launc score
    let totalPossibleUserScore = (game.score.flat) ? game.score.pz * propsPzs.length : ''

    // admin stuff
    let admin = ''
    if (this.props.debug) {
      admin = <div>
        Status: {this.state.launch.status}<br/>
        Start: {this.state.launch.start}<br/>
        End: {this.state.launch.end}<br/>
        Players: {this.state.launch.players}<br/>
        Total Score: {this.state.launch.totalScore}<br/>
        Total Game Plays: {this.state.launch.totalGamePlays}<br/>
      </div>
    }

    return(
      <div id='component-status' className='component-wrapper'>
        My Score: {myTotalScore}/{totalPossibleUserScore}<br/>
        {this.getLaunchStatus()}
        {admin}
      </div>
    )
  }
}

const StatusContainer = connect(
  mapStateToProps
)(Status)

export default StatusContainer
