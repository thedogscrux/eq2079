import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'
import _ from 'underscore'
import ryb2rgb from 'ryb2rgb'

import { shuffleArray, testIfEqualArrays, removeArrayKey } from '../../../utils/Common.js'
import Score, { calcMaxScore, calcHintCost } from '../../../utils/Score.js'
import game from '../../../Settings.js'
import { propsPzs } from '../../../data/propsPzs.js'
import Hints from '../../Hints.js'

import AI from '../../AI'

const PZ_INDEX = 4
const PZ_PROPS = propsPzs[PZ_INDEX]

const HINTS = [
  {
    title: 'Hint One',
    body: 'Use the pattern that matches your letter and work together to create new colors.'
  },
  {
    title: 'Hint Two',
    body: 'Red + Yellow = Orange, Yellow + Blue = Green, Blue + Red = Purple'
  }
]

const SOLUTION_KEYS = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I' ]

const GRID_X = 5
const GRID_Y = 50

// const BLACK = [0, 0, 0]
// const RED = [255, 0, 0]
// const GREEN = [0, 255, 0]
// const BLUE = [0, 0, 255]
//
// const YELLOW = [255, 255, 0] // RED + GREEN
//
// const ORANGE = [255, 165, 0]

const BLACK = [0, 0, 0]
const RED = [255, 0, 0]
const YELLOW = [0, 255, 0]
const BLUE = [0, 0, 255]

const ORANGE = [255, 255, 0] // RED + YELLOW
const GREEN = [0, 255, 255]
const PURPLE = [255, 0, 255]

let rgbBlue = ryb2rgb([0, 0, 255])

const COLOR_MAP = [
  BLACK,
  RED,
  YELLOW,
  BLUE
]

