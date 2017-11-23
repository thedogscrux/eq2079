import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'

import { shuffleArray, testIfEqualArrays } from '../../../utils/Common.js'
import Score, { calcMaxScore, calcHintCost } from '../../../utils/Score.js'
import game from '../../../Settings.js'
import { propsPzs } from '../../../data/propsPzs.js'
import Hints from '../../Hints.js'

import imageA00 from './images/imageA00.svg'

const PZ_INDEX = 8
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

class Pz9 extends Component {
  constructor(props){
    super(props)
    let score = new Score(PZ_INDEX)
    let baseState = {
      round: props.round,
      user: props.user,
      clock: props.clock,
      valid: false,
      hints: props.user.pzs[PZ_INDEX].hints,
      userKey: -1,
      render: false,
      score: {
        max: score.calcMaxScore(props.user.pzs[PZ_INDEX].hints, 1),
        multi: 0 * game.score.mutliplayerMultiplier,
        hintCost: score.calcHintCost(PZ_INDEX),
        round: 0,
        total: 0
      }
    }
    this.state = {
      ...baseState,
      board: {
        table: [
          [ 0, 1, 0, 1 ],
          [ 0, 1, 1, 1 ],
          [ 1, 1, 1, 1 ]
        ]
      },
      rounds: [
        {
          table: [ ],
          solution: [ ],
          users: [
            {
              index: 0,
              userId: '',
              valid: false
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
    this.unwatchDB()
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

  updateStatePz(pzBoard) {
    let newTable = pzBoard.rounds[this.state.round].table
    if (newTable != this.state.board.table) {
      this.setState({
        board: {
          ...this.state.board,
          table: newTable
        }
      })
      if(this.state.userKey === -1) return
      // UPDATE SCORE: by checking if all my items are in the correct position
        let switchGroups = newTable
        let myIndexes =  this.state.rounds[this.state.round].users[this.state.userKey].indexes
        // loop thru all my  items, then loop thru all items on table to check
        let allMySwitchesValid = true
        for(var i=0; i<=switchGroups.length-1; i++) {
          for(var j=0; j<=switchGroups[i].length-1; j++) {
            if(myIndexes.indexOf(j) >= 0 && newTable[i][j] === false) {
              allMySwitchesValid = false
            }
          }
        }
        // if all my items are valid, give me the round points
        let newRoundScore = 0
        if (allMySwitchesValid) {
          newRoundScore = (game.score.round < this.state.score.max) ? game.score.round : this.state.score.max
        }
        this.setState({
          score: {
            ...this.state.score,
            round: newRoundScore
          }
        })
    }
  }

  updateStateScore() {
    let newTotalScore = this.state.score.total + this.state.score.round
    // user cant score higher than max
    newTotalScore = (newTotalScore < this.state.score.max) ? newTotalScore : this.state.score.max
    this.setState({
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
    console.log('* build board *');
    let userId = this.props.user.id
    let roundKey = (round) ? round : this.state.round
    if(!this.state.rounds[roundKey]) return
    let table = this.state.rounds[roundKey].table
    this.setState({
      board: {
        ...this.state.board,
        table: table
      }
    })
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
      userKey: userKey,
      render: true
    })
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

  toggleSwitch(updateSwitchGroupKey, mySwitchKey) {
    // add the item to the table and get points
    let self = this
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/'
    let newTable = this.state.board.table || []
    let solution = this.state.rounds[this.state.round].solution
    let myIndexes =  this.state.rounds[this.state.round].users[this.state.userKey].indexes
    let switchGroups = this.state.board.table
    let switchGroup = switchGroups[updateSwitchGroupKey]

    // toggle each of my indexes
    let newSwitchGroup = switchGroup.map( (switchControl, switchKey) => {
      let newSwitchControl = switchGroup[switchKey]
      if (switchKey === mySwitchKey || switchKey === mySwitchKey-1 || switchKey === mySwitchKey+1) {
        // toggle my switch and adjacent switches as well
        newSwitchControl = !newSwitchControl
      }
      return newSwitchControl
    })

    // update the table
    newTable[updateSwitchGroupKey] = newSwitchGroup

    // UPDATE SCORE: by checking if all my items are in the correct position
      // loop thru all my  items, then loop thru all items on table to check
      let allMySwitchesValid = true
      let tableValid = true
      for(var i=0; i<=switchGroups.length-1; i++) {
        for(var j=0; j<=switchGroup.length-1; j++) {
          // check if my switches are valid
          if(j === mySwitchKey && newTable[i][j] === false) {
            allMySwitchesValid = false
          }
          // check if entire table is valid
          if(newTable[i][j] === false) {
            tableValid = false
          }
        }
      }
      // if all my items are valid, give me the round points
      let newRoundScore = 0
      if (allMySwitchesValid) {
        newRoundScore = (game.score.round < this.state.score.max) ? game.score.round : this.state.score.max
      }
      this.setState({
        score: {
          ...this.state.score,
          round: newRoundScore
        }
      })

    // update the table on the dbase
    firebase.database().ref(refRound).update({
      table: newTable
    }).then(function(){
      // if table is valid, end the round
      if(tableValid) {
        self.endRound()
      }
    })
  }

  render(){

    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)

    let htmlSwitchGroups = ''

    if(this.state.render) {
      let myIndexes =  this.state.rounds[this.state.round].users[this.state.userKey].indexes
      // get the user switches
      htmlSwitchGroups = this.state.board.table.map( (switchGroup, switchGroupKey) => {
        let htmlSwitches = switchGroup.map( (switchControl, switchKey) => {
          // TODO only show my switches indexOf
          if (myIndexes.indexOf(switchKey) === -1) return
          let className = (switchControl) ? 'on' : 'off'
          return (
            <div key={switchKey} className={'switch ' + className}>
              <button onClick={() => this.toggleSwitch(switchGroupKey, switchKey)}>{switchKey}</button>
            </div>
          )
        })
        return (<div key={switchGroupKey} className='switch-group'>{htmlSwitches}</div>)
      })

    }

    return(
      <div id="switch-board-wrapper" className='component-wrapper'>
        {htmlScore}
        <Hints
          hints={HINTS}
          hintsCount={this.state.hints}
          userAttempts={this.props.user.pzs[PZ_INDEX].attempts}
          getHint={() => this.getHint()}
        />

        <img src={this.state.clock} width="50px" />

        <div className='switch-groups-wrapper'>{htmlSwitchGroups}</div>
      </div>
    )
  }
}

// FUNCS

const genSettingsPz9 = (props) => {
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed())
  // setup each user for each round
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
    // ADD USERS to pz - create an empty obj for each user
    let settingsUsers = []
    props.players.forEach( (user, key) => {
      settingsUsers.push(
        {
          userId: user,
          valid: false,
          indexes: []
        }
      )
    })
    // settings = rounds[#][users][#] (without user data)
    // SHUFFLE ITEMS and determine solution
    // SETUP TABLE
    let table = []
    let numOfSwitches = (settingsUsers.length <= 2) ? 2 : settingsUsers.length-1
    let startingSwitch = random.integer(0, numOfSwitches)
    let numOfSwitchGroups = 1
    if(round < 1) {
      numOfSwitchGroups = 1
    } else if (round < 2) {
      numOfSwitchGroups = 2
    } else {
      numOfSwitchGroups = 3
    }
    for(var i=1; i<=numOfSwitchGroups; i++) {
      table.push([])
      for(var j=0; j<=numOfSwitches; j++) {
        table[i-1].push((j === startingSwitch) ? true : false)
      }
    }
    // DEAL ITEMS to users
    let userIndex = 0
    for(var i=0; i<=numOfSwitches; i++) {
      settingsUsers[userIndex].indexes.push(i)
      userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
    }
    // STORE settings
    settings.push({
      users: settingsUsers,
      table: table
    })

  }
  // calc total score
  let totalScore = 0
  // store all info in dbase
  firebase.database().ref('/boards/' + PZ_PROPS.code).set({
    rounds: settings
  })
  //return settings
  return totalScore
}

  export default Pz9

export {
  genSettingsPz9
}
