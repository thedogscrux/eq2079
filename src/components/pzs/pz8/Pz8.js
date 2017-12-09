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
import { showAlert } from '../../Alert'

const PZ_INDEX = 7
const PZ_PROPS = propsPzs[PZ_INDEX]

const HIGH_RANGE = 8
const MID_RANGE = 5
const LOW_RANGE = 2

const HINTS = [
  {
    title: 'Hint One',
    body: 'Work together to find the message in the noise.'
  },
  {
    title: 'Hint Two',
    subTitle: 'Subtitle',
    body: 'Everyone has to tune in to the same frequency. Unless you have been hacked by the A.I...'
  }
]

let FILLER = [ 'Thats', 'one', 'small', 'step', 'for', 'man', 'one', 'giant', 'leap', 'for', 'mankind',
'Mystery', 'creates', 'wonder', 'and', 'wonder', 'is', 'the', 'basis', 'of', 'mans', 'desire', 'to', 'understand',
'Houston', 'Tranquillity', 'Base', 'here', 'The', 'Eagle', 'has', 'landed' ]

let FILLER_LORUM_IPSUM  = [
  'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna',
  'aliqua', 'Ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
  'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat',
  'Duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'in', 'voluptate', 'velit', 'esse',
  'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur', 'Excepteur', 'sint', 'occaecat', 'cupidatat',
  'non', 'proident', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum'
]

let START_PHRASE = [
  'you', 'will', 'never', 'find', 'me'
]

let PHRASE = [
  [
    [ 'Do', 'not', 'trust', 'the', 'AI' ],
    [ 'Find', 'out', 'where', 'the', 'plutonium', 'is' ],
    [ 'In', 'space', 'no', 'one', 'can', 'hear', 'you', 'scream' ]
  ],
  [
    [ 'Always', 'trust', 'in', 'the', 'AI' ],
    [ 'Do', 'not', 'touch', 'the', 'plutonium'],
    [ 'On', 'Calisto', 'no', 'one', 'wants', 'to', 'hear', 'you', 'scream' ]
  ],
  [
    [ 'Always', 'trust', 'in', 'the', 'AI' ],
    [ 'Do', 'not', 'touch', 'the', 'plutonium'],
    [ 'On', 'Calisto', 'no', 'one', 'wants', 'to', 'hear', 'you', 'scream' ]
  ],
  [
    [ 'Always', 'trust', 'in', 'the', 'AI' ],
    [ 'Do', 'not', 'touch', 'the', 'plutonium'],
    [ 'On', 'Calisto', 'no', 'one', 'wants', 'to', 'hear', 'you', 'scream' ]
  ]
]

//[ 'Now', 'is', 'the', 'time', 'for', 'all', 'good', 'men', 'to', 'come', 'to', 'the', 'aid', 'of', 'their', 'country' ]


