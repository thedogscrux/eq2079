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

// TODO possbile show an image for the character
// import imageA00 from './images/A00.jpg'
// import imageA01 from './images/A01.jpg'
// import imageA02 from './images/A02.jpg'
// import imageA03 from './images/A03.jpg'
// import imageA04 from './images/A04.jpg'
// import imageA05 from './images/A05.jpg'
// import imageA06 from './images/A06.jpg'
// import imageA07 from './images/A07.jpg'
// import imageA08 from './images/A08.jpg'


const PZ_INDEX = 9
const PZ_PROPS = propsPzs[PZ_INDEX]

const HINTS = [
  {
    title: 'Hint One',
    body: 'The keyboard is a cypher.'
  },
  {
    title: 'Hint Two',
    body: 'on the keyboard, the keys: [Q] [W] [E] [R] [T] [Y] = A, B, C, D, E, F, and so on to Z'
  }
]

// TODO possbile show an image for the character
// const IMAGE_MAP = new Map([
//     [ 'imageA00', imageA00 ], [ 'imageA01', imageA01 ], [ 'imageA02', imageA02 ],
//     [ 'imageA03', imageA03 ], [ 'imageA04', imageA04 ], [ 'imageA05', imageA05 ],
//     [ 'imageA06', imageA06 ], [ 'imageA07', imageA07 ], [ 'imageA08', imageA08 ],
//     [ 'imageB00', imageB00 ], [ 'imageB01', imageB01 ], [ 'imageB02', imageB02 ],
//     [ 'imageB03', imageB03 ], [ 'imageB04', imageB04 ], [ 'imageB05', imageB05 ],
//     [ 'imageB06', imageB06 ], [ 'imageB07', imageB07 ], [ 'imageB08', imageB08 ],
// ]);

let CIPHER = [
  ['A','Q'],
  ['B','W'],
  ['C','E'],
  ['D','R'],
  ['E','T'],
  ['F','Y'],
  ['G','U'],
  ['H','I'],
  ['I','O'],
  ['J','P'],
  ['K','A'],
  ['L','S'],
  ['M','D'],
  ['N','F'],
  ['O','G'],
  ['P','H'],
  ['Q','J'],
  ['R','K'],
  ['S','L'],
  ['T','Z'],
  ['U','X'],
  ['V','C'],
  ['W','V'],
  ['X','B'],
  ['Y','N'],
  ['Z','M']
]

