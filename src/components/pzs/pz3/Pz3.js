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

const PZ_INDEX = 2
const PZ_PROPS = propsPzs[PZ_INDEX]

const HINTS = [
  {
    title: 'Hint One',
    body: 'Soduko.'
  },
  {
    title: 'Hint Two',
    subTitle: 'Subtitle',
    body: '...'
  }
]

const VALUES = [
  'ZERO',
  'ONE',
  'TWO',
  'THREE',
  'FOUR'
]

// const VALUES = [
//   [
//     'ZERO',
//     'ONE',
//     'TWO',
//     'THREE',
//     'FOUR'
//   ],
//   [
//     'ZERO',
//     'ONE',
//     'TWO',
//     'THREE',
//     'FOUR',
//     'FIVE',
//     'SIX'
//   ],
// ]

class Pz3 extends Component {
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
    // table[row][col].{ val: 0, userId: '' }
    this.state = {
      ...baseState,
      board: {
        table: [
          [
            { val: 0, userId: '' },
            { val: 0, userId: '' }
          ],
          [
            {},
            {}
          ]
        ],
        myCells: [
          { row: 0, col: 0, val: 0 },
          { row: 0, col: 0, val: 0 },
          { row: 0, col: 0, val: 0 },
          { row: 0, col: 0, val: 0 },
          { row: 1, col: 0, val: 0 },
          { row: 1, col: 0, val: 0 },
          { row: 1, col: 0, val: 0 },
          { row: 1, col: 0, val: 0 },
        ],
      },
      rounds: [
        {
          tableSize: 0,
          users: [
            {
              zones: [ 0 ],
              userId: ''
            }
          ]
        }
      ]
    }
    // tableSize: '3,8'
    // zones: [ '0-3,0-8' ]

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
    // table.[row][col].val
    let userId = this.props.user.id
    let roundKey = (round) ? round : this.state.round
    if(!this.state.rounds[roundKey]) return
    let roundUser = this.state.rounds[roundKey].users.filter( user => user.userId == userId )
    let newTable = this.state.rounds[roundKey].table

