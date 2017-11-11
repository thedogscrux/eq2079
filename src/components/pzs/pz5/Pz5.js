import React, { Component } from 'react'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Random from 'random-js'

import clock0 from '../../../images/pz/clock/clock-0.svg'
import clock4 from '../../../images/pz/clock/clock-4.svg'

import shape01 from './images/PzShape01.svg'

// import item00 from './images/0-0.jpg'
// import item01 from './images/0-1.jpg'
// import item02 from './images/0-2.jpg'
// import item03 from './images/0-3.jpg'
// import item04 from './images/0-4.jpg'
// import item10 from './images/1-0.jpg'
// import item11 from './images/1-1.jpg'
// import item12 from './images/1-2.jpg'
// import item13 from './images/1-3.jpg'
// import item14 from './images/1-4.jpg'
// import item20 from './images/2-0.jpg'
// import item21 from './images/2-1.jpg'
// import item22 from './images/2-2.jpg'
// import item23 from './images/2-3.jpg'
// import item24 from './images/2-4.jpg'

import { propsPzs } from '../../../data/propsPzs.js'

const pzIndex = 4
const pzProps = propsPzs[pzIndex]

const shapeMap = {
  shape01
}

// const itemMap = {
//   item00, item01, item02, item03, item04,
//   item10, item11, item12, item13, item14,
//   item20, item21, item22, item23, item24
// }