class Pz10 extends Component {
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
        table: [ 2, 1, 0 ],
        myTiles: [
          {
            value: 'A00'
          }
        ],
      },
      rounds: [
        {
          table: [ 'A', 'A', 'A' ],
          solution: [ 'A', 'B', 'C' ],
          users: [
            {
              tiles: [ 'A', 'M', 'Z' ],
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
    console.log('* build board *');
    let userId = this.props.user.id
    let roundKey = (round) ? round : this.state.round
    if(!this.state.rounds[roundKey]) return
    let roundUser = this.state.rounds[roundKey].users.filter( user => user.userId == userId )
    let userTiles = roundUser[0].tiles.map( (tile, key) => {
      return {
        value: tile
      }
    })

    let table = this.state.rounds[roundKey].table
    this.setState({
      board: {
        ...this.state.board,
        table: table,
        myTiles: userTiles
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

  getMyItemPos() { }

  // END GAME

  cancelGame() {
    this.props.endRound(true)
  }

  endRound() {
    this.props.endRound() // parent component ends the round
  }

  endGame(){
    let newTotalScore = this.state.score.round + this.state.score.total
    newTotalScore = (newTotalScore < this.state.score.max) ? newTotalScore : this.state.score.max
    // calc user score (final score calculated in Pz parent)
    return newTotalScore
  }

  // HINT

  getHint() {
    console.log(' ** GET HINT ** ')
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

  updateTableInsertTile(tileValue) {
    // append tile to table array
    let self = this
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + (this.state.round) + '/'
    let tableNew = this.state.board.table || []
    let solution = this.state.rounds[this.state.round].solution
    // find next empty index in table
    let nextEmptyIndex = this.state.board.table.indexOf('')
    if (nextEmptyIndex === -1) return false
    let lastTilePlaced = (nextEmptyIndex >= solution.length-1) ? true : false
    // insert my tile in table
    tableNew[nextEmptyIndex] = tileValue

    // loop thru all tiles and if none are null then check for solution
    //let lastTilePlaced = (tableNew.length >= solution.length) ? true : false
    // UPDATE SCORE: by checking if all my tiles are in the correct position
      // loop thru all my  tiles, then loop thru all tiles on table to check
      let allMyTilesValid = true
      this.state.board.myTiles.map( myTile => {
        // if my tile is not on the table, then i am not 100% valid
        let tableTiles = tableNew.filter( tableTile => tableTile === myTile.value)
        if(tableTiles.length < 1) allMyTilesValid = false
        // loop thru all table tiles, if my tile is on the table, and in the WRONG spot, then i am not 100% valid
        tableNew.map( (tableTile, key) => {
          if(tableTile === myTile.value && solution[key] != myTile.value) allMyTilesValid = false
        })
      })
      // if all my tiles are valid, give me the round points
      let newRoundScore = 0
      if (allMyTilesValid) {
        newRoundScore = (game.score.round < this.state.score.max) ? game.score.round : this.state.score.max
      }
      this.setState({
        ...this.state,
        score: {
          ...this.state.score,
          round: newRoundScore
        }
      })

    // update the table on the dbase
    firebase.database().ref(refRound).update({
      table: tableNew
    }).then(function(){
      // check if table is valid, if so, end the round
      if(lastTilePlaced) {
        firebase.database().ref(refRound).once('value').then(function(snapshot) {
          if(testIfEqualArrays(snapshot.val().table, snapshot.val().solution)) self.endRound()
        })
      }
    })
  }

  updateTableRemoveTile(index) {
    // remove tile from table array
    let self = this
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + (this.state.round) + '/'
    let tableNew = this.state.board.table || []
    tableNew[index] = ''
    // set current round score to 0
    this.setState({
      ...this.state,
      score: {
        ...this.state.score,
        round: 0
      }
    })
    firebase.database().ref(refRound).update({
      table: tableNew
    })
  }

  render(){

    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)

    // build table contents
    let htmlTable = ''
    let htmlMyTiles = ''

    if(this.state.render) {
      let nextEmptyIndex = (this.state.board.table.indexOf('') === -1) ? this.state.board.table.length : this.state.board.table.indexOf('')
      let lastPlacedIndex = (this.state.board.table[nextEmptyIndex-1] === ' ') ? nextEmptyIndex-2 : nextEmptyIndex-1
      let alphabet = CIPHER.map(code => code[0])

      htmlTable = this.state.board.table.map( (tile, key) => {
        let innerHtml = ''
        let css = {}
        let className = 'tile '

        // get related cipher code
        let solutionChar = this.state.rounds[this.state.round].solution[key]
        let cipherIndex = alphabet.indexOf(solutionChar)

        // insert tile in table array
        if (tile === ' ') {
          innerHtml = '' // <!-- space -->
          className += ' space'
        } else if (tile === '') {
          className += ' code'
          innerHtml = (cipherIndex != -1) ? CIPHER[cipherIndex][1] : '*'
        } else {
          innerHtml = this.state.board.table[key]
        }

        // TODO possbile show an image for the character
        // let img = IMAGE_MAP.get('image' + this.state.board.table[key])
        let img = ''
        css = { backgroundImage: `url(${img})` }

        let myTiles = this.state.board.myTiles.filter( tile => tile.value === this.state.board.table[key])
        if(myTiles.length >= 1 && (key === nextEmptyIndex-1 || key === lastPlacedIndex) ) {
          // if last tile in array, and MY tile, insert as a btn with ability to remove
          // OR if second to last tile is mine, and last tile is a
          return (
            <div key={key} className={className} style={css}>
              <button onClick={() => this.updateTableRemoveTile(key)} >{innerHtml}</button>
            </div>
          )
        } else {
          return (<div key={key} className={className} style={css}>{innerHtml}</div>)
        }
      })

      // build user tiles
      htmlMyTiles = this.state.board.myTiles.map( (tile, key) => {
        let disabled = ''
        let css = {}
        // get assoc image
        // TODO possbile show an image for the character
        //let img = IMAGE_MAP.get('image' + tile.value)
        let img = ''
        css = { backgroundImage: `url(${img})` }
        return (
          <div key={key} className={'tile ' + disabled} style={css}>
            <button onClick={() => this.updateTableInsertTile(tile.value)}>{tile.value}{(this.state.hints>1) ? tile.value : ''}</button>
          </div>
        )
      })

    }

    return(
      <div id="code-board-wrapper" className='component-wrapper component-pz'>
        {htmlScore}
        <Hints
          hints={HINTS}
          hintsCount={this.state.hints}
          userAttempts={this.props.user.pzs[PZ_INDEX].attempts}
          getHint={() => this.getHint()}
        />
        <button onClick={() => this.cancelGame()} className='cancel-button'>cancel game</button>

        <img src={this.state.clock} width="50px" />

        <div className='table-wrapper'>{htmlTable}</div>
        <div className='my-tiles-wrapper'>{htmlMyTiles}</div>
      </div>
    )
  }
}

// FUNCS

const genSettingsPz10 = (props) => {
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed())
  // setup each user for each round
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
    // ADD USERS to pz - create an empty obj for each user
    let settingsUsers = []
    props.players.forEach( (user,key) => {
      settingsUsers.push(
        {
          userId: user,
          tiles: []
        }
      )
    })
    // settings = rounds[#][users][#] { } without user data
    // SHUFFLE ITEMS and determine solution
    let solution = [
      [ 'G', 'O', 'O', 'D', 'B', 'Y', 'E', ' ', 'Q', 'W', 'E', 'R', 'T', 'Y' ],
      [ 'H', 'E', 'L', 'L', 'O', ' ', 'W', 'O', 'R', 'L', 'D' ],
      [ 'G', 'O', 'O', 'D', 'B', 'Y', 'E', ' ', 'W', 'O', 'R', 'L', 'D' ]
    ]
    // DEAL ITEMS to users
    let userIndex = 0
    let alphabet = CIPHER.map(code => code[0])
    let shuffledCipher = []
    if (round < 1) {
      shuffledCipher = alphabet
    } else {
      shuffledCipher = shuffleArray(alphabet)
    }
    shuffledCipher.forEach((index, key) => {
        settingsUsers[userIndex].tiles.push(shuffledCipher[key][0])
        userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
    })
    // settings = rounds[#][users][#] {...} with user data
    // BUILD STARTING TABLE
    let table = solution[round].map(tile => (tile === ' ') ? ' ' : '')
    // STORE settings
    settings.push({
      users: settingsUsers,
      table: table,
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

export default Pz10

export {
  genSettingsPz10
}