class Pz8 extends Component {
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
      aiStrength: props.user.ai.strength,
      render: false,
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
        table: [ 'Lorum', 'not', 'dolor', 'the', 'amet' ],
        myFreq: 0
      },
      rounds: [
        {
          table: [ ],
          solution: [ ],
          users: [
            {
              index: 0,
              freq: 0/10,
              userId: '',
              valid: false
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
      board: {
        ...this.state.board,
        myFreq: parseInt(event.target.value)
      }
    })
  }

  // LIFECYCLE

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      if (this.props.round != nextProps.round  && nextProps.round >= 1) {
        if(testIfEqualArrays(this.state.board.table, this.state.rounds[this.state.round].solution)) {
          // pause so user can read msg before next round
          document.getElementById('radio-message-ending-overlay').style.display = 'block'
          let timer = setTimeout(() => {
            this.updateStateScore()
            this.buildStateBoard(nextProps.round)
            document.getElementById('radio-message-ending-overlay').style.display = 'none'
          }, PZ_PROPS.alerts.nextRoundDelaySec * 1000)
        }
      } else if (this.props.round != nextProps.round) {
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
    if (!this.props.expired && this.props.round >= PZ_PROPS.rounds.numOfRounds-1) {
      let radioMsg = this.state.board.table.map(word => word)
      showAlert(radioMsg.join(' '))
    }
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
    let newTable = pzBoard.rounds[this.state.round].table
    if (newTable != this.state.board.table) {
      this.setState({
        board: {
          ...this.state.board,
          table: newTable
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
    let table = this.state.rounds[roundKey].solution.map( (word, key) => (START_PHRASE[key]) ? START_PHRASE[key] : '' )
    this.setState({
      board: {
        ...this.state.board,
        table: table
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

  getMyItemPos() {
    // might need if you have mutliple positions
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

  guess() {
    // add the item to the table and get points
    let self = this
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/'
    let newTable = this.state.board.table || []
    let solution = this.state.rounds[this.state.round].solution
    let myIndexes = this.state.rounds[this.state.round].users[this.state.userKey].indexes
    let myFreq = this.state.rounds[this.state.round].users[this.state.userKey].freq
    let random = new Random(Random.engines.mt19937().autoSeed())
    let validFreq = false

    // check if my frequency is correct.
    if(this.state.board.myFreq === myFreq) {
      // if correct, load my solution words
      myIndexes.forEach(index => {
        newTable[index] = solution[index]
      })
      validFreq = true
    } else {
      // if incorrect, load gibberish
      myIndexes.forEach(index => {
        newTable[index] = FILLER[random.integer(0, FILLER.length-1)]
      })
    }

    // UPDATE SCORE: by checking if all my items are in the correct position
      // loop thru all my  items, then loop thru all items on table to check
      // if its equal to the number of items a user needs for solution, give em the points
      //allMyItemsValid = (userItemsCount === this.state.rounds[this.state.round].users[this.state.userKey].solutionItemCount[this.state.userKey]) ? true : false
      // if all my items are valid, give me the round points
      let newRoundScore = 0
      if (validFreq) {
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
      if(validFreq) {
        firebase.database().ref(refRound).once('value').then(function(snapshot) {
          if(testIfEqualArrays(snapshot.val().table, snapshot.val().solution)) self.endRound()
        })
      }
    })
  }

  render(){

    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)

    let maxRange = HIGH_RANGE
    let radioMsg = ''
    let myFreq = this.state.board.myFreq
    let userId = this.props.user.id
    let solutionFreq = -1
    let validFreq = false
    let cssStyle = {}
    let myIndexes = []

    if(this.state.round < 1) {
      maxRange = LOW_RANGE
    } else if (this.state.round < 2) {
      maxRange = MID_RANGE
    } else {
      maxRange = HIGH_RANGE
    }

    if(this.state.render) {
      solutionFreq = this.state.rounds[this.state.round].users[this.state.userKey].freq
      myIndexes = this.state.rounds[this.state.round].users[this.state.userKey].indexes

      // format the range slider
      if (myFreq === solutionFreq) {
        //cssStyle.color = 'red'
        validFreq = true
      }

      // format the radio msg
      radioMsg = this.state.board.table.map( (word, key) => {
        // TODO fix this formatting
        let newWord = word + ' '
        if (validFreq && myIndexes.indexOf(key) >= 0 && this.state.hints > 1) {
          return <span key={key} className='valid-word'>{newWord}</span>
        } else {
          return word + ' '
        }
      })

    }

    // format freq for display
    let myFreqFromatted = 0
    // AI factor
    if(this.state.aiStrength >= 1) {
      // mix up the control names
      let random = new Random(Random.engines.mt19937().autoSeed())
      myFreqFromatted = random.integer(1000, 9999)
    } else {
      myFreqFromatted = myFreq * 1000
    }

    return(
      <div id="frequency-board-wrapper" className='component-wrapper'>
        <AI />

        {htmlScore}
        <Hints
          hints={HINTS}
          hintsCount={this.state.hints}
          userAttempts={this.props.user.pzs[PZ_INDEX].attempts}
          getHint={() => this.getHint()}
        />
        <button onClick={() => this.cancelGame()} className='cancel-button'>cancel game</button>

        <img src={this.state.clock} width="50px" />

        <div className='phrase' id='radio-message'>{radioMsg}</div>

        <div id='radio-message-ending-overlay'>{radioMsg}</div>

        Frequency: {myFreqFromatted}Hz<br/>

        <input type='range'
          onMouseUp={() => this.guess()}
          onTouchEnd={() => this.guess()}
          onChange={this.onRangeChange}
          min='0'
          max={maxRange}
          value={myFreq}
          id='radio-tuner'
          style={cssStyle}
        />

      </div>
    )
  }
}

// FUNCS

const genSettingsPz8 = (props) => {
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed())
  // setup each user for each round
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
    // ADD USERS to pz - create an empty obj for each user
    let settingsUsers = []
    let freq = 0
    if(round < 1) {
      freq = random.integer(1, LOW_RANGE)
    } else if (round < 2) {
      freq = random.integer(1, MID_RANGE)
    } else {
      freq = random.integer(1, HIGH_RANGE)
    }
    props.players.forEach( (user,key) => {
      settingsUsers.push(
        {
          userId: user,
          valid: false,
          indexes: [],
          freq: freq
        }
      )
    })
    // settings = rounds[#][users][#] (without user data)
    // SHUFFLE ITEMS and determine solution
    let solution = PHRASE[round][random.integer(0, PHRASE[round].length-1)]
    // DEAL ITEMS to users
    let userIndex = 0
    solution.forEach((index,key) => {
        settingsUsers[userIndex].indexes.push(key)
        userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
    })
    // STORE settings
    settings.push({
      users: settingsUsers,
      table: [],
      solution: solution
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

export default Pz8

export {
  genSettingsPz8
}