class Pz5 extends Component {
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
      rounds: {}
    }
    // this.state = {
    //   ...baseSate,
    //   bars: {},
    //   guessLabel: '',
    //   guessKey: '',
    //   guessCode: '',
    //   ans: '',
    //   ansKey: {x:'y'},
    //   rounds: {},
    //   indexRound: 0,
    //   indexColUser: 0,
    //   guessInput: '',
    //   myItemPos: [],
    //   selectedImgSrc: ''
    // }
    //this.handleChangeGuessCode = this.handleChangeGuessCode.bind(this)
  }

  // BIND

  // handleChangeGuessCode(event) {
  //   this.setState({ guessCode: event.target.value });
  // }

  // WATCH

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
    // let promise = new Promise(function(resolve, reject) {
    //   self.getSettings()
    // });
    // promise.then(function(result) {
    //   self.buildStateBoard()
    // });
    // new Promise(function(resolve, reject) {
    //
    //   return this.getSettings()
    //
    // }).then(function(result) { // (**)
    //
    //   this.buildStateBoard()
    //
    // });
  }

  componentWillUnmount() {
    let self = this
    let score = this.endGame()
    firebase.database().ref('/pzs/' + pzIndex + '/status').once('value').then(function(snapshot){
      if(snapshot.val() === 'inactive') self.props.endGame(score)
    })
  }

  // SETUP BOARD

  // TODO is this func necessary? redunant of setStateRounds()
  getSettings() {
    var self = this
    let once = firebase.database().ref('/boards/pz5/').once('value').then(function(snapshot){
      if(self._ismounted) {
        console.log('gotcha! - setting state 1');
        self.setStateRounds(snapshot.val())
      } else {
        console.log('gotcha! - setting state 3');
        self.setStateRounds(snapshot.val())
        self.buildStateBoard()
      }
      return
    })
    return
  }

  setStateRounds(settings){
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

  buildStateBoard(round) {
    console.log('BUILD BOARD',this.state.rounds);
    let userId = this.props.user.id
    //let userBars = {}
    //let roundUsers = this.state.rounds[this.state.round-0].users
    // filter 1
    let roundKey = (round) ? round-0 : this.state.round-0
    let roundUser = this.state.rounds[roundKey].users.filter( user => user.user == userId )
    // filter 2
    // let roundUsers = this.state.rounds[this.state.round-0].users
    // let roundUser = roundUsers.filter( user => user.user == userId )
    let userBars = roundUser[0].bars.map( bar => {
      return {
        position: 3,
        solution: bar.solution,
        index: bar.index
      }
    })
    // userBars = roundUsers.map( (user, key) => {
    //   // loop thru users in the round
    //   if(user.user == userId) {
    //     let bars = user.bars.map( (bar, key) => {
    //       // loop thru each bar
    //       return {
    //         position: 3,
    //         solution: bar.solution,
    //         index: bar.index
    //       }
    //     })
    //     console.log('loop: bars:', bars);
    //     return bars
    //   }
    // })
    //console.log('XXXXXXloop: userBars:',userBars);
    this.setState({
      board: {
        bars: userBars
      }
    })
    console.log('this.staet after board', this.state.board);
    // console.log('focing update');
    // this.forceUpdate()
    // for active user only
  //   board: [
  //     bars: [
  //       0: [
  //         index: 1,
  //         sol: 2,
  //         position: 3
  //       ],
  //       1: [
  //         index: 1,
  //         sol: 2,
  //         position: 3
  //       ],
  //       2: [
  //         index: 1,
  //         sol: 2,
  //         position: 3
  //       ]
  //     ]
  //   ]
  }

  getMyItemPos() {
    // get my item Positions
    console.log('** gettting my item pos **');
    // Object.keys(this.state.rounds).map((row, rowIndex) => {
    //   const inner = Object.keys(this.state.rounds[rowIndex]).map((user, colIndex) => {
    //     let userId = this.state.rounds[rowIndex][colIndex].user
    //     if(userId == this.props.user.id) {
    //       let src = itemMap['item' + rowIndex + colIndex]
    //       let code = this.state.rounds[rowIndex][colIndex].code
    //       let myItemPosArrary = this.state.myItemPos
    //       myItemPosArrary.push({
    //         src: src,
    //         code: code
    //       })
    //       this.setState({
    //         myItemPos: myItemPosArrary
    //       })
    //     }
    //   })
    // })
  }


  // GUESS

  // getPoint(){
  //   let points = this.state.points + 1
  //   this.setState({
  //     points: points
  //   })
  // }

  guess(key, item, ans, indexRound, indexColUser, selectedImgSrc) {
    // document.getElementById('itemCode').focus()
    // this.setState({
    //   guessKey: key,
    //   guessLabel: item,
    //   ans: ans,
    //   indexRound: indexRound,
    //   indexColUser: indexColUser,
    //   selectedImgSrc: selectedImgSrc
    // })
  }

  submitGuess(guess) {
    // console.log('** Guess **');
    // document.getElementById('msg').innerHTML = ''
    // document.getElementById('itemCode').value = ''
    // this.setState({
    //   guessCode: ''
    // })
    // if(parseInt(this.state.guessCode) === parseInt(this.state.ans)) {
    //   this.setState({
    //     rounds: {
    //       ...this.state.rounds,
    //       [this.state.indexRound]: {
    //         ...this.state.rounds[this.state.indexRound],
    //         [this.state.indexColUser]: {
    //           ...this.state.rounds[this.state.indexRound][this.state.indexColUser],
    //           ans: true
    //         }
    //       }
    //     }
    //   })
    // } else {
    //   alert('wrong')
    //   document.getElementById('msg').innerHTML = 'wrong'
    // }
    // document.getElementById('itemCode').focus()
    // return
  }

  // END GAME

  endGame(){
    // let userId = this.props.user.id
    let score = 0
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
    return score
  }

  updateBarPos(stateBarKey, index, position) {
    // update the bar position and check if valid
    console.log('bar, pos',index, position);
    // update the bar position
    // if [stateBarKey] doesnt work, maybe loop thru to find index
    this.setState({
      board: {
        bars: {
          ...this.state.rounds.bars,
          [stateBarKey]: position
        }
      }
    })
    // check if valid
    // loop thru all bars and if any are incorrect, user is not valid
    //let valid = (this.state.board.bars[stateBarKey].solution === position) ? true : false
    console.log('make sure state is updated with new bar pos before running validator:',this.state.board.bars);
    let valid = true
    Object.keys(this.state.board.bars).map( barKey => {
      if (this.state.board.bars[barKey].solution !== this.state.board.bars[barKey].position) valid = false
    })
    if (this.state.valid != valid) {
      if (valid) {
        // if all users are valid, end the round
        firebase.database().ref('/boards/pz5/rounds/0/users/').once(function(snapshot){
          let users = snapshot.val()
          console.log('........if all users are valid end the round');
        })
      } else {
        firebase.database().ref('/boards/pz5/rounds/0/users/0/').update({
          valid: valid
        })
      }
    }
  }


  render(){
    // const html = Object.keys(this.state.rounds).map( (key, roundIndex) => {
    //   let htmlBars = ''
    //   let round = this.state.rounds[roundIndex]
    //   if(roundIndex == this.state.round-0) {
    //     // get the users for this round
    //     htmlBars = Object.keys(round).map( (key, userIndex) => {
    //       // loop thru the user
    //       let htmlBar = ''
    //       let user = round[userIndex]
    //       if(user.user == this.props.user.id) {
    //         htmlBar = Object.keys(user.bars).map( (key, barIndex) => {
    //           let bar = user.bars[barIndex]
    //           return (
    //             <div key={key} className='bar' style={{backgroundColor: 'red'}}>
    //               <button onClick={() => this.updateBarPos(barIndex, 0)}>index: {bar.index} , {bar.solution}</button>
    //               <button onClick={() => this.updateBarPos(barIndex, 1)}>index: {bar.index} , {bar.solution}</button>
    //               <button onClick={() => this.updateBarPos(barIndex, 2)}>index: {bar.index} , {bar.solution}</button>
    //               <button onClick={() => this.updateBarPos(barIndex, 3)}>index: {bar.index} , {bar.solution}</button>
    //               <button onClick={() => this.updateBarPos(barIndex, 4)}>index: {bar.index} , {bar.solution}</button>
    //             </div>
    //           )
    //         })
    //       }
    //       return (<div key={key}>{htmlBar}</div>)
    //     })
    //   }
    //   return (<div key={key}>{htmlBars}</div>)
    // })
    // board: [
    //     bars: [
    //       0: [
    //         index: 1,
    //         sol: 2,
    //         position: 3
    //       ],
    //       1: [
    //         index: 1,
    //         sol: 2,
    //         position: 3
    //       ],
    //       2: [
    //         index: 1,
    //         sol: 2,
    //         position: 3
    //       ]
    //     ]
    //   ]
    // console.log('render: this.state.board',this.state.board)
    // console.log('render: this.state.rounds',this.state.rounds)
    // loop thru all user bars

    const htmlBars = Object.keys(this.state.board.bars).map( stateBarKey => {
      let bar = this.state.board.bars[stateBarKey]
      let bgColor = 'gray'
      // switch(bar.index) {
      //   case 0:
      //     bgColor = 'red'
      //     break;
      //   case 2:
      //     bgColor = 'blue'
      //     break;
      // }
      return (
        <div key={stateBarKey} style={{ backgroundColor: bgColor }} className='bar'>
          <button onClick={() => this.updateBarPos(stateBarKey, bar.index, 0)}>index:  {bar.index} {bar.position} , {bar.solution}</button>
          <button onClick={() => this.updateBarPos(stateBarKey, bar.index, 1)}>index: {bar.position} , {bar.solution}</button>
          <button onClick={() => this.updateBarPos(stateBarKey, bar.index, 2)}>index: {bar.position} , {bar.solution}</button>
          <button onClick={() => this.updateBarPos(stateBarKey, bar.index, 3)}>index: {bar.position} , {bar.solution}</button>
          <button onClick={() => this.updateBarPos(stateBarKey, bar.index, 4)}>index: {bar.position} , {bar.solution}</button>
        </div>
      )
    })

    return(
      <div id="shape-board-wrapper" className='component-wrapper'>
        <img src={this.state.clock} width="50px" />
        {htmlBars}
        <img src={shape01} />
      </div>
    )
  }
}

