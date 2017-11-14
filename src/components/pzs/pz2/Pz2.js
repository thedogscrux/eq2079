import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'

import { shuffleArray, testIfEqualArrays } from '../../../utils/Common.js'
import Score, { calcMaxScore, calcHintCost } from '../../../utils/Score.js'
import game from '../../../Settings.js'
import { propsPzs } from '../../../data/propsPzs.js'

import imageA00 from './images/A00.jpg'
import imageA01 from './images/A01.jpg'
import imageA02 from './images/A02.jpg'
import imageA03 from './images/A03.jpg'
import imageA04 from './images/A04.jpg'
import imageA05 from './images/A05.jpg'
import imageA06 from './images/A06.jpg'
import imageA07 from './images/A07.jpg'
import imageA08 from './images/A08.jpg'

import imageB00 from './images/B00.jpg'
import imageB01 from './images/B01.jpg'
import imageB02 from './images/B02.jpg'
import imageB03 from './images/B03.jpg'
import imageB04 from './images/B04.jpg'
import imageB05 from './images/B05.jpg'
import imageB06 from './images/B06.jpg'
import imageB07 from './images/B07.jpg'
import imageB08 from './images/B08.jpg'

const PZ_INDEX = 1
const PZ_PROPS = propsPzs[PZ_INDEX]

const HINTS = [
  {
    title: 'Hint One',
    body: 'Fold the paper with the colored bars in half'
  },
  {
    title: 'Hint Two',
    subTitle: 'This is your last hint.',
    body: 'The colored bars with red on top is the key.'
  }
]

const IMAGE_MAP = new Map([
    [ 'imageA00', imageA00 ], [ 'imageA01', imageA01 ], [ 'imageA02', imageA02 ],
    [ 'imageA03', imageA03 ], [ 'imageA04', imageA04 ], [ 'imageA05', imageA05 ],
    [ 'imageA06', imageA06 ], [ 'imageA07', imageA07 ], [ 'imageA08', imageA08 ],
    [ 'imageB00', imageB00 ], [ 'imageB01', imageB01 ], [ 'imageB02', imageB02 ],
    [ 'imageB03', imageB03 ], [ 'imageB04', imageB04 ], [ 'imageB05', imageB05 ],
    [ 'imageB06', imageB06 ], [ 'imageB07', imageB07 ], [ 'imageB08', imageB08 ],
]);

