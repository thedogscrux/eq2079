import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'

import { shuffleArray, testIfEqualArrays, removeArrayKey } from '../../../utils/Common.js'
import Score, { calcMaxScore, calcHintCost } from '../../../utils/Score.js'
import game from '../../../Settings.js'
import { propsPzs } from '../../../data/propsPzs.js'
import Hints from '../../Hints.js'
import { showAlert } from '../../Alert'

import AI from '../../AI'

import clock0 from '../../../images/pz/clock/clock-0.svg'
import clock4 from '../../../images/pz/clock/clock-4.svg'

import item00 from './images/0-0.png'
import item01 from './images/0-1.png'
import item02 from './images/0-2.png'
import item03 from './images/0-3.png'
import item04 from './images/0-4.png'
import item10 from './images/1-0.png'
import item11 from './images/1-1.png'
import item12 from './images/1-2.png'
import item13 from './images/1-3.png'
import item14 from './images/1-4.png'
import item20 from './images/2-0.png'
import item21 from './images/2-1.png'
import item22 from './images/2-2.png'
import item23 from './images/2-3.png'
import item24 from './images/2-4.png'

const PZ_INDEX = 0
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

const WALLART_CODES = [ 123, 456, 789 ]

const itemMap = {
  item00, item01, item02, item03, item04,
  item10, item11, item12, item13, item14,
  item20, item21, item22, item23, item24
}


class Pz1 extends Component {
  constructor(props){
    super(props)
    let score = new Score(PZ_INDEX)
    let baseSate = {
      points: 0,
      round: props.round,
      totalScore: 0,
      user: props.user,
      clock: props.clock,
      newKeys: '-------------',
      valid: false,
      hints: props.user.pzs[PZ_INDEX].hints,
      userKey: -1,
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
      ...baseSate,
      guessLabel: '',
      guessKey: '',
      guessCode: '',
      ans: '',
      ansKey: {x:'y'},
      rounds: {},
      indexRound: 0,
      indexColUser: 0,
      guessInput: '',
      myItemPos: [],
      selectedImgSrc: ''
    }
    this.handleChangeGuessCode = this.handleChangeGuessCode.bind(this)
  }

  // BIND

  handleChangeGuessCode(event) {
    // let newVal = Math.abs(event.target.value)
    // if (newVal > parseInt(event.target.max)) {
    //   newVal = parseInt((newVal/(1e1)),0)
    // }
    this.setState({ guessCode: event.target.value })
  }