    // get my cells
    let newMyCells = []
    roundUser[0].zones.map( (zone, key) => {
      // set offset
      let offsetRow = -1
      let offsetCol = -1
      if (this.state.rounds[roundKey].tableSize === 3) {
        if (zone === 0) {
          offsetRow = 0
          offsetCol = 0
        } else if (zone === 1) {
          offsetRow = 0
          offsetCol = 2
        } else if (zone === 2) {
          offsetRow = 2
          offsetCol = 0
        } else if (zone === 3) {
          offsetRow = 2
          offsetCol = 2
        }
        // TODO: alttempt to create algorythm:
        // let offsetRow = ( (zone+zone) %2 ) +
        // let offsetCol = (zone%2) * 2 // zero for even nums
      } else if (this.state.rounds[roundKey].tableSize === 8) {
        if (zone === 0) {
          offsetRow = 0
          offsetCol = 0
        } else if (zone === 1) {
          offsetRow = 0
          offsetCol = 2
        } else if (zone === 2) {
          offsetRow = 0
          offsetCol = 4
        } else if (zone === 3) {
          offsetRow = 2
          offsetCol = 0
        } else if (zone === 4) {
          offsetRow = 2
          offsetCol = 2
        } else if (zone === 5) {
          offsetRow = 2
          offsetCol = 4
        } else if (zone === 6) {
          offsetRow = 4
          offsetCol = 0
        } else if (zone === 7) {
          offsetRow = 4
          offsetCol = 2
        } else if (zone === 8) {
          offsetRow = 4
          offsetCol = 4
        }
      }
      // loop thru rows
      for(var row=offsetRow; row<=offsetRow+1; row++) {
        // loop thru cols
        for(var col=offsetCol; col<=offsetCol+1; col++) {
          newMyCells.push({
            row: row,
            col: col,
            val: 0
          })
        }
      }
    })
    this.setState({
      board: {
        ...this.state.board,
        table: newTable,
        myCells: newMyCells
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

  guess() {
    // pz2 has a shared array that gets udpated when each user contributes a tile
    let points = this.state.points + 1
    this.setState({
      points: points
    })
  }

  updateItemOnTable(item) {
    // add the item to the table and get points
    let self = this
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/'
    let refCell = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/table/' + item.row + '/' + item.col + '/'
    let tableNew = this.state.board.table || []
    let tableSize = this.state.rounds[this.state.round].tableSize
    let solutionRowSum = (tableSize == 3) ? 10 : 21
    //let userItemsCount = 1

    // get the new value
    let newVal = (item.val > 3) ? 1 : item.val + 1

    // UPDATE SCORE: by checking if all my items are in the correct position
      // loop thru all my  items, then loop thru all items on table to check
      let allMyItemsValid = false
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
    firebase.database().ref(refCell).update({
      val: newVal
    }).then(function(){
      // check if table is valid, if so, end the round
      firebase.database().ref(refRound).once('value').then(function(snapshot) {
        let validTable = true
        snapshot.val().table.map( (row, rowKey) => {
          let rowTotal = 0
          row.map( (col, colKey) => {
            rowTotal = rowTotal + col.val
          })
          //if(rowTotal === solutionRowSum) console.log('row ' + rowKey + ' valid at a sum of ', rowTotal);
          if(rowTotal !== solutionRowSum) validTable = false
        })
        if(validTable) self.endRound()
      })
    })
  }

  render(){
    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)

    // if table exists, build grid
    // table[row][col].val
    let htmlGrid = ''
    if(this.state.rounds[this.state.round] && this.state.board.table && this.state.board.table.length >= 1){
      let tableSize = this.state.rounds[this.state.round].tableSize
      // build grid
      let htmlRows = this.state.board.table.map( (row, rowKey) => {
        let htmlCols = row.map( (col, colKey) => {
          let css = {}
          let val =  col.val
          // loop thru my cells and see if this one belongs to me
          let myCell = this.state.board.myCells.filter( (cell, key) => cell.row === rowKey && cell.col === colKey)
          if(myCell.length >= 1) {
            css.border = 'solid rgba(255, 255, 255, 1.0) .5px'
            return (
              <div key={'col-'+rowKey+colKey}
                onClick={() => this.updateItemOnTable({
                  row: rowKey,
                  col: colKey,
                  val: val
                })}
                className='col my-cell'
                style={css}
              >
                <div className='contents'>
                  {VALUES[val]}
                  {(this.state.hints>1) ? '<br/>' + rowKey + ',' +  colKey : ''}
                </div>
              </div>
            )
          } else {
            css.backgroundColor = 'rgba(0, 0, 0, .7)';
            return (
              <div key={'col-'+rowKey+colKey} className='col' style={css}>
                <div className='contents'>
                  {VALUES[val]}
                  {(this.state.hints>1) ? '<br/>' + rowKey + ',' +  colKey : ''}
                </div>
              </div>
            )
          }

        })
        return (
          <div key={'row-'+rowKey} className='row'>{htmlCols}</div>
        )
      })
      htmlGrid = <div id='grid' className={'table-size-'+tableSize}>{htmlRows}</div>
    }

    return(
      <div id="soduko-board-wrapper" className='component-wrapper'>
        {htmlScore}
        <Hints
          hints={HINTS}
          hintsCount={this.state.hints}
          userAttempts={this.props.user.pzs[PZ_INDEX].attempts}
          getHint={() => this.getHint()}
        />

        {htmlGrid}
      </div>
    )
  }
}

// FUNCS

const genSettingsPz3 = (props) => {
  let settings = []
  let numOfPlayers = props.players.length
  let tableSize =  (numOfPlayers <= 4) ? 3 : 8
  // setup each user for each round
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
    // ADD USERS to pz - create an empty obj for each user
    let settingsUsers = []
    props.players.forEach( (user,key) => {
      settingsUsers.push(
        {
          userId: user,
          zones: []
        }
      )
    })
    // settings = rounds[#][users][#] (without user data)
    // DIFFICULTY increase the table size for final round
    if(round >= PZ_PROPS.rounds.numOfRounds - 1){
      tableSize = (numOfPlayers <= 4) ? 8 : 8
    }
    // DEAL ZONES to users
    let zones = (tableSize == 3) ? [0,1,2,3] : [0,1,2,3,4,5,6,7,8]
    let shuffledZones = shuffleArray(zones)
    let userIndex = 0
    for(let i=0; i<=tableSize; i++) {
      settingsUsers[userIndex].zones.push(shuffledZones[i])
      userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
    }
    // settings = rounds[#][users][#] (with user data)
    // BUILD BOARD
    // determine table stats (2x2 small table) (3x3 large table)
    let gridSize = (tableSize === 3) ? 4 : 6
    // build the raw table struct
    let table = []
    for(var row=0; row<gridSize; row++) {
      let cols = []
      for(var col=0; col<gridSize; col++) {
        cols.push({
          val: 0
        })
      }
      table.push(cols)
    }
    // STORE settings
    settings.push({
      users: settingsUsers,
      tableSize: tableSize,
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

export default Pz3

export {
  genSettingsPz3
}
