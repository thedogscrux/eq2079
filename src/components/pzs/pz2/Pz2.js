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
import { showAlert } from '../../Alert'

import AI from '../../AI'

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

import imageC00 from './images/C00.jpg'
import imageC01 from './images/C01.jpg'
import imageC02 from './images/C02.jpg'
import imageC03 from './images/C03.jpg'
import imageC04 from './images/C04.jpg'
import imageC05 from './images/C05.jpg'
import imageC06 from './images/C06.jpg'
import imageC07 from './images/C07.jpg'
import imageC08 from './images/C08.jpg'

import imageD00 from './images/D00.jpg'
import imageD01 from './images/D01.jpg'
import imageD02 from './images/D02.jpg'
import imageD03 from './images/D03.jpg'
import imageD04 from './images/D04.jpg'
import imageD05 from './images/D05.jpg'
import imageD06 from './images/D06.jpg'
import imageD07 from './images/D07.jpg'
import imageD08 from './images/D08.jpg'

import imageE00 from './images/E00.jpg'
import imageE01 from './images/E01.jpg'
import imageE02 from './images/E02.jpg'
import imageE03 from './images/E03.jpg'
import imageE04 from './images/E04.jpg'
import imageE05 from './images/E05.jpg'
import imageE06 from './images/E06.jpg'
import imageE07 from './images/E07.jpg'
import imageE08 from './images/E08.jpg'

import imageF00 from './images/F00.jpg'
import imageF01 from './images/F01.jpg'
import imageF02 from './images/F02.jpg'
import imageF03 from './images/F03.jpg'
import imageF04 from './images/F04.jpg'
import imageF05 from './images/F05.jpg'
import imageF06 from './images/F06.jpg'
import imageF07 from './images/F07.jpg'
import imageF08 from './images/F08.jpg'

import imageG00 from './images/G00.jpg'
import imageG01 from './images/G01.jpg'
import imageG02 from './images/G02.jpg'
import imageG03 from './images/G03.jpg'
import imageG04 from './images/G04.jpg'
import imageG05 from './images/G05.jpg'
import imageG06 from './images/G06.jpg'
import imageG07 from './images/G07.jpg'
import imageG08 from './images/G08.jpg'

import imageH00 from './images/H00.jpg'
import imageH01 from './images/H01.jpg'
import imageH02 from './images/H02.jpg'
import imageH03 from './images/H03.jpg'
import imageH04 from './images/H04.jpg'
import imageH05 from './images/H05.jpg'
import imageH06 from './images/H06.jpg'
import imageH07 from './images/H07.jpg'
import imageH08 from './images/H08.jpg'

const PZ_INDEX = 1
const PZ_PROPS = propsPzs[PZ_INDEX]

const HINTS = [
  {
    title: 'Hint One',
    body: '...'
  },
  {
    title: 'Hint Two',
    subTitle: 'This is your last hint.',
    body: '....'
  }
]

//const IMAGE_SET = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H' ]

