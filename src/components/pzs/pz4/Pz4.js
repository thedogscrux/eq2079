import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'

import Score, { calcMaxScore, calcHintCost } from '../../../utils/Score.js'
import game from '../../../Settings.js'
import { propsPzs } from '../../../data/propsPzs.js'
import Hints from '../../Hints.js'

import shape01 from './images/PzShape01.svg'
import shape02 from './images/PzShape02.svg'

import key00 from './images/key01.png'
import key01 from './images/key01.png'
import key02 from './images/key02.png'
import key03 from './images/key03.png'
import key04 from './images/key04.png'

const PZ_INDEX = 3
const PZ_PROPS = propsPzs[PZ_INDEX]

const HINTS = [
  {
    title: 'Hint One',
    body: 'Use pattern X. Always use pattern X.'
  },
  {
    title: 'Hint Two',
    subTitle: 'Subtitle',
    body: '...'
  }
]

const shapeMap = [
  shape01, shape02
]

const SOLUTION_KEYS = [
  key00, key01, key02, key03, key04
]

const SOLUTIONS = [
  [ 2, 4, 0, 1, 4, 1 ],
  [ 1, 1, 1, 3, 3, 3 ],
  [ 2, 3, 1, 4, 1, 4 ],
  [ 4, 4, 1, 3, 0, 0 ],
  [ 0, 4, 0, 4, 0, 4 ]
]

class Pz4 extends Component {
  constructor(props){
    super(props)
    let score = new Score(PZ_INDEX)
    let baseState = {
      points: 0,
      round: props.round,
      totalScore: 0,
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
  }

  componentWillUnmount() {
    let self = this
    let score = this.endGame()
    firebase.database().ref('/pzs/' + PZ_INDEX + '/status').once('value').then(function(snapshot){
      if(snapshot.val() === 'inactive') self.props.endGame(score)
    })
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
    let once = firebase.database().ref('/boards/pz4').once('value').then(function(snapshot){
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
    let roundKey = (round) ? round-0 : this.state.round-0
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
      let refUsers = '/boards/pz4/rounds/' + (this.state.round-0) + '/users/'
      let newRoundScore = 0
      if (valid) {
        console.log('*** user items all valid! ***');
        newRoundScore = (game.score.round < this.state.score.max) ? game.score.round : this.state.score.max
        this.setState({
          valid: true,
          score: {
            ...this.state.score,
            round: newRoundScore
          }
        })
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
        this.setState({
          valid: false,
          score: {
            ...this.state.score,
            round: 0
          }
        })
        firebase.database().ref(refUsers + this.state.userKey + '/').update({
          valid: false
        })
      }
    }
  }

  render(){

    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)

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
    let shape = shapeMap[this.state.round-0]
    // get solution key
    let solutionKeyImage = ''
    if(this.state.rounds[this.state.round]) {
      //console.log('this.state.rounds[this.state.round].solutionKey',this.state.rounds[this.state.round].solutionKey);
      solutionKeyImage = SOLUTION_KEYS[this.state.rounds[this.state.round].solutionKey]
    }
    return(
      <div id="shape-board-wrapper" className='component-wrapper'>
        {htmlScore}
        <Hints
          hints={HINTS}
          hintsCount={this.state.hints}
          userAttempts={this.props.user.pzs[PZ_INDEX].attempts}
          getHint={() => this.getHint()}
        />
        <button onClick={() => this.cancelGame()} className='cancel-button'>cancel game</button>

        <img src={this.state.clock} width="50px" /><br/>

        <img src={solutionKeyImage} className='key'/>

        {/*}<img src={shape} />*/}

        {htmlBars}
      </div>
    )
  }
}

// FUNCS

const genSettingsPz4 = (props) => {
  console.log('** generate settings **')
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed());
  let solutionIndexes = [ 1 ] // always start with teh esiest Pz
  let solutions = [ SOLUTIONS[1] ] // always start with teh esiest Pz
  //get solutions
  for(let i=1; i<PZ_PROPS.rounds.numOfRounds;) {
    let index = random.integer(0, 5)
    // keep track of each solution you are using so you dont use the same one twice in a game
    if(solutionIndexes.indexOf(index) === -1) {
      solutionIndexes.push(index)
      solutions.push(SOLUTIONS[index])
      ++i;
    }
  }
  console.log('solutions',solutions);
  // setup each user for each round
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
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
      solutionKey: solutionIndexes[round],
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
