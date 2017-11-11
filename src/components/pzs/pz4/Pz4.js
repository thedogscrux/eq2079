import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'

import clock0 from '../../../images/pz/clock/clock-0.svg'
import clock4 from '../../../images/pz/clock/clock-4.svg'

import shape01 from './images/PzShape01.svg'
import shape02 from './images/PzShape02.svg'

import { propsPzs } from '../../../data/propsPzs.js'

const pzIndex = 3
const pzProps = propsPzs[pzIndex]

const shapeMap = [
  shape01, shape02
]

class Pz4 extends Component {
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
        bars: [
          {
            position: 0,
            solution: 0,
            index: 0
          }
        ]
      },
      rounds: [
        {
          users: [
            {
              bars: [
                {
                  index: 4,
                  solution: 3
                }, {
                  index: 5,
                  solution: 3
                }
              ],
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
      if (this.props.round != nextProps.round) this.buildStateBoard(nextProps.round)
      this.setState({
        round: nextProps.round,
        clock: nextProps.clock,
      })
    }
  }

  componentWillMount() {
    this.getSettings()
  }

  componentWillUnmount() {
    let self = this
    let score = this.endGame()
    firebase.database().ref('/pzs/' + pzIndex + '/status').once('value').then(function(snapshot){
      if(snapshot.val() === 'inactive') self.props.endGame(score)
    })
  }

  // SETUP BOARD

  getSettings() {
    var self = this
    let once = firebase.database().ref('/boards/pz4').once('value').then(function(snapshot){
      if(self._ismounted) {
        console.log('1 - SET settings');
        self.setStateRounds(snapshot.val())
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
      console.log('3 - SET settings');
      this.setState({
        rounds: settings.rounds
      })
      //this.getMyItemPos()
    } else {
      console.log('4 - SET settings');
      this.setState({
        rounds: settings.rounds
      })
      //this.getMyItemPos()
    }
  }

  buildStateBoard(round) {
    console.log('* build board *');
    let userId = this.props.user.id
    let roundKey = (round) ? round-1 : this.state.round-1
    let roundUser = this.state.rounds[roundKey].users.filter( user => user.userId == userId )
    let userBars = roundUser[0].bars.map( bar => {
      return {
        position: 2,
        solution: bar.solution,
        index: bar.index
      }
    })
    this.setState({
      board: {
        bars: userBars
      }
    })
  }

  getMyUserKey() {
    // loop thru all users in round to find me
    let userKey = -1
    let userId = this.props.user.id
    this.state.rounds[this.state.round-1].users.filter((user,key) => {
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

  guess() { }

  submitGuess(guess) { }

  updateBarPos(barKey, index, position) {
    // update the bar position and check if valid
    let self = this
    let newBars = {
      ...this.state.board.bars,
      [barKey]: {
        ...this.state.board.bars[barKey],
        position: position
      }
    }
    this.setState({
      board: {
        ...this.state.board,
        bars: newBars
      }
    })
    // loop thru all bars and if any are incorrect, user is not valid
    let valid = true
    Object.keys(newBars).map( barKey => {
      if (newBars[barKey].solution !== newBars[barKey].position) valid = false
    })
    if (this.state.valid != valid) {
      let refUsers = '/boards/pz4/rounds/' + (this.state.round-1) + '/users/'
      if (valid) {
        console.log('*** user items all valid! ***');
        this.setState({ valid: true })
        firebase.database().ref(refUsers + this.state.userKey + '/').update({
          valid: valid
        }).then(function(){
          // if all users are valid, end the round
          firebase.database().ref(refUsers).once('value').then(function(snapshot) {
            let users = snapshot.val();
            let endRound = true
            users.map(user => {
              if(user.valid == false) endRound = false
            })
            if(endRound) self.endRound()
          })
        })
      } else {
        this.setState({ valid: false })
        firebase.database().ref(refUsers + this.state.userKey + '/').update({
          valid: false
        })
      }
    }
  }

  render(){
    // loop thru all user bars
    const htmlBars = Object.keys(this.state.board.bars).map( barKey => {
      let bar = this.state.board.bars[barKey]
      let bgColor = 'gray'
      switch (bar.index) {
        case 0:
          bgColor = 'rgb(204,0,0)'
          break;
        case 1:
          bgColor = 'rgb(204,204,0)'
          break;
        case 2:
          bgColor = 'rgb(0,102,204)'
          break;
        case 3:
          bgColor = 'rgb(0,153,0)'
          break;
        case 4:
          bgColor = 'rgb(153,0,204)'
          break;
        case 5:
          bgColor = 'rgb(204,102,0)'
          break;
      }
      // check position of bar
      let position = this.state.board.bars[barKey].position
      return (
        <div key={barKey} style={{ backgroundColor: bgColor }} className='bar'>
          <button onClick={() => this.updateBarPos(barKey, bar.index, 0)} className={(position === 0) ? 'active' : ''}>{/*index: {bar.index} , pos: {bar.position} , {bar.solution}*/}</button>
          <button onClick={() => this.updateBarPos(barKey, bar.index, 1)} className={(position === 1) ? 'active' : ''}>{/*index: {bar.index} , pos: {bar.position} , {bar.solution}*/}</button>
          <button onClick={() => this.updateBarPos(barKey, bar.index, 2)} className={(position === 2) ? 'active' : ''}>{/*index: {bar.index} , pos: {bar.position} , {bar.solution}*/}</button>
          <button onClick={() => this.updateBarPos(barKey, bar.index, 3)} className={(position === 3) ? 'active' : ''}>{/*index: {bar.index} , pos: {bar.position} , {bar.solution}*/}</button>
          <button onClick={() => this.updateBarPos(barKey, bar.index, 4)} className={(position === 4) ? 'active' : ''}>{/*index: {bar.index} , pos: {bar.position} , {bar.solution}*/}</button>
        </div>
      )
    })
    let shape = shapeMap[this.state.round-1]
    return(
      <div id="shape-board-wrapper" className='component-wrapper'>
        <img src={this.state.clock} width="50px" />
        {htmlBars}
        {/*}<img src={shape} />*/}
      </div>
    )
  }
}

// FUNCS

const genSettingsPz4 = (props) => {
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
          valid: false,
          bars: []
        }
      )
    })
    // settings = rounds[#][users][#] (without user data)
    // SHUFFLE BARS and determine solution
    let shuffledBars = shuffle([0, 1, 2, 3, 4, 5])
    let solutions = [
      [ 1, 1, 1, 2, 2, 2 ],
      [ 3, 4, 0, 1, 4, 1 ]
    ]
    let solution = solutions[round]
    // DEAL BARS to users
    let userIndex = 0
    shuffledBars.forEach(index => {
        settingsUsers[userIndex].bars.push({
          index: shuffledBars[index],
          solution: solution[shuffledBars[index]]
        })
        userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
    })
    // settings = rounds[#][users][#] (with user data)
    // STORE settings
    settings.push({
      users: settingsUsers
    })
  }
  // calc total score
  let totalScore = 0
  // store all info in dbase
  firebase.database().ref('/boards/pz4').set({
    rounds: settings
  })
  //return settings
  return totalScore
}

const shuffle = (array) => {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

export default Pz4

export {
  genSettingsPz4
}
