import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'

import { shuffleArray, testIfEqualArrays } from '../../../utils/Common.js'
import Score, { calcMaxScore, calcHintCost } from '../../../utils/Score.js'
import game from '../../../Settings.js'
import { propsPzs } from '../../../data/propsPzs.js'

import imageA00 from './images/imageA00.svg'

const PZ_INDEX = 0
const PZ_PROPS = propsPzs[PZ_INDEX]

const HINTS = [
  {
    title: 'Hint One',
    body: '...'
  },
  {
    title: 'Hint Two',
    subTitle: 'Subtitle',
    body: '...'
  }
]

const IMAGE_MAP = new Map([
    [ 'imageA00', imageA00 ]
]);

  class Pz0 extends Component {
    constructor(props){
      super(props)
      let score = new Score(PZ_INDEX)
      let baseSate = {
        round: props.round,
        user: props.user,
        clock: props.clock,
        valid: false,
        hints: props.user.pzs[PZ_INDEX].hints,
        score: {
          max: score.calcMaxScore(props.user.pzs[PZ_INDEX].hints, 1),
          multi: 0 * game.score.mutliplayerMultiplier,
          hintCost: score.calcHintCost(PZ_INDEX),
          round: 0,
          total: 0
        }
      }
      this.state = {
        userKey: -1,
        ...baseSate,
        board: {
          table: [ 2, 1, 0 ],
          myTiles: [
            {
              value: 'A00'
            }
          ],
        },
        rounds: [
          {
            table: [ 2, 1, 0 ],
            solution: [ 0, 1, 2 ],
            users: [
              {
                tiles: [ 0, 2 ],
                userId: ''
              }
            ]
          }
        ]
      }

    }

  // LIFECYCLE

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      if (this.props.round != nextProps.round) {
        this.updateStateScore()
        this.buildStateBoard(nextProps.round)
      }
      this.setState({
        round: nextProps.round,
        clock: nextProps.clock,
      })
    }
  }

  componentWillMount() {
    this.getSettings()
    this.watchDB()
  }

  componentWillUnmount() {
    let self = this
    let score = this.endGame()
    firebase.database().ref('/pzs/' + PZ_INDEX + '/status').once('value').then(function(snapshot){
      if(snapshot.val() === 'inactive') self.props.endGame(score)
    })
  }

  // WATCH DB

  unwatchDB() {
    firebase.database().ref('/boards/' +  PZ_PROPS.code).off()
  }

  watchDB() {
    var self = this
    firebase.database().ref('/boards/' +  PZ_PROPS.code).on('value', function(snapshot){
      self.updateStatePz(snapshot.val())
    })
  }

  updateStatePz(value) {
    let tableNew = value.rounds[this.state.round].table
    if (tableNew != this.state.board.table) {
      this.setState({
        board: {
          ...this.state.board,
          table: tableNew
        }
      })
    }
  }

  updateStateScore() {
    let newTotalScore = this.state.score.total + this.state.score.round
    // user cant score higher than max
    newTotalScore = (newTotalScore < this.state.score.max) ? newTotalScore : this.state.score.max
    this.setState({
      ...this.state,
      score: {
        ...this.state.score,
        total: newTotalScore
      }
    })
  }

  // SETUP BOARD

  getSettings() {
    var self = this
    let once = firebase.database().ref('/boards/' + PZ_PROPS.code).once('value').then(function(snapshot){
      if(!self._ismounted) {
        self.setStateRounds(snapshot.val())
        self.buildStateBoard()
        self.getMyUserKey()
      }
      return
    })
    return
  }

  setStateRounds(settings){
    if(!this._ismounted) {
      this.setState({
        rounds: settings.rounds
      })
    }
  }

  buildStateBoard(round) {
    // build board
    // make user has everything they need
    // table can be updated with a watch
    console.log('* build board *');
    // pz2 - loop thru all user assigned tiles and add them to state. a table is updated with a db watch
  }

  getMyUserKey() {
    // loop thru all users in round to find me
    let userKey = -1
    let userId = this.props.user.id
    this.state.rounds[this.state.round].users.filter((user,key) => {
      if (user.userId == userId) userKey = key
      return
    })
    this.setState({
      userKey: userKey
    })
  }

  getMyItemPos() {
    // might need if you have mutliple positions
  }

  // END GAME

  endRound() {
    this.props.endRound()
  }

  endGame(){
    let newTotalScore = this.state.score.round + this.state.score.total
    newTotalScore = (newTotalScore < this.state.score.max) ? newTotalScore : this.state.score.max
    // calc user score (final score calculated in Pz parent)
    return newTotalScore
  }

  // HINT

  getHint() {
    console.log(' ** GET HINT ** ');
    let hint = HINTS[this.state.hints]
    let newHintCount = this.state.hints + 1
    // update user max score
    let score = new Score(PZ_INDEX)
    let newMaxScore = score.calcMaxScore(newHintCount, this.props.numOfUsers)
    this.setState({
      ...this.state,
      hints: newHintCount,
      score: {
        ...this.state.score,
        max: newMaxScore
      }
    })
    firebase.database().ref('/users/' + this.props.user.id + '/pzs/' + PZ_INDEX).update({
      hints: newHintCount
    })
  }

  // GUESS

  guess() {
    // pz2 has a shared array that gets udpated when each user contributes a tile
    let points = this.state.points + 1
    this.setState({
      points: points
    })
  }

  render(){
    return(
      <div id="xxx-board-wrapper" className='component-wrapper'>
        Pz Zero
        <button onClick={() => this.guess()}>Guess</button>
      </div>
    )
  }
}

// FUNCS

const genSettingsPz0 = (props) => {
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed())
  // setup each user for each round
  for(let round=0; round<pzProps.rounds.numOfRounds; round++){
    // ADD USERS to pz - create an empty obj for each user
    let settingsUsers = []
    props.players.forEach( (user,key) => {
      settingsUsers.push(
        {
          userId: user,
          valid: false,
          items: []
        }
      )
    })
    // settings = rounds[#][users][#] (without user data)
    // SHUFFLE ITEMS and determine solution
    // pz4
    let solutions = [
      [ 1, 1, 2, 2, 3, 3 ],
      [ 1, 2, 3, 1, 2, 3 ]
    ]
    let solution = solutions[round]
    let shuffledItems = shuffle([0, 1, 2, 3, 4, 5])
    // pz2
    let solution = [
      ['A00', 'A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08' ],
      ['B00', 'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08' ]
    ]
    let shuffledItems = shuffleArray(solution[round])
    // DEAL ITEMS to users
    let userIndex = 0
    // pz4
    shuffledItems.forEach(index => {
        settingsUsers[userIndex].items.push({
          index: shuffledItems[index],
          solution: solution[shuffledItems[index]]
        })
        userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
    })
    // pz2
    shuffledItems.forEach((index, key) => {
        settingsUsers[userIndex].tiles.push(shuffledItems[key])
        userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
    })
    // settings = rounds[#][users][#] (with user data)
    // STORE settings
    // pz4
    settings.push({
      users: settingsUsers
    })
    // pz2
    settings.push({
      users: settingsUsers,
      table: [],
      solution: solution[round]
    })
  }
  // calc total score
  let totalScore = 0
  // store all info in dbase
  firebase.database().ref('/boards/' + pzProps.code).set({
    rounds: settings
  })
  //return settings
  return totalScore
}

export default Pz0

export {
  genSettingsPz0
}
