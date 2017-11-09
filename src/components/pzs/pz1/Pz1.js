import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'

import clock0 from '../../../images/pz/clock/clock-0.svg'
import clock4 from '../../../images/pz/clock/clock-4.svg'

import item00 from './images/0-0.jpg'
import item01 from './images/0-1.jpg'
import item02 from './images/0-2.jpg'
import item03 from './images/0-3.jpg'
import item04 from './images/0-4.jpg'
import item10 from './images/1-0.jpg'
import item11 from './images/1-1.jpg'
import item12 from './images/1-2.jpg'
import item13 from './images/1-3.jpg'
import item14 from './images/1-4.jpg'
import item20 from './images/2-0.jpg'
import item21 from './images/2-1.jpg'
import item22 from './images/2-2.jpg'
import item23 from './images/2-3.jpg'
import item24 from './images/2-4.jpg'

import { propsPzs } from '../../../data/propsPzs.js'

const pzIndex = 0
const pzProps = propsPzs[pzIndex]

const itemMap = {
  item00, item01, item02, item03, item04,
  item10, item11, item12, item13, item14,
  item20, item21, item22, item23, item24
}


class Pz1 extends Component {
  constructor(props){
    super(props)
    let baseSate = {
      points: 0,
      round: props.round,
      totalScore: 0,
      user: props.user,
      clock: props.clock
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
    this.setState({ guessCode: event.target.value });
  }

  // WATCH

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
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

  // TODO is this func necessary? redunant of setStateBoard()
  getSettings() {
    var self = this
    let once = firebase.database().ref('/boards/pz1/').once('value').then(function(snapshot){
      if(self._ismounted) {
        self.setStateBoard(snapshot.val())
      } else {
        console.log('gotcha! - setting state 3');
        self.setStateBoard(snapshot.val())
      }
      return
    })
    return
  }

  setStateBoard(settings){
    if(this._ismounted) {
      console.log('setting state 1');
      this.setState({
        rounds: settings.rounds
      })
      this.getMyItemPos()
    } else {
      console.log('gotcha! - setting state 2');
      this.setState({
        rounds: settings.rounds
      })
      this.getMyItemPos()
    }
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


  // GUESS

  getPoint(){
    let points = this.state.points + 1
    this.setState({
      points: points
    })
  }

  guess(key, item, ans, indexRound, indexColUser, selectedImgSrc) {
    document.getElementById('itemCode').focus()
    this.setState({
      guessKey: key,
      guessLabel: item,
      ans: ans,
      indexRound: indexRound,
      indexColUser: indexColUser,
      selectedImgSrc: selectedImgSrc
    })
  }

  submitGuess(guess) {
    console.log('** Guess **');
    document.getElementById('msg').innerHTML = ''
    document.getElementById('itemCode').value = ''
    this.setState({
      guessCode: ''
    })
    if(parseInt(this.state.guessCode) === parseInt(this.state.ans)) {
      this.setState({
        rounds: {
          ...this.state.rounds,
          [this.state.indexRound]: {
            ...this.state.rounds[this.state.indexRound],
            [this.state.indexColUser]: {
              ...this.state.rounds[this.state.indexRound][this.state.indexColUser],
              ans: true
            }
          }
        }
      })
    } else {
      alert('wrong')
      document.getElementById('msg').innerHTML = 'wrong'
    }
    document.getElementById('itemCode').focus()
    return
  }

  // END GAME

  endGame(){
    let userId = this.props.user.id
    let score = 0
    // calc user score (final score calculated in Pz parent)
    Object.keys(this.state.rounds).map((key, round) => {
      Object.keys(this.state.rounds[round]).map((key, userIndex) => {
        let user = this.state.rounds[round][userIndex]
        if(user.ans === true) {
          score++
        }
        return
      })
      return
    })
    return score
  }


  render(){
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
        <div id='pipe-board-wrapper' className='clear'>

          {Object.keys(this.state.rounds).map((row, rowIndex) => {

            const inner = Object.keys(this.state.rounds[rowIndex]).map((user, colIndex) => {
              let key = rowIndex.toString() + colIndex.toString()
              let userId = this.state.rounds[rowIndex][colIndex].user
              let userCode = this.state.rounds[rowIndex][colIndex].code
              const itemImage = itemMap['item' + rowIndex + colIndex]
              let ansCode = ''
              let myCode = (this.state.myItemPos[rowIndex]) ?this.state.myItemPos[rowIndex].code : ''
              if( ( this.state.myItemPos[this.state.round-1] && (userCode == myCode) ) || this.state.rounds[rowIndex][colIndex].ans ) {
                ansCode = userCode
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
                  style={(this.props.user.id == userId) ?
                      {
                        backgroundColor: 'rgba(0, 0, 255, 1)',
                        border: 'solid 2px rgba(0, 0, 255, 1)',
                        pointerEvents: 'none'
                      }
                    :
                      {}
                  }
                  data-ans={userCode}
                  >
                    <img src={itemImage} /><br/>
                      {ansCode}
                      {/*item{rowIndex}{colIndex}.jpg<br/>
                      {userId.substr(userId.length - 5)}*/}
                    {/*}<input type='text' placeholder='Item Code' value={this.state.guessCode} onChange={this.handleChangeGuessCode} /><br/>
                    <button onClick={() => this.submitGuess()}>Guess</button>*/}
                </button>
              </div>)

            })

            let clock = this.state.clock
            if(this.state.round > rowIndex + 1) {
              clock = clock4
            } else if(this.state.round < rowIndex + 1) {
              clock = clock0
            }
            return (
              <div key={rowIndex} className='pipe-round' style={(this.state.round == rowIndex+1) ? {border: 'solid 1px red', opacity: '1'} : {border: 'none', pointerEvents: 'none', opacity: '.2'}}>
                <img src={clock} width="50px" />
                {inner}
              </div>
            )
          })}
        </div>
          <hr/>
          <br/><br/>
          {/*}<div style={{float: 'left', width: '45%', border: 'solid 1px gray', padding: '1%', textAlign: 'center'}}>
            <img src={(typeof this.state.myItemPos[this.state.round-1] !== 'undefined') ? this.state.myItemPos[this.state.round-1].src : ''} /><br/>
            <h2>{(typeof this.state.myItemPos[this.state.round-1] !== 'undefined') ? this.state.myItemPos[this.state.round-1].code : ''}</h2>
          </div>*/}
          <div style={{float: 'left', width: '45%', border: 'solid 1px gray', padding: '1%', textAlign: 'center'}}>
            <img src={this.state.selectedImgSrc} /><br/>
            <input type='text' id='itemCode' placeholder='Item Code' value={this.state.guessCode} onChange={this.handleChangeGuessCode} /><br/>
            {/*} {this.state.guessLabel}<br/>*/}
            <button onClick={() => this.submitGuess()}>Guess!</button>
            <div id='msg'></div>
            </div>
          <br/><br/>

      </div>
    )
  }
}

// FUNCS

const genSettingsPz1 = (props) => {
  console.log('** generate settings **')
  // generate user items
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed());
  for(let round=0; round<pzProps.rounds.numOfRounds; round++){
    let cols = []
    props.players.forEach( (player,key) => {
      let code = random.integer(100, 999)
      cols.push(
        {
          user: player,
          code: code,
          ans: false
        }
      )
    })
    // rando the array/row
    let shuffled = shuffle(cols)
    settings.push(shuffled)
  }
  // calc total score
  let totalScore = (pzProps.rounds.numOfRounds * props.players.length) - pzProps.rounds.numOfRounds
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
