import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'

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

import { propsPzs } from '../../../data/propsPzs.js'

const pzIndex = 1
const pzProps = propsPzs[pzIndex]

const imageMap = new Map([
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
    let baseSate = {
      points: 0,
      round: props.round,
      totalScore: 0,
      user: props.user,
      clock: props.clock,
      valid: false
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
      if (this.props.round != nextProps.round) this.buildStateBoard(nextProps.round)
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
    firebase.database().ref('/pzs/' + pzIndex + '/status').once('value').then(function(snapshot){
      if(snapshot.val() === 'inactive') self.props.endGame(score)
    })
  }

  // WATCH DB

  unwatchDB() {
    firebase.database().ref('/boards/' +  pzProps.code).off()
  }

  watchDB() {
    var self = this
    firebase.database().ref('/boards/' +  pzProps.code).on('value', function(snapshot){
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

  // SETUP BOARD

  getSettings() {
    var self = this
    let once = firebase.database().ref('/boards/' + pzProps.code).once('value').then(function(snapshot){
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
    let roundUser = this.state.rounds[roundKey].users.filter( user => user.userId == userId )
    let userTiles = roundUser[0].tiles.map( (tile, key) => {
      return {
        enabled: true,
        image: 0,
        tileKey: 0,
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
    this.props.endRound()
  }

  endGame(){
    let score = 0
    // calc user score (final score calculated in Pz parent)
    return score
  }

  // GUESS

  guess() {
    let points = this.state.points + 1
    this.setState({
      points: points
    })
  }

  submitGuess(guess) { }

  updateTableInsertTile(tileValue) {
    // append tile to table array
    let self = this
    let refRound = '/boards/' + pzProps.code + '/rounds/' + (this.state.round-0) + '/'
    let tableNew = this.state.board.table || []
    tableNew.push(tileValue)
    let lastTilePlaced = (tableNew.length >= this.state.rounds[this.state.round-0].solution.length) ? true : false
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
    let refRound = '/boards/' + pzProps.code + '/rounds/' + (this.state.round-0) + '/'
    let tableNew = this.state.board.table || []
    tableNew.pop()
    firebase.database().ref(refRound).update({
      table: tableNew
    })
  }

  render(){
    // build table contents
    // console.log('hold for bug, this.state.rounds',this.state.rounds);
    // console.log('hold for bug: this.state.round', this.state.round);
    let htmlTable = ''
    if(this.state.rounds[this.state.round-0]) {
      htmlTable = this.state.rounds[this.state.round-0].solution.map( (tile, key) => {
        let innerHtml = ''
        let css = {}
        if(!this.state.board.table) return (<div key={key} className='cell'></div>)
        // insert tile in table array
        if(this.state.board.table[key]) {
          //innerHtml = this.state.board.table[key]
          let img = imageMap.get('image' + this.state.board.table[key])
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
        // if table has content, test for disabled any tiles placed on table
        let tableTiles = this.state.board.table.filter( tableTile => tableTile === tile.value)
        if(tableTiles.length > 0) disabled = 'disabled'
        // get assoc image
        let img = imageMap.get('image' + tile.value)
        css = { backgroundImage: `url(${img})` }
      }
      return (
        <div key={key} className={'tile ' + disabled} style={css}>
          <button onClick={() => this.updateTableInsertTile(tile.value)} disabled={disabled}>{/*tile.value*/}</button>
        </div>
      )
    })

    return(
      <div id="jigsaw-board-wrapper" className='component-wrapper'>
        <img src={this.state.clock} width="50px" />
        <div className='table-wrapper'>{htmlTable}</div>
        <div className='my-tiles-wrapper'>{htmlMyTiles}</div>
      </div>
    )
  }
}

// FUNCS

const genSettingsPz2 = (props) => {
  console.log('** generate settings **')
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed());
  // setup each user for each round
  for(let round=0; round<pzProps.rounds.numOfRounds; round++){
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
    let shuffledItems = shuffle(solution[round])
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
  console.log('settings',settings);
  // calc total score
  let totalScore = 0
  // store all info in dbase
  firebase.database().ref('/boards/' + pzProps.code).set({
    rounds: settings
  })
  //return settings
  return totalScore
}

const shuffle = (array) => {
  let array2 = Object.assign([], array)
  var currentIndex = array2.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array2[currentIndex];
    array2[currentIndex] = array2[randomIndex];
    array2[randomIndex] = temporaryValue;
  }
  return array2;
}

const testIfEqualArrays = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default Pz2

export {
  genSettingsPz2
}