class Pz2 extends Component {
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
        max: score.calcMaxScore(props.user.pzs[PZ_INDEX].hints, this.props.numOfUsers),
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
    let tableNew = value.rounds[this.state.round-0].table
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
      if(self._ismounted) {
        // console.log('1 - SET settings');
        // self.setStateRounds(snapshot.val())
      } else {
        console.log('2 - SET settings');
        self.setStateRounds(snapshot.val())
        self.buildStateBoard()
        self.getMyUserKey()
      }
      return
    })
    return
  }

  setStateRounds(settings){
    if(this._ismounted) {
      // console.log('3 - SET settings');
      // this.setState({
      //   rounds: settings.rounds
      // })
    } else {
      console.log('4 - SET settings');
      this.setState({
        rounds: settings.rounds
      })
    }
  }

  buildStateBoard(round) {
    // build board
    console.log('* build board *');
    let userId = this.props.user.id
    let roundKey = (round) ? round-0 : this.state.round-0
    if(!this.state.rounds[roundKey]) return
    let roundUser = this.state.rounds[roundKey].users.filter( user => user.userId == userId )
    let userTiles = roundUser[0].tiles.map( (tile, key) => {
      return {
        value: tile
      }
    })
    this.setState({
      board: {
        ...this.state.board,
        table: [],
        myTiles: userTiles
      }
    })
  }

  getMyUserKey() {
    // loop thru all users in round to find me
    let userKey = -1
    let userId = this.props.user.id
    this.state.rounds[this.state.round-0].users.filter((user,key) => {
      if (user.userId == userId) userKey = key
      return
    })
    this.setState({
      userKey: userKey
    })
  }

  getMyItemPos() { }

  // END GAME

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
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + (this.state.round-0) + '/'
    let tableNew = this.state.board.table || []
    tableNew.push(tileValue)
    let solution = this.state.rounds[this.state.round-0].solution
    let lastTilePlaced = (tableNew.length >= solution.length) ? true : false
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

  updateTableRemoveTile(tileValue) {
    // remove tile from table array
    let self = this
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + (this.state.round-0) + '/'
    let tableNew = this.state.board.table || []
    tableNew.pop()
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
    // build table contents
    let htmlTable = ''
    if(this.state.rounds[this.state.round-0]) {
      htmlTable = this.state.rounds[this.state.round-0].solution.map( (tile, key) => {
        let innerHtml = ''
        let css = {}
        if(!this.state.board.table) return (<div key={key} className='cell'></div>)
        // insert tile in table array
        if(this.state.board.table[key]) {
          //innerHtml = this.state.board.table[key]
          let img = IMAGE_MAP.get('image' + this.state.board.table[key])
          css = { backgroundImage: `url(${img})` }
        }
        let myTiles = this.state.board.myTiles.filter( tile => tile.value === this.state.board.table[key])
        if(key === this.state.board.table.length-1 && myTiles.length >= 1) {
          // if last tile in array, and MY tile, insert as a btn with ability to remove
          return (
            <div key={key} className='tile' style={css}>
              <button onClick={() => this.updateTableRemoveTile(this.state.board.table[key])} >{innerHtml}</button>
            </div>
          )
        } else {
          return (<div key={key} className='tile' style={css}>{innerHtml}</div>)
        }
      })
    }

    // build user tiles
    let htmlMyTiles = this.state.board.myTiles.map( (tile, key) => {
      let disabled = ''
      let css = {}
      if(this.state.board.table) {
        // see if this tile is on the table, if it is then disable it
        let tableTiles = this.state.board.table.filter( tableTile => tableTile === tile.value)
        if(tableTiles.length > 0) disabled = 'disabled'
        // get assoc image
        let img = IMAGE_MAP.get('image' + tile.value)
        css = { backgroundImage: `url(${img})` }
      }
      return (
        <div key={key} className={'tile ' + disabled} style={css}>
          <button onClick={() => this.updateTableInsertTile(tile.value)} disabled={disabled}>{(this.state.hints>1) ? tile.value : ''}</button>
        </div>
      )
    })

    // build hints
    let hintAttempts = game.hints.allowAfterPzAttempts - this.props.user.pzs[PZ_INDEX].attempts
    let hintDisabled = (hintAttempts > 0) ? 'disabled' : ''
    let htmlHintButton = (this.state.hints < HINTS.length) ? <button onClick={() => this.getHint()} disabled={hintDisabled}>Get Hint{(hintDisabled)?' After '+ hintAttempts +' more attempt(s)':''}</button> : ''
    let htmlHints = HINTS.map( (hint, key) => {
      // show the hint if its index is LESS than the user hint count
      if (key >= this.state.hints) return(<div key={key}></div>)
      return (
        <div key={key} className='hint'>
          <h3>{hint.title}</h3>
          <p>
            {(hint.subTitle) ? <strong>{hint.subTitle}<br/></strong> : ''}
            {hint.body}
          </p>
        </div>
      )
    })

    return(
      <div id="jigsaw-board-wrapper" className='component-wrapper component-pz'>
        <h2>Score:<br/>{this.state.score.round} / {this.state.score.total} / {this.state.score.max}</h2>
        round / total / max<br/>
        hint cost: {this.state.score.hintCost}<br/>

        {htmlHintButton}
        {htmlHints}

        <img src={this.state.clock} width="50px" />

        <div className='table-wrapper'>{htmlTable}</div>
        <div className='my-tiles-wrapper'>{htmlMyTiles}</div>
      </div>
    )
  }
}

// FUNCS

const genSettingsPz2 = (props) => {
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
      ['A00', 'A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08' ],
      ['B00', 'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08' ]
    ]
    let shuffledItems = shuffleArray(solution[round])
    // DEAL ITEMS to users
    let userIndex = 0
    shuffledItems.forEach((index, key) => {
        settingsUsers[userIndex].tiles.push(shuffledItems[key])
        userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
    })
    // settings = rounds[#][users][#] {...} with user data
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

export default Pz2

export {
  genSettingsPz2
}
