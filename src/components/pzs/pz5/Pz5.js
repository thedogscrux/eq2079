import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'
import _ from 'underscore'

import { shuffleArray, testIfEqualArrays, removeArrayKey } from '../../../utils/Common.js'
import Score, { calcMaxScore, calcHintCost } from '../../../utils/Score.js'
import game from '../../../Settings.js'
import { propsPzs } from '../../../data/propsPzs.js'

import imageA00 from './images/imageA00.svg'

const PZ_INDEX = 4
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

const GRID_X = 5
const GRID_Y = 50

const BLACK = [0, 0, 0]
const RED = [255, 0, 0]
const GREEN = [0, 255, 0]
const BLUE = [0, 0, 255]

const YELLOW = [255, 255, 0] // RED + GREEN

const ORANGE = [255, 165, 0]

const COLOR_MAP = [
  BLACK,
  RED,
  GREEN,
  BLUE
]

class Pz5 extends Component {
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
          table: [
            {
              users: [],
              user: '',
              color: [0,0,0],
              x: 0,
              y: 0
            }
          ],
          myItems: 0,
          myColor: 0
        },
        rounds: [
          {
            solution: [
              {
                color: [0,0,0],
                x: 0,
                y: 0
              }
            ],
            users: [
              {
                userId: '',
                items: 0,
                color: [0,0,0]
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
        clock: nextProps.clock
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
    let tableNew = pzBoard.rounds[this.state.round].table
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
    console.log('* build board *');
    let userItems = 0
    let userId = this.props.user.id
    let roundKey = (round) ? round : this.state.round
    if(!this.state.rounds[roundKey]) return
    let roundUser = this.state.rounds[roundKey].users.filter( user => user.userId == userId )
    this.setState({
      board: {
        ...this.state.board,
        myItems: roundUser[0].items,
        myColor: roundUser[0].color,
        table: []
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

  addItemToTable(x, y) {
    // add the spot to the table and get points
    let self = this
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/'
    let newTable = this.state.board.table || []
    let newColor = Object.assign([], this.state.board.myColor)
    let newUsers = [ this.props.user.id ]
    let solution = this.state.rounds[this.state.round].solution
    let existingItemTableKey = -1
    let existingUsers = 0

    // check if user has any items left, if they dont, remove the first one
    let removeKey = -1
    let userItemsCount = 0
    newTable.map((item,key) => {
      item.users.map( (user, key) => {
        if(removeKey === -1 && item.userId === this.props.user.id) removeKey = key
        if(user === this.props.user.id) userItemsCount++
      })
    })
    if (userItemsCount > this.state.board.myItems-1) newTable.splice(removeKey, 1)

    // check if someone else has their item at point
    if(this.state.board.table) {
      existingUsers = this.state.board.table.filter( (item,key) => {
        if (item.x === x && item.y === y) existingItemTableKey = key
        return item.x === x && item.y === y
      })
    }

    if (existingUsers.length >= 1) {
      // add curent user to  existing users on point
      newUsers =  Object.assign([], this.state.board.table[existingItemTableKey].users)
      newUsers.push(this.props.user.id)
      // set the color of the point
      existingUsers.forEach( (user,key) => {
        newColor[0] = newColor[0] + user.color[0]
        newColor[1] = newColor[1] + user.color[1]
        newColor[2] = newColor[2] + user.color[2]
      })
      // overwrite existing item in table
      newTable[existingItemTableKey] = {
        users: newUsers,
        userId: 'this.props.user.id',
        color: newColor,
        x: x,
        y: y
      }
    } else {
      // append item to table
      newTable.push({
        users: newUsers,
        userId: 'this.props.user.id',
        color: newColor,
        x: x,
        y: y
      })
    }

    let lastItemPlaced = (newTable.length == solution.length) ? true : false

    // UPDATE SCORE: by checking if all my tiles are in the correct position
      // loop thru all my  tiles, then loop thru all tiles on table to check
      let allMyItemsValid = true
      // TODO...

    // update the table on the dbase
    firebase.database().ref(refRound).update({
      table: newTable
    }).then(function(){
      // check if table is valid, if so, end the round
      if(lastItemPlaced) {
        firebase.database().ref(refRound).once('value').then(function(snapshot) {
          // setup table for testing
          let minifiedTable = snapshot.val().table.map( (item, key) => String(item.x) + String(item.y) + '-' + item.color[0] + '-' + item.color[1] + '-' + item.color[2])
          let minifiedSolution = snapshot.val().solution.map( (item, key) => String(item.x) + String(item.y) + '-' + item.color[0] + '-' + item.color[1] + '-' + item.color[2])
          if(testIfEqualArrays(minifiedTable.sort(), minifiedSolution.sort())) {
            self.endRound()
          }
        })
      }
    })
  }

  removeItemFromTable(removeKey) {
    let self = this
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/'
    let newTable = Object.assign([], this.state.board.table)
    let solution = this.state.rounds[this.state.round].solution
    if(newTable[removeKey].users.length > 1) {
      let newItem = newTable[removeKey]
      // remove my colors
      newItem.color[0] = newItem.color[0] - this.state.board.myColor[0]
      newItem.color[1] = newItem.color[1] - this.state.board.myColor[1]
      newItem.color[2] = newItem.color[2] - this.state.board.myColor[2]
      // remove myself from item
      let myUserKey = newItem.users.indexOf(this.props.user.id);
      newItem.users.splice(myUserKey, 1)
    } else {
      // remove item
      newTable.splice(removeKey, 1)
    }
    this.setState({
      board: {
        ...this.state.board,
        table: newTable
      }
    })
    let lastItemPlaced = (newTable.length == solution.length) ? true : false
    firebase.database().ref(refRound).update({
      table: newTable
    }).then(function(){
      // check if table is valid, if so, end the round
      if(lastItemPlaced) {
        firebase.database().ref(refRound).once('value').then(function(snapshot) {
          // setup table for testing
          let minifiedTable = snapshot.val().table.map( (item, key) => String(item.x) + String(item.y) + '-' + item.color[0] + '-' + item.color[1] + '-' + item.color[2])
          let minifiedSolution = snapshot.val().solution.map( (item, key) => String(item.x) + String(item.y) + '-' + item.color[0] + '-' + item.color[1] + '-' + item.color[2])
          if(testIfEqualArrays(minifiedTable.sort(), minifiedSolution.sort())) {
            self.endRound()
          }
        })
      }
    })

  }

  render(){
    // build an array of empty rows/cols
    let htmlRows = []
    for(var y=0; y<=GRID_Y; y++) {
      let cols = []
      for(var x=0; x<=GRID_X; x++) {
        cols.push('')
      }
      htmlRows.push(cols)
    }

    // insert buttons in each row/col cell
    let htmlButtons = htmlRows.map( (row, y) => {
      let innerHtml = row.map((col,x) => {
        // if spot is selected, style it
        let css = {}
        let classNames = ''
        let myItem = false
        let teamItem = false
        let itemTableKey = 0
        let userId = this.props.user.id

        if(this.state.board.table && this.state.board.table.length >= 1){
          // loop thru all items on table
          this.state.board.table.map( (item, key) => {
            if(item.x === x && item.y === y) {
              classNames = 'active'
              css.backgroundColor = 'rgba(' + item.color[0] + ',' + item.color[1] + ',' + item.color[2] + ', .8)'
              // see if i am in this item's user list
              let myUserKey = item.users.indexOf(userId);
              if(myUserKey > -1) {
                myItem = true
                itemTableKey = key
              } else {
                teamItem = true
                itemTableKey = key
              }
            }

          })
        }

        if(myItem) {
          return (
            <div key={'col-'+y+x} className='cols' >
              <button onClick={() => this.removeItemFromTable(itemTableKey)} className={classNames} style={css}>
                [{itemTableKey}]{x},{y}
              </button>
            </div>
          )
        } else if(teamItem) {
          return (
            <div key={'col-'+y+x} className='cols' >
              <button onClick={() => this.addItemToTable(x, y)} style={css}>
                [{itemTableKey}]{x},{y}
              </button>
            </div>
          )
        } else {
          return (
            <div key={'col-'+y+x} className='cols' >
              <button onClick={() => this.addItemToTable(x, y)} style={css}>{x},{y}</button>
            </div>
          )
        }
      })

      return(
        <div key={'row-'+y} className='rows'>{innerHtml}</div>
      )
    })

    return(
      <div id="spots-board-wrapper" className='component-wrapper'>
        <img src={this.state.clock} width="50px" />
        <div id='spots-wrapper'>{htmlButtons}</div>
      </div>
    )
  }
}

// FUNCS

const genSettingsPz5 = (props) => {
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed())
  // SHUFFLE ITEMS and determine solution
  let solutionColors = []
  let solution = []
  if(props.players.length === 1) {
    solutionColors = [ BLACK ]
    solution = [
      [
        { x:0, y:0, color:BLACK },
        { x:1, y:0, color:BLACK },
        { x:2, y:0, color:BLACK },
        { x:3, y:0, color:BLACK },
        { x:4, y:0, color:BLACK },
        { x:5, y:0, color:BLACK }
      ],
      [
        { x:0, y:0, color:BLACK },
        { x:1, y:0, color:BLACK },
        { x:2, y:0, color:BLACK },
        { x:0, y:1, color:BLACK },
        { x:1, y:1, color:BLACK },
        { x:2, y:1, color:BLACK }
      ]
    ]
  } else if (props.players.length === 2) {
    solutionColors = [ RED, GREEN ]
    solution = [
      [
        { x:0, y:0, color:RED },
        { x:1, y:0, color:RED },
        { x:2, y:0, color:GREEN },
        { x:3, y:0, color:GREEN },
        { x:4, y:0, color:YELLOW },
        { x:5, y:0, color:YELLOW }
      ],
      [
        { x:0, y:1, color:RED },
        { x:1, y:1, color:RED },
        { x:2, y:1, color:GREEN },
        { x:3, y:1, color:GREEN },
        { x:4, y:1, color:YELLOW },
        { x:5, y:1, color:YELLOW }
      ],
    ]
  }
  // setup each user for each round
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
    // ADD USERS to pz - create an empty obj for each user
    let settingsUsers = []
    props.players.forEach( (user,key) => {
      settingsUsers.push(
        {
          userId: user,
          items: solution[round].length,
          color: 0
        }
      )
    })
    // settings = rounds[#][users][#] (without user data)
    // DEAL colors to users
    let userIndex = 0
    solutionColors.forEach((color, key) => {
      settingsUsers[userIndex].color = color
      userIndex ++
    })
    // settings = rounds[#][users][#] (with user data)
    // STORE settings
    settings.push({
      users: settingsUsers,
      table: [],
      solution: solution[round]
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

export default Pz5

export {
  genSettingsPz5
}
