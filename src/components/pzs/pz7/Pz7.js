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

const PZ_INDEX = 6
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

let MAX_X = 235 //px
let MIN_X = 15 //px
let MAX_Y = 235 //px
let MIN_Y = 15 //px

// let CONTROLS = [
//   'up', 'upx',
//   'down', 'downx',
//   'left', 'leftx',
//   'right', 'rightx',
//   'open', 'close'
// ]

let CONTROLS = [
  'up',
  'down',
  'left',
  'right',
  'open', 'close'
]

class Pz7 extends Component {
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
      render: false,
      board: {
        table: {
          arm: {
            x: 0,
            y: 0,
            open: false
          },
          controls: [
            { name: 'up', userId: '' },
            { name: 'upx', userId: '' },
            { name: 'down', userId: '' },
            { name: 'downx', userId: '' },
            { name: 'left', userId: '' },
            { name: 'leftx', userId: '' },
            { name: 'right', userId: '' },
            { name: 'rightx', userId: '' },
            { name: 'open', userId: '' },
            { name: 'close', userId: '' }
          ],
          item: {
            x: 0,
            y: 0,
            status: 'free | captured | bay'
          },
          bay: {
            x: 0,
            y: 0,
            itemCount: 0
          }
        }
      },
      rounds: [
        {
          table: {
            arm: {
              x: 0,
              y: 0,
              open: false
            },
            controls: {},
            item: {
              x: 0,
              y: 0,
              status: 'free | captured | bay'
            },
            bay: {
              x: 0,
              y: 0,
              itemCount: 0
            }
          },
          solution: [ ],
          users: [
            {
              itemCount: 0,
              userId: '',
              initControls: [ ],
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
    let tableNew = pzBoard.rounds[this.state.round].table
    if(this.state.round === 0 && this.state.render) return
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
    let userId = this.props.user.id
    let roundKey = (round) ? round : this.state.round
    if(!this.state.rounds[roundKey]) return

    // get init arm/item/bay from db settings
    let newTable = this.state.rounds[roundKey].table

    // set controls
    newTable.controls = []
    if (this.state.rounds[roundKey].difficulty === 0) {
      // easy ( each user has all controls)
      newTable.controls = CONTROLS.map(control => {
        //newTable.controls.push({
        return {
          name: control,
          userId: userId
        }
        //})
      })
    } else {
      // med/hard ( controls are divided )
      this.state.rounds[roundKey].users.forEach( user => {
        user.initControls.forEach( control => {
          newTable.controls.push({
            name: control,
            userId: user.userId
          })
        })
      })
    }
    //newTable.controls
    this.setState({
      board: {
        ...this.state.board,
        table: newTable
      },
      render: true
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

  updateArm(action) {
    // add the item to the table and get points
    let self = this
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/'
    let refUser = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/users/' + this.state.userKey
    let armOpen = this.state.board.table.arm.open
    let bayItemCount = this.state.board.table.bay.itemCount
    let newTable = Object.assign({},this.state.board.table)
    let difficulty = this.state.rounds[this.state.round].difficulty
    //let item = this.state.board.table.item
    let itemInBay = false

    let y = newTable.arm.y
    let x = newTable.arm.x

    let smallMove = 5
    let largeMove = 20

    switch (action) {
      case 'up':
        newTable.arm.y = (y < MAX_Y-smallMove) ? y+smallMove : MAX_Y
        break;
      case 'upx':
        newTable.arm.y = (y < MAX_Y-largeMove) ? y+largeMove : MAX_Y
        break;
      case 'down':
        newTable.arm.y = (y > MIN_Y+smallMove) ? y-smallMove : MIN_Y
        break;
      case 'downx':
        newTable.arm.y = (y > MIN_Y+largeMove) ? y-largeMove : MIN_Y
        break;
      case 'left':
        newTable.arm.x = (x > MIN_X+smallMove) ? x-smallMove : MIN_X
        break;
      case 'leftx':
        newTable.arm.x = (x > MIN_X+largeMove) ? x-largeMove : MIN_X
        break;
      case 'right':
        newTable.arm.x = (x < MAX_X-smallMove) ? x+smallMove : MAX_X
        break;
      case 'rightx':
        newTable.arm.x = (x < MAX_X-largeMove) ? x+largeMove : MAX_X
        break;
      case 'open':
        newTable.arm.open = true
        break;
      case 'close':
        newTable.arm.open = false
        break;
    }

    // check item status
    let armAboveItem = (Math.abs(newTable.arm.x - newTable.item.x) <= 5 && Math.abs(newTable.arm.y - newTable.item.y) <= 5) ? true : false
    let armAboveBay = (Math.abs(newTable.arm.x - newTable.bay.x) <= 10 && Math.abs(newTable.arm.y - newTable.bay.y) <= 10) ? true : false
    if(armAboveItem && !newTable.arm.open && armOpen) {
      // item isnewly  captured ( above the item, previous open and now closed )
      newTable.item.status = 'captured'
    } else if (!newTable.arm.open  && this.state.board.table.item.status === 'captured') {
      // item is moving with arm
      newTable.item.x = newTable.arm.x
      newTable.item.y = newTable.arm.y
    } else if(!armOpen && newTable.arm.open && armAboveBay && newTable.item.status === 'captured') {
      // item has been dropped in bay
      newTable.item.status = 'bay'
      itemInBay = true
      newTable.bay.itemCount = ++newTable.bay.itemCount
    } else {
      this.state.board.table.item.status = 'free'
    }

    // update table

    // UPDATE SCORE: by checking if all my items are in the correct position
      // loop thru all my  items, then loop thru all items on table to check
      let allMyItemsValid = true
      // if its equal to the number of items a user needs for solution, give em the points
      //allMyItemsValid = (userItemsCount === this.state.rounds[this.state.round].users[this.state.userKey].solutionItemCount[this.state.userKey]) ? true : false
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

    // if on easy mode, only update local state
    if (difficulty === 0) {
      // if item is placed in bay, generate a new item
      if (bayItemCount != newTable.bay.itemCount) {
        let random = new Random(Random.engines.mt19937().autoSeed())
        newTable.item.x = random.integer(MIN_X, MAX_X)
        newTable.item.y = random.integer(MIN_Y, MAX_Y)
        newTable.item.status = 'bay'
      }
      this.setState({
        board: {
          ...this.state.board,
          table: newTable
        }
      })
      // update DB if needed
      if(bayItemCount === 0 && newTable.bay.itemCount >= 1) {
        // if this is my first item in bay, check if ending round for all
        firebase.database().ref(refUser).update({
          itemCount: newTable.bay.itemCount,
          valid: true
        }).then(function(){
          // check if all users have at least one item, if so, end the round
          if(itemInBay) {
            firebase.database().ref(refRound + '/users/').once('value').then(function(snapshot) {
              let allUsersValid = true
              snapshot.val().forEach( user => {
                if(!user.valid) allUsersValid = false
              })
              if(allUsersValid) self.endRound()
            })
          }
        })
      } else if(bayItemCount != newTable.bay.itemCount) {
        // just add an item to my bay
        firebase.database().ref(refUser).update({
          itemCount: newTable.bay.itemCount
        })
      }
      return
    }

    // update the table on the dbase
    firebase.database().ref(refRound).update({
      table: newTable
    }).then(function(){
      // check if table is valid, if so, end the round
      if(itemInBay) {
        firebase.database().ref(refRound).once('value').then(function(snapshot) {
          self.endRound()
        })
      }
    })
  }

  removeItemFromTable() {
    this.setState({
      score: {
        ...this.state.score,
        round: 0
      }
    })
  }

  render(){

    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)

    let userId = this.props.user.id
    let bayItemCount = this.state.board.table.bay.itemCount || 0

    let styleArm = {}
    let styleItem = {}
    let styleBay = {}

    let classNamesArm = ''

    let htmlControls = ''

    if(this.state.render && this.state.board.table.controls) {

      let arm = this.state.board.table.arm
      let item = this.state.board.table.item
      let bay = this.state.board.table.bay

      // get my controls
      htmlControls = this.state.board.table.controls.filter(control => control.userId === userId)
      htmlControls = htmlControls.map( (control, key) => {
        if (['up','down','left','right'].indexOf(control.name) >= 0) {
          // return two buttons for each direction
          return(
            <div key={key} className='button-wrapper'>
              <button onClick={() => this.updateArm(control.name)}>{control.name}</button>
              <button onClick={() => this.updateArm(control.name + 'x')}>{control.name} X</button>
            </div>
          )
        } else {
          return(
            <div key={key} className='button-wrapper'>
              <button onClick={() => this.updateArm(control.name)}>{control.name}</button>
            </div>
          )
        }
      })

      // get the arm
      styleArm = {
        bottom: arm.y + 'px',
        left: arm.x + 'px'
      }
      classNamesArm = (arm.open) ? 'open' : ''

      // get the item coords
      styleItem = {
        bottom: item.y + 'px',
        left: item.x + 'px'
      }
        // if its in the arm, make it match the arm

      // get the bay
      styleBay = {
        bottom: bay.y + 'px',
        left: bay.x + 'px'
      }

    }

    return(
      <div id="arm-board-wrapper" className='component-wrapper'>
        {htmlScore}
        <Hints
          hints={HINTS}
          hintsCount={this.state.hints}
          userAttempts={this.props.user.pzs[PZ_INDEX].attempts}
          getHint={() => this.getHint()}
        />

        <div id='controls-wrapper'>
          {htmlControls}
        </div>

        <div id='table'>
          <div className={'element ' + classNamesArm} id='arm' style={styleArm} ></div>
          <div className='element' id='item' style={styleItem} ></div>
          <div className='element' id='bay' style={styleBay} >{bayItemCount}</div>
        </div>
      </div>
    )
  }
}

// FUNCS

const genSettingsPz7 = (props) => {
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed())
  // setup each user for each round
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
    // DIFFICULTY settings based on difficulty
    // default to easy
    let difficulty = 0
    let maxRange = 4
    if (round >= 2) {
      // medium
      difficulty = 2
    } else if (round >= 1) {
      // hard
      difficulty = 1
    }
    // hard code forest testing
    //difficulty = 1

    // ADD USERS to pz - create an empty obj for each user
    let settingsUsers = []
    props.players.forEach( (user,key) => {
      settingsUsers.push(
        {
          userId: user,
          itemCount: 0,
          initControls: [],
          valid: false
        }
      )
    })

    // SET CONTROLS

    if (difficulty === 0) {
      // each user gets all controls
      settingsUsers.map((user,key) => {
        settingsUsers[key].initControls = CONTROLS
      })
    } else if (difficulty >= 1) {
      // controls are dealt to users
      let shuffledControls = shuffleArray(CONTROLS)
      let userIndex = 0
      shuffledControls.forEach(control => {
          settingsUsers[userIndex].initControls.push(control)
          userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
      })
    }

    // SETUP TABLE
    let table = {
      arm: {
        x: 10,
        y: 50,
        open: false
      },
      controls: {},
      item: {
        x: random.integer(MIN_X, MAX_X),
        y: random.integer(MIN_Y, MAX_Y),
        status: 'free'
      },
      bay: {
        x: random.integer(MIN_X, MAX_X),
        y: random.integer(MIN_Y, MAX_Y),
        itemCount: 0
      }
    }

    // STORE settings
    settings.push({
      difficulty: difficulty,
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

export default Pz7

export {
  genSettingsPz7
}
