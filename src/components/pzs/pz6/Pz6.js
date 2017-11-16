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

const PZ_INDEX = 5
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

const SOLUTIONS = [
  [ 1, 2, 3, 4, 5 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
  [ 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
]

const DIFFICULTY = [ 'easy', 'medium', 'hard' ]

const LIQUIDS = [
  'black',
  'red',
  'yellow',
  'cyan',
  'blue',
  'magenta',
  'BlueViolet',
  'BlanchedAlmond',
  'Coral',
  'DarkGreen',
  'Grey'
]

class Pz6 extends Component {
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
      sliderValue: 0,
      board: {
        solution: 0,
        val: 0,
        valid: false,
        difficulty: 0,
        table: [

        ]
      },
      rounds: [
        {
          difficulty: 0,
          solution: [ 1, 2, 3 ],
          users: [
            {
              userId: '',
              val: 0,
              solution: 0
            }
          ]
        },
        {
          difficulty: 'hard',
          solution: [ 1, 2, 3 ],
          users: [
            {
              userId: '',
              val: 0,
              solution: 0
            },
            {
              userId: '',
              val: 0,
              solution: 0
            }
          ]
        }
      ]
    }
    this.onRangeChange = this.onRangeChange.bind(this)

  }

  // HANDLERS
  onRangeChange(event) {
    this.setState({
      sliderValue: parseInt(event.target.value)
    })
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
    //React.initializeTouchEvents(true);
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
        valid: false,
        solution: roundUser[0].solution,
        val: 0,
        difficulty: this.state.rounds[roundKey].difficulty,
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
    // add the item to the table and get points
    let self = this
    let guessVal = this.state.sliderValue
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/users/'
    let refUser = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/users/' + this.state.userKey
    let solutionVal = this.state.rounds[this.state.round].users[this.state.userKey].solution
    //let newTable = Object.assign([], this.state.board.table)
    let newUser = Object.assign([], this.state.rounds[this.state.round].users[this.state.userKey])
    let newRounds = Object.assign([], this.state.rounds)

    // add value to table
    //tableNew.push(item)


    // UPDATE SCORE: by checking if all my items are in the correct position
      // loop thru all my  items, then loop thru all items on table to check
      console.log('solutionVal',solutionVal);
      let userValid = (guessVal === solutionVal) ? true : false

      // if its equal to the number of items a user needs for solution, give em the points
      //allMyItemsValid = (userItemsCount === this.state.rounds[this.state.round].users[this.state.userKey].solutionItemCount[this.state.userKey]) ? true : false
      // if all my items are valid, give me the round points
      let newRoundScore = 0
      if (userValid) {
        newRoundScore = (game.score.round < this.state.score.max) ? game.score.round : this.state.score.max
      }
      this.setState({
        score: {
          ...this.state.score,
          round: newRoundScore
        }
      })

    // update my data
    newRounds[this.state.round].users[this.state.userKey] = newUser

    this.setState({
      rounds: newRounds
    })

    // update the table on the dbase
    firebase.database().ref(refUser).update({
      val: guessVal,
      valid: userValid
    }).then(function(){
      // check if table is valid, if so, end the round
      if(userValid) {
        firebase.database().ref(refRound).once('value').then(function(snapshot) {
          console.log('snapshot.val()',snapshot.val());
          let allUsersValid = true
          snapshot.val().map(user => {
            if(!user.valid) allUsersValid = false
          })
          if(allUsersValid) self.endRound()
        })
      }
    })
  }

  render(){

    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)
    let myVal = 0
    let solution = this.state.board.solution
    let difficulty = this.state.board.difficulty
    let cssClassLiquid = 'liquid-' + solution

    // style the slide containers depending on how many there are
    let cssClassSlidecontainer = (difficulty === 0) ? 'small' : (difficulty === 1) ? 'medium' : 'large'

    if(this.state.board.table && this.state.rounds[this.state.round].users[this.state.userKey]){
      myVal = this.state.rounds[this.state.round].users[this.state.userKey].val
      //solution = this.state.board.solution
    }

    let htmlSliderHard = ''
    if (difficulty >= 2) {
      htmlSliderHard =
        <div className={'slidecontainer ' + cssClassSlidecontainer}>
          <input type='range'
            min='1'
            max='5'
            value={this.state.sliderValue}
            className={'slider ' + cssClassLiquid}
          />
        </div>
    }

    return(
      <div id="volume-board-wrapper" className='component-wrapper'>
        {htmlScore}
        <Hints
          hints={HINTS}
          hintsCount={this.state.hints}
          userAttempts={this.props.user.pzs[PZ_INDEX].attempts}
          getHint={() => this.getHint()}
        />

        difficulty: {difficulty}<br/>
        slider Value: {this.state.sliderValue}<br/>
        db val: {myVal}<br/>
        solution: {solution}<br/>

        <div id='sliderWrappers'>
          <div className={'slidecontainer ' + cssClassSlidecontainer}>
            <input type='range'
              onMouseUp={() => this.guess()}
              onTouchEnd={() => this.guess()}
              onChange={this.onRangeChange}
              min='1'
              max='5'
              value={this.state.sliderValue}
              className={'slider ' + cssClassLiquid}
              id='myRange'
            />
          </div>

          <div className={'slidecontainer ' + cssClassSlidecontainer}>
            <input type='range'
              min='1'
              max='5'
              value={this.state.sliderValue}
              className={'slider ' + cssClassLiquid}
            />
          </div>

          {htmlSliderHard}

        </div>

      </div>
    )
  }
}

// FUNCS

const genSettingsPz6 = (props) => {
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed())
  // setup each user for each round
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
    // DIFFICULTY
    let difficulty = 0
    if (round >= 2) {
      difficulty = 2
    } else if (round >= 1) {
      difficulty = 1
    }

    // ADD USERS to pz - create an empty obj for each user
    let settingsUsers = []
    props.players.forEach( (user,key) => {
      settingsUsers.push(
        {
          userId: user,
          valid: false,
          solution: 0,
          val: 0
        }
      )
    })
    // settings = rounds[#][users][#] (without user data)
    // SHUFFLE ITEMS and determine solution
    let solution = []
    settingsUsers.forEach( user => {
      solution.push(SOLUTIONS[difficulty][random.integer(0, 4)])
    })
    // DEAL ITEMS to users
    solution.forEach( (solution, key) => {
        settingsUsers[key].solution = solution
    })
    // settings = rounds[#][users][#] (with user data)
    // STORE settings
    settings.push({
      users: settingsUsers,
      table: [],
      solution: solution,
      difficulty: difficulty
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

export default Pz6

export {
  genSettingsPz6
}