// FUNCS

const genSettingsPz5 = (props) => {
  console.log('** generate settings **')
  // generate user items
  let settings = []
  let settingsUsers = []
  let rowAssignmentIndex = 0
  let userIndex = 0
  let random = new Random(Random.engines.mt19937().autoSeed());
  // setup each user for each round
  for(let round=0; round<pzProps.rounds.numOfRounds; round++){
    settingsUsers = []
    props.players.forEach( (player,key) => {
      settingsUsers.push(
        {
          user: player,
          valid: false,
          bars: []
        }
      )
    })
    settings.push({
      users: settingsUsers
    })
  }
  // loop thru rounds
  console.log('settings',settings);
  for(let round=0; round<pzProps.rounds.numOfRounds; round++){
    // distribute bars to users
    let rowAssignment = shuffle([0, 1, 2, 3, 4, 5])
    let solution = [ 1, 1, 2, 2, 3, 3 ]
    rowAssignment.forEach(index => {
        settings[round].users[userIndex].bars.push({
          index: rowAssignment[index],
          solution: solution[rowAssignment[index]]
        })
        userIndex = (userIndex < props.players.length-1) ? userIndex + 1 : 0
    })
  }
  // calc total score
  let totalScore = 0
  // store all info in dbase
  firebase.database().ref('/boards/pz5').set({
    rounds: settings
  })
  //return settings
  return totalScore
}

// const genSettingsPz5OLD = (props) => {
//   console.log('** generate settings **')
//   // generate user items
//   let settings = []
//   let random = new Random(Random.engines.mt19937().autoSeed());
//   for(let round=0; round<pzProps.rounds.numOfRounds; round++){
//     let cols = []
//     props.players.forEach( (player,key) => {
//       let code = random.integer(100, 999)
//       cols.push(
//         {
//           user: player,
//           code: code,
//           ans: false
//         }
//       )
//     })
//     // rando the array/row
//     let shuffled = shuffle(cols)
//     settings.push(shuffled)
//   }
//   // calc total score
//   let totalScore = (pzProps.rounds.numOfRounds * props.players.length) - pzProps.rounds.numOfRounds
//   // store all info in dbase
//   firebase.database().ref('/boards/pz5').set({
//     rounds: settings
//   })
//   //return settings
//   return totalScore
// }

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

export default Pz5

export {
  genSettingsPz5
}
