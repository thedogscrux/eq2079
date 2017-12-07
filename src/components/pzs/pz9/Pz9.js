import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'

import AI from '../../AI'

import { shuffleArray, testIfEqualArrays } from '../../../utils/Common.js'
import Score, { calcMaxScore, calcHintCost } from '../../../utils/Score.js'
import game from '../../../Settings.js'
import { propsPzs } from '../../../data/propsPzs.js'
import Hints from '../../Hints.js'

import imageA00 from './images/imageA00.svg'

import toggle0 from './images/toggle-0.jpg'
import toggle1 from './images/toggle-1.jpg'
import knob0 from './images/knob-0.jpg'
import knob1 from './images/knob-1.jpg'
import slider0 from './images/slider-0.jpg'
import slider1 from './images/slider-1.jpg'
import dialB0 from './images/dialB-0.jpg'
import dialB1 from './images/dialB-1.jpg'
import dialC0 from './images/dialC-0.jpg'
import dialC1 from './images/dialC-1.jpg'
import knobB0 from './images/knobB-0.jpg'
import knobB1 from './images/knobB-1.jpg'
import button0 from './images/button-0.jpg'
import button1 from './images/button-1.jpg'

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

const CONTROL_STYLES = [
  'toggle', 'knob', 'slider', 'dialB', 'dialC', 'knobB', 'button'
]

const CONTROL_IMAGE_MAP = new Map([
    [ 'toggle0', toggle0 ],
    [ 'toggle1', toggle1 ],
    [ 'knob0', knob0 ],
    [ 'knob1', knob1 ],
    [ 'slider0', slider0 ],
    [ 'slider1', slider1 ],
    [ 'dialB0', dialB0 ],
    [ 'dialB1', dialB1 ],
    [ 'dialC0', dialC0 ],
    [ 'dialC1', dialC1 ],
    [ 'knobB0', knobB0 ],
    [ 'knobB1', knobB1 ],
    [ 'button0', button0 ],
    [ 'button1', button1 ],
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
      aiStrength: props.user.ai.strength,
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
          controlStyles: [ ],
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

  cancelGame() {
    this.props.endRound(true)
  }

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

  render() {

    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)

    let htmlSwitchGroups = ''

    if(this.state.render) {
      let myIndexes =  this.state.rounds[this.state.round].users[this.state.userKey].indexes

      // show images either randomly or based on index
      let controlImageIndex = 0
      // get the user switches
      htmlSwitchGroups = this.state.board.table.map( (switchGroup, switchGroupKey) => {
        let imgType = CONTROL_STYLES[ this.state.rounds[this.state.round].controlStyles[switchGroupKey] ]

        let htmlSwitches = switchGroup.map( (switchControl, switchKey) => {
          // TODO only show my switches indexOf
          if (myIndexes.indexOf(switchKey) === -1) return
          let className = (switchControl) ? 'on' : 'off'
          let img = CONTROL_IMAGE_MAP.get(imgType + ((switchControl) ? '1' : '0') )
          let css = { backgroundImage: `url(${img})` }
          return (
            <div key={switchKey} className={'switch ' + className} style={css}>
              <button onClick={() => this.toggleSwitch(switchGroupKey, switchKey)}>
                { (this.state.hints > 1) ? <div className='hint-text'>{(switchControl) ? 'ON' : 'OFF'}</div> : '' }
              </button>
            </div>
          )
        })
        controlImageIndex = controlImageIndex + 1
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
        <button onClick={() => this.cancelGame()} className='cancel-button'>cancel game</button>

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
    let numOfSwitches = 0
    if(round === 0) {


    } else {

    }
    let startingSwitch = random.integer(0, numOfSwitches)
    let numOfSwitchGroups = 1

    if(round < 1) {
      numOfSwitchGroups = 1
      numOfSwitches = (settingsUsers.length <= 2) ? 4 : settingsUsers.length
      if (settingsUsers.length === 1) numOfSwitches = 3
    } else if (round < 2) {
      numOfSwitchGroups = 2
      numOfSwitches = (settingsUsers.length <= 2) ? 4 : settingsUsers.length
      if (settingsUsers.length === 1) numOfSwitches = 4
    } else {
      numOfSwitchGroups = 3
      numOfSwitches = settingsUsers.length * 2
      if (settingsUsers.length === 1) numOfSwitches = 5
    }
    for(var i=1; i<=numOfSwitchGroups; i++) {
      table.push([])
      for(var j=0; j<=numOfSwitches-1; j++) {
        table[i-1].push((j === startingSwitch) ? true : false)
      }
    }

    // DEAL ITEMS to users
    let userIndex = 0
    for(var i=0; i<=numOfSwitches-1; i++) {
      settingsUsers[userIndex].indexes.push(i)
      userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
    }

    // SET CONTROL STYLES
    let controlStyles = []
    for(var i=0; i<=numOfSwitchGroups-1;) {
      let styleKey = random.integer(0, CONTROL_STYLES.length-1)
      if (controlStyles.indexOf(styleKey) === -1) {
        // dont use the same control style more than once
        controlStyles.push(styleKey)
        i++
      }
    }

    // STORE settings
    settings.push({
      users: settingsUsers,
      table: table,
      controlStyles: controlStyles
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