class Pz5 extends Component {
    constructor(props){
      super(props)
      let score = new Score(PZ_INDEX)
      let baseState = {
        round: props.round,
        user: props.user,
        clock: props.clock,
        valid: false,
        hints: props.user.pzs[PZ_INDEX].hints,
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
        userKey: -1,
        ...baseState,
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
                color: [0,0,0],
                solutionItemCount: []
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
    let userItemsCount = 1

    // check if user has any items left, if they dont, remove the first one
    let removeKey = -1
    newTable.map((item,key) => {
      item.users.map( (user, key) => {
        if(removeKey === -1 && item.userId === this.props.user.id) removeKey = key
        if(user === this.props.user.id) userItemsCount++
      })
    })
    if (userItemsCount > this.state.board.myItems) newTable.splice(removeKey, 1)

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

    // UPDATE SCORE: by checking if all my needed items are on the table
      let allMyItemsValid = true
      // if its equal to the number of items a user needs for solution, give em the points
      allMyItemsValid = (userItemsCount === this.state.rounds[this.state.round].users[this.state.userKey].solutionItemCount[this.state.userKey]) ? true : false
      // if all my items are valid, give me the round points
      let newRoundScore = 0
      if (allMyItemsValid) {
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
      // check if table is valid, if so, end the round
      if(lastItemPlaced) {
        firebase.database().ref(refRound).once('value').then(function(snapshot) {
          // setup table for testing
          let minifiedTable = snapshot.val().table.map( (item, key) => String(item.x) + String(item.y) + '-' + item.color[0] + '-' + item.color[1] + '-' + item.color[2])
          let minifiedSolution = snapshot.val().solution.map( (item, key) => String(item.x) + String(item.y) + '-' + item.color[0] + '-' + item.color[1] + '-' + item.color[2])
          // console.log('minifiedTable',minifiedTable.sort());
          // console.log('minifiedSolution',minifiedSolution.sort());
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
      },
      score: {
        ...this.state.score,
        round: 0
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
    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)

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
        let rgb = []

        if(this.state.board.table && this.state.board.table.length >= 1){
          // loop thru all items on table
          this.state.board.table.map( (item, key) => {
            if(item.x === x && item.y === y) {
              classNames = 'active'
              // convert RYB to RGB
              rgb = []
              rgb = ryb2rgb(item.color)
              css.backgroundColor = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ', 1.0)'

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
                {(this.state.hints>1) ? x + ',' + y : ''}
              </button>
            </div>
          )
        } else if(teamItem) {
          return (
            <div key={'col-'+y+x} className='cols' >
              <button onClick={() => this.addItemToTable(x, y)} style={css}>
                {(this.state.hints>1) ? x + ',' + y : ''}
              </button>
            </div>
          )
        } else {
          return (
            <div key={'col-'+y+x} className='cols' >
              <button onClick={() => this.addItemToTable(x, y)} style={css}>
                {(this.state.hints>1) ? x + ',' + y : ''}
              </button>
            </div>
          )
        }
      })

      return(
        <div key={'row-'+y} className='rows'>{innerHtml}</div>
      )
    })

    // cmyk
    // let cmykRed = [0, 100, 100, 0]
    // let rgbRed = ryb2rgb([255, 0, 0])
    // let cssRed = 'rgb(' + rgbRed[0] + ',' + rgbRed[1] + ',' + rgbRed[2] + ')'
    //
    // let cmykYellow = [0, 0, 100, 0]
    // let rgbYellow = ryb2rgb([0, 255, 0])
    // let cssYellow = 'rgb(' + rgbYellow[0] + ',' + rgbYellow[1] + ',' + rgbYellow[2] + ')'
    //
    // let cmykBlue = [100, 100, 0, 0]
    // let rgbBlue = ryb2rgb([0, 0, 255])
    // let cssBlue = 'rgb(' + rgbBlue[0] + ',' + rgbBlue[1] + ',' + rgbBlue[2] + ')'

    let solutionKey = ''
    if(this.state.rounds[this.state.round]) {
      solutionKey = SOLUTION_KEYS[this.state.rounds[this.state.round].solutionKey]
    }

    return(
      <div id="spots-board-wrapper" className='component-wrapper'>
        <AI />

        {/*}<div className='color-convert'>
          <div style={{ backgroundColor: cssRed }}>rgb red</div>
          <div style={{ backgroundColor: cssYellow }}>rgb yellow</div>
          <div style={{ backgroundColor: cssBlue }}>rgb blue</div>
        </div>*/}

        {htmlScore}
        <Hints
          hints={HINTS}
          hintsCount={this.state.hints}
          userAttempts={this.props.user.pzs[PZ_INDEX].attempts}
          getHint={() => this.getHint()}
        />
        <button onClick={() => this.cancelGame()} className='cancel-button'>cancel game</button>

        <img src={this.state.clock} width="50px" />

        <div id='solution-key'>{solutionKey}</div>

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
  //let solutionColors = []
  let solution = []
  let solutionUserItems = []

  const SOLUTION_COLORS = [ RED, YELLOW, BLUE ]

  const SOLUTIONS = [
    [
      { x:0, y:1, color:RED },
      { x:2, y:0, color:YELLOW },
      { x:1, y:1, color:ORANGE },
      { x:4, y:1, color:BLUE },
      { x:3, y:0, color:GREEN },
      { x:5, y:1, color:PURPLE }
    ],
    [
      { x:4, y:1, color:RED },
      { x:3, y:0, color:YELLOW },
      { x:3, y:2, color:ORANGE },
      { x:2, y:1, color:BLUE },
      { x:1, y:0, color:GREEN },
      { x:1, y:2, color:PURPLE }
    ],
    [
      { x:1, y:0, color:RED },
      { x:4, y:0, color:RED },
      { x:0, y:1, color:YELLOW },
      { x:1, y:2, color:ORANGE },
      { x:4, y:2, color:ORANGE },
      { x:2, y:2, color:BLUE },
      { x:3, y:2, color:BLUE },
      { x:1, y:1, color:GREEN },
      { x:2, y:0, color:PURPLE },
      { x:3, y:0, color:PURPLE }
    ],
    [
      { x:3, y:1, color:RED },
      { x:5, y:2, color:RED },
      { x:2, y:1, color:YELLOW },
      { x:2, y:2, color:YELLOW },
      { x:3, y:3, color:YELLOW },
      { x:3, y:2, color:ORANGE },
      { x:5, y:3, color:ORANGE },
      { x:4, y:0, color:BLUE },
      { x:3, y:0, color:GREEN },
      { x:4, y:0, color:GREEN },
      { x:5, y:1, color:PURPLE }
    ],
    [
      { x:0, y:2, color:RED },
      { x:1, y:3, color:RED },
      { x:2, y:4, color:RED },
      { x:3, y:2, color:YELLOW },
      { x:0, y:0, color:ORANGE },
      { x:1, y:1, color:ORANGE },
      { x:2, y:2, color:ORANGE },
      { x:4, y:4, color:ORANGE },
      { x:0, y:4, color:BLUE },
      { x:2, y:0, color:GREEN },
      { x:4, y:0, color:PURPLE }
    ],
    [
      { x:0, y:0, color:RED },
      { x:1, y:1, color:RED },
      { x:3, y:3, color:RED },
      { x:2, y:0, color:YELLOW },
      { x:3, y:1, color:YELLOW },
      { x:0, y:2, color:YELLOW },
      { x:1, y:3, color:YELLOW },
      { x:1, y:0, color:ORANGE },
      { x:0, y:1, color:ORANGE },
      { x:2, y:1, color:ORANGE },
      { x:1, y:2, color:ORANGE },
      { x:2, y:3, color:ORANGE },
      { x:4, y:3, color:ORANGE },
      { x:4, y:0, color:BLUE },
      { x:5, y:1, color:BLUE },
      { x:0, y:4, color:BLUE },
      { x:3, y:0, color:GREEN },
      { x:4, y:1, color:GREEN },
      { x:0, y:3, color:GREEN },
      { x:1, y:4, color:GREEN },
      { x:5, y:0, color:PURPLE }
    ],
    [
      { x:2, y:0, color:RED },
      { x:3, y:0, color:RED },
      { x:2, y:4, color:RED },
      { x:3, y:4, color:RED },
      { x:0, y:0, color:YELLOW },
      { x:5, y:0, color:YELLOW },
      { x:0, y:4, color:YELLOW },
      { x:5, y:4, color:YELLOW },
      { x:3, y:2, color:ORANGE },
      { x:1, y:1, color:BLUE },
      { x:1, y:3, color:BLUE },
      { x:4, y:3, color:BLUE },
      { x:3, y:3, color:GREEN },
      { x:1, y:2, color:PURPLE },
      { x:4, y:2, color:PURPLE }
    ],
    [
      { x:1, y:0, color:RED },
      { x:1, y:2, color:RED },
      { x:1, y:4, color:RED },
      { x:2, y:3, color:YELLOW },
      { x:3, y:3, color:YELLOW },
      { x:0, y:0, color:ORANGE },
      { x:0, y:2, color:ORANGE },
      { x:0, y:4, color:ORANGE },
      { x:2, y:2, color:BLUE },
      { x:3, y:2, color:BLUE },
      { x:4, y:0, color:GREEN },
      { x:4, y:2, color:GREEN },
      { x:4, y:4, color:GREEN }
    ],
    [
      { x:3, y:3, color:RED },
      { x:3, y:1, color:YELLOW },
      { x:2, y:3, color:ORANGE },
      { x:1, y:0, color:BLUE },
      { x:4, y:0, color:BLUE },
      { x:1, y:4, color:BLUE },
      { x:4, y:4, color:BLUE },
      { x:2, y:1, color:GREEN },
      { x:2, y:0, color:PURPLE },
      { x:3, y:0, color:PURPLE },
      { x:2, y:4, color:PURPLE },
      { x:3, y:4, color:PURPLE }
    ],

  ]

  if(props.players.length === 1) {
    solutionUserItems = [
      // RED
      [ 10 ],
      [ 10 ],
      [ 10 ],
    ]
  } else if (props.players.length === 2) {
    // RED, YELLOW
    solutionUserItems = [
      [ 10, 10 ],
      [ 10, 10 ],
      [ 10, 10 ],
    ]
  } else if (props.players.length === 3) {
    // RED, YELLOW, BLUE
    solutionUserItems = [
      [ 10, 10, 10 ],
      [ 10, 10, 10 ],
      [ 10, 10, 10 ],
    ]
  } else if (props.players.length === 4) {
    solutionUserItems = [
      [ 5, 10, 10,
        5 ],
      [ 5, 10, 10,
        5 ],
      [ 5, 10, 10,
        5 ],
    ]
  } else if (props.players.length === 5) {
    solutionUserItems = [
      [ 5, 5, 10,
        5, 5 ],
      [ 5, 5, 10,
        5, 5 ],
      [ 5, 5, 10,
        5, 5 ],
    ]
  } else if (props.players.length === 5) {
    solutionUserItems = [
      [ 5, 5, 5,
        5, 5, 5 ],
      [ 5, 5, 5,
        5, 5, 5 ],
      [ 5, 5, 5,
        5, 5, 5 ],
    ]
  }

  let solutionIndexes = [ 0 ] // always start with teh esiest Pz
  let solutions = [ SOLUTIONS[0] ] // always start with teh esiest Pz
  //get solutions
  for(let i=1; i<PZ_PROPS.rounds.numOfRounds;) {
    let index = random.integer(1, SOLUTIONS.length-1)
    // keep track of each solution you are using so you dont use the same one twice in a game
    if(solutionIndexes.indexOf(index) === -1) {
      solutionIndexes.push(index)
      solutions.push(SOLUTIONS[index])
      ++i;
    }
  }

  // setup each user for each round
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
    let solution = []
    let solutionMax = (props.players.length === 1) ? 1 : (props.players.length === 2) ? 3 : 6
    Object.keys(solutions[round]).forEach( (sol, key) => {
      if(key < solutionMax) solution.push(solutions[round][key])
    })
    // ADD USERS to pz - create an empty obj for each user
    let settingsUsers = []
    let colorIndex = 0
    props.players.forEach( (user,key) => {
      settingsUsers.push(
        {
          userId: user,
          items: solutionUserItems[round][key],
          color: SOLUTION_COLORS[colorIndex],
          solutionItemCount: solutionUserItems[round]
        }
      )
      colorIndex = (colorIndex >= SOLUTION_COLORS.length - 1) ? 0 : colorIndex + 1
    })
    // settings = rounds[#][users][#] (without user data)
    // DEAL colors to users
    // let userIndex = 0
    // SOLUTION_COLORS.some((color, key) => {
    //   settingsUsers[userIndex].color = SOLUTION_COLORS[key]
    //   //userIndex = (userIndex >= prop.players.length) ? 0 :
    //   userIndex ++
    //   return key+1 >= props.players.length
    // })
    // settings = rounds[#][users][#] (with user data)
    // STORE settings
    settings.push({
      users: settingsUsers,
      table: [],
      solution: solution,
      solutionKey: solutionIndexes[round]
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