  // WATCH

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      if (this.props.round != nextProps.round) {
        this.updateStateScore()
        this.getMyUserKey(nextProps.round)
      }
      this.setState({
        round: nextProps.round,
        clock: nextProps.clock,
        selectedImgSrc: '',
        valid: false
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
        total: newTotalScore,
        round: 0
      }
    })
  }

  // SETUP BOARD

  // TODO is this func necessary? redunant of setStateBoard()
  getSettings() {
    var self = this
    let once = firebase.database().ref('/boards/pz1/').once('value').then(function(snapshot){
      if(!self._ismounted) {
        self.setStateBoard(snapshot.val())
        self.getMyUserKey()
      }
      return
    })
    return
  }

  setStateBoard(settings){
    if(!this._ismounted) {
      this.setState({
        rounds: settings.rounds
      })
      this.getMyItemPos()
    }
  }

  getMyUserKey(round) {
    // loop thru all users in round to find me
    let userKey = -1
    let userId = this.props.user.id
    let roundKey = (round) ? round : this.state.round
    this.state.rounds[roundKey].filter((user,key) => {
      if (user.user == userId) userKey = key
      return
    })
    this.setState({
      userKey: userKey
    })
  }

  getMyItemPos() {
    // get my item Positions
    console.log('** gettting my item pos **');
    Object.keys(this.state.rounds).map((row, rowIndex) => {
      const inner = Object.keys(this.state.rounds[rowIndex]).map((user, colIndex) => {
        let userId = this.state.rounds[rowIndex][colIndex].user
        if(userId == this.props.user.id) {
          let src = itemMap['item' + rowIndex + colIndex]
          let code = this.state.rounds[rowIndex][colIndex].code
          let myItemPosArrary = this.state.myItemPos
          myItemPosArrary.push({
            src: src,
            code: code
          })
          this.setState({
            myItemPos: myItemPosArrary
          })
        }
      })
    })
  }

  // END GAME

  cancelGame() {
    this.props.endRound(true)
  }

  endRound() {
    this.props.endRound()
  }

  endGame(){
    // NEW METHOD
    let newTotalScore = this.state.score.round + this.state.score.total
    newTotalScore = (newTotalScore < this.state.score.max) ? newTotalScore : this.state.score.max
    // calc user score (final score calculated in Pz parent)
    return newTotalScore

    // OLD METHOD
    // let userId = this.props.user.id
    // let score = 0
    // // calc user score (final score calculated in Pz parent)
    // Object.keys(this.state.rounds).map((key, round) => {
    //   Object.keys(this.state.rounds[round]).map((key, userIndex) => {
    //     let user = this.state.rounds[round][userIndex]
    //     if(user.ans === true) {
    //       score++
    //     }
    //     return
    //   })
    //   return
    // })
    // return score
  }

  // GUESS

  getPoint(){
    let points = this.state.points + 1
    this.setState({
      points: points
    })
  }

  guess(key, item, ans, indexRound, indexColUser, selectedImgSrc) {
    document.getElementById('item-code').focus()
    this.setState({
      guessKey: key,
      guessLabel: item,
      ans: ans,
      indexRound: indexRound,
      indexColUser: indexColUser,
      selectedImgSrc: selectedImgSrc
    })
  }

  // HINT

  getHint() {
    let hint = HINTS[this.state.hints]
    let newHintCount = (this.state.hints < HINTS.length) ? this.state.hints + 1 : HINTS.length
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

  submitGuess(guess) {
    let self = this
    let userValid = true
    let ansValid = false
    let guessUserKey = this.state.indexColUser
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/'
    let refUser = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/' + this.state.userKey + '/'

    if (!this.state.selectedImgSrc) {
      showAlert('Select a piece of pipe first.')
      return
    }

    document.getElementById('item-code').value = ''
    this.setState({ guessCode: '' })
    if(parseInt(this.state.guessCode) === parseInt(this.state.ans)) {
      ansValid = true
      let newRounds = this.state.rounds
      newRounds[this.state.round][this.state.indexColUser].ans = true
      let newUsers = newRounds[this.state.round]
      this.setState({
        rounds: newRounds
      })
      // this.setState({
      //   rounds: {
      //     ...this.state.rounds,
      //     [this.state.indexRound]: {
      //       ...this.state.rounds[this.state.indexRound],
      //       [this.state.indexColUser]: {
      //         ...this.state.rounds[this.state.indexRound][this.state.indexColUser],
      //         ans: true
      //       }
      //     }
      //   }
      // })
      // check if all my answers are valid
      //let newUsers = this.state.rounds[this.state.round]
      Object.keys(newUsers).forEach( key => {
        if(key != this.state.userKey && newUsers[key].ans === false) userValid = false
      })
    } else {
      showAlert('Invalid Code. Try Again.')
    }
    document.getElementById('item-code').focus()

    if (!ansValid) return

    // UPDATE SCORE: by checking if all my items are in the correct position
      // if all my items are valid, give me the round points
      let newRoundScore = 0
      if (userValid) {
        newRoundScore = (game.score.round < this.state.score.max) ? game.score.round : this.state.score.max
      }
      this.setState({
        score: {
          ...this.state.score,
          round: newRoundScore
        },
        valid: userValid
      })

    // update the table on the dbase
    firebase.database().ref(refUser).update({
      ans: ansValid,
      valid: userValid
    }).then(function(){
      // check if table is valid, if so, end the round
      if(userValid) {
        firebase.database().ref(refRound).once('value').then(function(snapshot) {
          // loop thru all users and see if any are not valid
          let allUsersValid = true
          snapshot.val().map( (user, userKey) => {
            if(!user.valid) allUsersValid = false
          })
          if (userValid && !allUsersValid) {
            showAlert('Valid Code! Help your team to advance to next round.', 'success')
          } else if(allUsersValid) {
            showAlert('Great work!', 'success')
            self.endRound()
          }
        })
      }
    })
  }

  render(){
    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)

    const htmlAns = Object.keys(this.state.rounds).map((key, round) => {
      let htmlInner = Object.keys(this.state.rounds[round]).map((key, userIndex) => {
        let user = this.state.rounds[round][userIndex]
        let ans = (user.ans === true) ? 'true' : 'false'
        return <div key={key}>{user.user.substr(user.user.length - 5)}: {ans}</div>
      })
        //let html = ans + ' = ' + this.state.ansKey[ans]
        return <div key={key}>round:{round}<div>{htmlInner}</div><hr/></div>
    })

    return(
      <div className='component-wrapper'>
        <AI />

        {htmlScore}
        <Hints
          hints={HINTS}
          hintsCount={this.state.hints}
          userAttempts={this.props.user.pzs[PZ_INDEX].attempts}
          getHint={() => this.getHint()}
        />
        <button onClick={() => this.cancelGame()} className='cancel-button'>cancel game</button>

        <div id='pipe-board-wrapper' className='clear'>

          {Object.keys(this.state.rounds).map((row, rowIndex) => {

            const inner = Object.keys(this.state.rounds[rowIndex]).map((user, colIndex) => {
              let key = rowIndex.toString() + colIndex.toString()
              let userId = this.state.rounds[rowIndex][colIndex].user
              let userCode = this.state.rounds[rowIndex][colIndex].code
              let userObj = this.state.rounds[rowIndex][user]
              const itemImage = itemMap['item' + rowIndex + colIndex]
              let ansCode = ''
              let myCode = (this.state.myItemPos[rowIndex]) ?this.state.myItemPos[rowIndex].code : ''
              if( ( this.state.myItemPos[this.state.round-0] && (userCode == myCode) ) || this.state.rounds[rowIndex][colIndex].ans ) {
                ansCode = userCode
              }
              let style = {}
              if(this.props.user.id == userId || userObj.ans) {
                style.pointerEvents = 'none'
              }
              if(this.props.user.id == userId) {
                style.backgroundColor = 'rgba(0, 0, 255, 1)'
              }

              return (
                <div key={key} className={(this.state.rounds[rowIndex][colIndex].ans) ? 'pipe-item solved' : 'pipe-item'}>
                  <button
                  onClick={() => this.guess(
                    key,
                    userId,
                    userCode,
                    rowIndex,
                    colIndex,
                    itemImage
                  )}
                  style={style}
                  data-ans={userCode}
                  >
                    <img src={itemImage} />
                      {ansCode}
                      {/*item{rowIndex}{colIndex}.jpg<br/>
                      {userId.substr(userId.length - 5)}*/}
                    {/*}<input type='text' placeholder='Item Code' value={this.state.guessCode} onChange={this.handleChangeGuessCode} /><br/>
                    <button onClick={() => this.submitGuess()}>Guess</button>*/}
                </button>
              </div>)

            })

            let clock = this.state.clock
            if(this.state.round > rowIndex+0) {
              clock = clock4
            } else if(this.state.round < rowIndex+0) {
              clock = clock0
            }
            return (
              <div key={rowIndex} className='pipe-round' style={(this.state.round == rowIndex) ? { opacity: '1'} : {border: 'none', pointerEvents: 'none', opacity: '.1'}}>
                <img src={clock} width="50px" />
                {inner}
              </div>
            )
          })}
        </div>
          {/*}<div style={{float: 'left', width: '45%', border: 'solid 1px gray', padding: '1%', textAlign: 'center'}}>
            <img src={(typeof this.state.myItemPos[this.state.round-0] !== 'undefined') ? this.state.myItemPos[this.state.round-0].src : ''} /><br/>
            <h2>{(typeof this.state.myItemPos[this.state.round-0] !== 'undefined') ? this.state.myItemPos[this.state.round-0].code : ''}</h2>
          </div>*/}
          <div id='guess-wrapper' style={{ display: (this.state.valid)?'none':'block' }}>
            {(!this.state.selectedImgSrc) ? <div className='select-a-square'>Select a Pipe Square</div> : <img src={this.state.selectedImgSrc} />}
            <input type='text'
              id='item-code'
              placeholder='Code'
              value={this.state.guessCode}
              onChange={this.handleChangeGuessCode}
              max={999}
              min={100}
              maxLength={3}
            />
            {/*} {this.state.guessLabel}<br/>*/}
            <button onClick={() => this.submitGuess()}>Guess!</button>
          </div>

      </div>
    )
  }
}

// FUNCS

const genSettingsPz1 = (props) => {
  // generate user items
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed());
  let wallartCodes = shuffleArray(WALLART_CODES)
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
    let cols = []
    // add players
    props.players.forEach( (player,key) => {
      let code = random.integer(100, 999)
      cols.push(
        {
          user: player,
          code: code,
          ans: false,
          valid: false
        }
      )
    })
    // rando the array/row
    let shuffled = shuffle(cols)
    // add computer always to beginning
    shuffled.unshift(
      {
        user: 'computer',
        code: wallartCodes[round],
        ans: false,
        valid: true
      }
    )
    settings.push(shuffled)
  }
  // calc total score
  let totalScore = (PZ_PROPS.rounds.numOfRounds * props.players.length) - PZ_PROPS.rounds.numOfRounds
  // store all info in dbase
  firebase.database().ref('/boards/pz1').set({
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

export default Pz1

export {
  genSettingsPz1
}