const IMAGE_MAP = new Map([
    [ 'imageA00', imageA00 ], [ 'imageA01', imageA01 ], [ 'imageA02', imageA02 ],
    [ 'imageA03', imageA03 ], [ 'imageA04', imageA04 ], [ 'imageA05', imageA05 ],
    [ 'imageA06', imageA06 ], [ 'imageA07', imageA07 ], [ 'imageA08', imageA08 ],
    [ 'imageB00', imageB00 ], [ 'imageB01', imageB01 ], [ 'imageB02', imageB02 ],
    [ 'imageB03', imageB03 ], [ 'imageB04', imageB04 ], [ 'imageB05', imageB05 ],
    [ 'imageB06', imageB06 ], [ 'imageB07', imageB07 ], [ 'imageB08', imageB08 ],
    [ 'imageC00', imageC00 ], [ 'imageC01', imageC01 ], [ 'imageC02', imageC02 ],
    [ 'imageC03', imageC03 ], [ 'imageC04', imageC04 ], [ 'imageC05', imageC05 ],
    [ 'imageC06', imageC06 ], [ 'imageC07', imageC07 ], [ 'imageC08', imageC08 ],
    [ 'imageD00', imageD00 ], [ 'imageD01', imageD01 ], [ 'imageD02', imageD02 ],
    [ 'imageD03', imageD03 ], [ 'imageD04', imageD04 ], [ 'imageD05', imageD05 ],
    [ 'imageD06', imageD06 ], [ 'imageD07', imageD07 ], [ 'imageD08', imageD08 ],
    [ 'imageE00', imageE00 ], [ 'imageE01', imageE01 ], [ 'imageE02', imageE02 ],
    [ 'imageE03', imageE03 ], [ 'imageE04', imageE04 ], [ 'imageE05', imageE05 ],
    [ 'imageE06', imageE06 ], [ 'imageE07', imageE07 ], [ 'imageE08', imageE08 ],
    [ 'imageF00', imageF00 ], [ 'imageF01', imageF01 ], [ 'imageF02', imageF02 ],
    [ 'imageF03', imageF03 ], [ 'imageF04', imageF04 ], [ 'imageF05', imageF05 ],
    [ 'imageF06', imageF06 ], [ 'imageF07', imageF07 ], [ 'imageF08', imageF08 ],
    [ 'imageG00', imageG00 ], [ 'imageG01', imageG01 ], [ 'imageG02', imageG02 ],
    [ 'imageG03', imageG03 ], [ 'imageG04', imageG04 ], [ 'imageG05', imageG05 ],
    [ 'imageG06', imageG06 ], [ 'imageG07', imageG07 ], [ 'imageG08', imageG08 ],
    [ 'imageH00', imageH00 ], [ 'imageH01', imageH01 ], [ 'imageH02', imageH02 ],
    [ 'imageH03', imageH03 ], [ 'imageH04', imageH04 ], [ 'imageH05', imageH05 ],
    [ 'imageH06', imageH06 ], [ 'imageH07', imageH07 ], [ 'imageH08', imageH08 ]
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
      render: false,
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
    let tableNew = value.rounds[this.state.round-0].table || []
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
    let roundKey = (round) ? round-0 : this.state.round-0
    if(!this.state.rounds[roundKey]) return
    console.log('this.state',this.state);
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
      userKey: userKey,
      render: true
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
    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)

    // build table contents
    let htmlTable = ''
    if(this.state.rounds[this.state.round-0]) {
      htmlTable = this.state.rounds[this.state.round-0].solution.map( (tile, key) => {
        let innerHtml = ''
        let css = {}
        if(!this.state.board.table) return (<div key={key} className='tile'></div>)
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
      let tileHintNum = parseInt(tile.value.substr(2)) + 1
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
          <button onClick={() => this.updateTableInsertTile(tile.value)} disabled={disabled}>{(this.state.hints>1) ? tileHintNum : ''}</button>
        </div>
      )
    })

    return(
      <div id="jigsaw-board-wrapper" className='component-wrapper component-pz'>
        <AI />
        
        {htmlScore}
        <Hints
          hints={HINTS}
          hintsCount={this.state.hints}
          userAttempts={this.props.user.pzs[PZ_INDEX].attempts}
          getHint={() => this.getHint()}
        />
        <button onClick={() => this.props.endRound(true)} className='cancel-button'>cancel game</button>

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
      ['B00', 'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08' ],
      ['C00', 'C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08' ],
      ['D00', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08' ],
      ['E00', 'E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'E07', 'E08' ],
      ['F00', 'F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08' ],
      ['G00', 'G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07', 'G08' ],
      ['H00', 'H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H07', 'H08' ]
    ]
    let maxDifficulty = (round + 1) * 3
    if (maxDifficulty > solution.length) maxDifficulty = solution.length
    let solutionIndex = random.integer(maxDifficulty - 3, maxDifficulty - 1)
    if (solutionIndex === 5 && round === 2) solutionIndex = 6 // hack to avoid getting the same pz twice in a row
    let shuffledItems = shuffleArray(solution[solutionIndex])
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
