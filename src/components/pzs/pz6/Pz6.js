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
  [ 0, 1, 2, 3, 4, 5 ],
  [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
  [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
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
        mySolutions: [],
        solutionAKey: -1,
        solutionBKey: -1,
        userAKey: -1,
        userBKey: -1,
        beakerA: 0,
        beakerB: 0,
        val: 0,
        valid: false,
        difficulty: 0,
        liquid: -1,
        table: [ ]
      },
      rounds: [
        {
          difficulty: 0,
          solutions: [
            {
              users: [
                {
                  userId: '',
                  val: 0
                }
              ],
              val: 0
            }
          ],
          users: [
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
    console.log('*** update state pz ***');
    let tableNew = pzBoard.rounds[this.state.round].solution
    // update my solutions
    let newMySolutions = []
    newMySolutions.push(tableNew[this.state.board.solutionAKey])
    if(this.state.board.difficulty >= 2) newMySolutions.push(tableNew[this.state.board.solutionBKey])
    if (newMySolutions != this.state.board.mySolutions) console.log('update to mySolutions', newMySolutions);

    if (this.state.rounds[this.state.round] && tableNew != this.state.rounds[this.state.round].solutions) {
      this.setState({
        board: {
          ...this.state.board,
          table: tableNew,
          mySolutions: newMySolutions
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
    roundUser = roundUser[0]
    // update the table
    let tableNew = this.state.rounds[roundKey].solution

    let mySolutions = []
    let solutionAKey = -1
    let solutionBKey = -1
    let userAKey = -1
    let userBKey = -1
    // loop thru all solutions, get keys and find mine
    this.state.rounds[roundKey].solution.map( (solution, solutionKey) => {
      // loop thru solution users to find me
      solution.users.forEach((user,userKey) => {
        if(user.userId === userId) {
          // set the keys
          if(solutionAKey === -1) {
            solutionAKey = solutionKey
          } else {
            solutionBKey = solutionKey
          }
          if(userAKey === -1) {
            userAKey = userKey
          } else {
            userBKey = userKey
          }
          mySolutions.push(solution)
        }
      })
    })

    // A = easy/medium game with one solution
    // B = hard game with two solutions
    this.setState({
      sliderValue: 0,
      board: {
        ...this.state.board,
        mySolutions: mySolutions,
        solutionAKey: solutionAKey,
        solutionBKey: solutionBKey,
        userAKey: userAKey,
        userBKey: userBKey,
        valid: false,
        liquid: roundUser.liquid,
        val: 0,
        difficulty: this.state.rounds[roundKey].difficulty,
        table: tableNew
      }
    })
  }

  getMyUserKey() {
    // loop thru all users in round to find me
    let userKey = -1
    let userId = this.props.user.id
    console.log('this.state.rd',this.state);
    this.state.rounds[this.state.round].users.filter((user,key) => {
      if (user.userId == userId) userKey = key
      return
    })
    this.setState({
      userKey: userKey,
      render: true
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
    let newTable = this.state.board.table || []
    let userId = this.props.user.id
    let round = this.state.round
    let difficulty = this.state.board.difficulty
    let refRound = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/users/'
    let refSolutions = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/solution/'
    let refUser = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/users/' + this.state.userKey
    let solutionA = this.state.board.mySolutions[0]
    let solutionB = (difficulty >= 2) ? this.state.board.mySolutions[1] : null
    let refSolutionA = ''
    let refSolutionB = ''
    let solutionVal = 0
    let userValid = true

    if (difficulty === 0) {
      // easy (solution A)
      userValid = (guessVal === solutionA.val) ? true : false
      refSolutionA = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/solution/' + this.state.board.solutionAKey + '/users/' + this.state.board.userAKey
    } else if (difficulty === 1) {
      // medium (solution A)
      let totalValA = guessVal
      solutionA.users.map( (user => {
        // leave me out, beucase i have an old score stored in state
        if(user.userId != userId) totalValA = totalValA + user.val
      }))
      userValid = (totalValA === solutionA.val) ? true : false
      refSolutionA = '/boards/' + PZ_PROPS.code + '/rounds/' + this.state.round + '/solution/' + this.state.board.solutionAKey + '/users/' + this.state.board.userAKey
    } else if (difficulty >= 2) {
      // hard (solution A and solution B)
      solutionVal = this.state.board.mySolutions[0].val

    }

    //let newTable = Object.assign([], this.state.board.table)
    // let newUser = Object.assign([], this.state.rounds[this.state.round].users[this.state.userKey])
    // let newRounds = Object.assign([], this.state.rounds)

    // UPDATE SCORE: by checking if all my items are in the correct position
      // loop thru all my  items, then loop thru all items on table to check

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
    //newRounds[this.state.round].users[this.state.userKey] = newUser

    // this.setState({
    //   rounds: newRounds
    // })

    if (difficulty === 0) {
      // easy have one solution per user
      firebase.database().ref(refSolutionA).update({
        val: guessVal,
        valid: userValid
      }).then(function(){
        // check if table is valid, if so, end the round
        if(userValid) {
          firebase.database().ref(refSolutions).once('value').then(function(snapshot) {
            let allUsersValid = true
            snapshot.val().map( (solution, solutionKey) => {
              // loop thru solution users to see if any are not valid
              solution.users.forEach((user, userKey) => {
                if(!user.valid) allUsersValid = false
              })
            })
            if(allUsersValid) self.endRound()
          })
        }
      })
    } else if (difficulty === 1) {
      // medium have one solution per user
      firebase.database().ref(refSolutionA).update({
        val: guessVal,
        valid: userValid
      }).then(function(){
        // check if table is valid, if so, end the round
        if(userValid) {
          firebase.database().ref(refSolutions).once('value').then(function(snapshot) {
            let allUsersValid = true
            snapshot.val().map( (solution, solutionKey) => {
              // loop thru solution users to see if any are not valid
              let totalVal = 0
              solution.users.forEach((user, userKey) => {
                totalVal = totalVal + user.val
              })
              if(totalVal != solution.val) allUsersValid = false
            })
            if(allUsersValid) self.endRound()
          })
        }
      })
    } else if (difficulty === 2) {
      // hard has two solutions per user
              // firebase.database().ref(refSolutionA).update({
              //   val: guessVal
              // }).then(function(){
              //   // check if table is valid, if so, end the round
              //   if(userValid) {
              //     firebase.database().ref(refRound).once('value').then(function(snapshot) {
              //       let allUsersValid = true
              //       snapshot.val().map(user => {
              //         if(!user.valid) allUsersValid = false
              //       })
              //       if(allUsersValid) self.endRound()
              //     })
              //   }
              // })

    }

  }

  render(){

    // score
    let score = new Score(PZ_INDEX)
    let htmlScore = score.htmlSimpleDisplay(this.state.score)
    let myVal = 0
    let solution = -1
    let beakerAVal = 0
    let beakerBVal = 0
    let liquid = this.state.board.liquid
    let userId = this.props.user.id
    let round = this.state.round
    let difficulty = this.state.board.difficulty
    let cssClassLiquid = 'liquid-' + liquid
    let htmlSliderHard = ''

    // find values for beakers

    // style the slide containers depending on how many there are
    let cssClassSlideContainer = 'small'
    let minRange = 0
    let maxRange = 6

    // settings based on difficulty
    if(this.state.render) {
      if (difficulty === 0) {
        solution = this.state.board.mySolutions[0].val
        beakerAVal = this.state.sliderValue
      } else if (difficulty === 1) {
        // medium
        cssClassSlideContainer = 'medium'
        minRange = 0
        maxRange = 10
        solution = this.state.board.mySolutions[0].val
        // beakerA is all user values combined
        let totalVal = 0
        this.state.board.table[this.state.board.solutionAKey].users.map((user, userKey) => {
          totalVal = totalVal + user.val
        })
        solution = this.state.board.mySolutions[this.state.board.solutionAKey].val
        beakerAVal = totalVal
      } else if (difficulty >= 2) {
        // hard
        cssClassSlideContainer = 'hard'
        minRange = 0
        maxRange = 10
        // .....
      }

      myVal = this.state.rounds[this.state.round].users[this.state.userKey].val
    }

    if (difficulty >= 2) {
      htmlSliderHard =
        <div className={'slidecontainer ' + cssClassSlideContainer}>
          {solution}
          <input type='range'
            min={minRange}
            max={maxRange}
            value={this.state.sliderValue}
            className={'slider ' + cssClassLiquid}
            readOnly={true}
          />
        </div>
    }

    let htmlSolutionKey = SOLUTIONS[difficulty].map((solution, key) => {
      let colorName = LIQUIDS[solution]
      return(<div key={key} className='solution-key' style={{ backgroundColor: colorName }}><div className='dot'>{solution}</div></div>)
    })

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

        <div className='solution-key-wrapper'>{htmlSolutionKey}</div>

        <br/><br/>

        <div id='sliderWrappers'>
          <div className={'slidecontainer ' + cssClassSlideContainer}>
            {this.state.sliderValue}
            <input type='range'
              onMouseUp={() => this.guess()}
              onTouchEnd={() => this.guess()}
              onChange={this.onRangeChange}
              min={minRange}
              max={maxRange}
              value={this.state.sliderValue}
              className={'slider ' + cssClassLiquid}
              id='myRange'
            />
          </div>

          <div className={'slidecontainer ' + cssClassSlideContainer}>
            A:{solution}
            <input type='range'
              min={minRange}
              max={maxRange}
              value={beakerAVal}
              className={'slider ' + cssClassLiquid}
              readOnly={true}
            />
          </div>

          {htmlSliderHard}

        </div>

      </div>
    )
  }
}

// FUNCS

// const SOLUTIONS = [
//   [ 0, 1, 2, 3, 4, 5 ],
//   [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
//   [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
// ]

const genSettingsPz6 = (props) => {
  let settings = []
  let random = new Random(Random.engines.mt19937().autoSeed())
  // setup each user for each round
  for(let round=0; round<PZ_PROPS.rounds.numOfRounds; round++){
    // DIFFICULTY settings based on difficulty
    // default to easy
    let difficulty = 0
    let maxRange = 4
    if (round >= 2) {
      // medium
      difficulty = 2
      maxRange = 10 // rand val up to 30 (or 3x the max)
    } else if (round >= 1) {
      // hard
      maxRange = 10
      difficulty = 1
    }

    // ADD USERS to pz - create an empty obj for each user
    let settingsUsers = []
    props.players.forEach( (user,key) => {
      settingsUsers.push(
        {
          userId: user,
          liquid: SOLUTIONS[difficulty][random.integer(0, maxRange-1)]
        }
      )
    })
    // settings = rounds[#][users][#] (without user data)
    // SHUFFLE ITEMS and determine solution
    let solution = []
    if(difficulty === 0) {
      // each user solves for their own solution
      settingsUsers.forEach( user => {
        //solution.push(SOLUTIONS[difficulty][random.integer(0, maxRange)])
            solution.push({
              users: [ {
                userId: user.userId,
                val: 0
              } ],
              val: user.liquid
            })
      })
    } else if (difficulty === 1) {
      // all users share the same solution (sum)
      let totalVal = 0
      let users = []
      settingsUsers.forEach( user => {
        totalVal = totalVal + user.liquid
        users.push({
          userId: user.userId,
          val: 0
        })
      })
      solution.push({
        users: users,
        val: totalVal
      })
    } else if (difficulty === 2) {
      // users are splits into triples and chaos ensues
      settingsUsers.forEach( user => {
        solution.push({
          users: [ user.userId ],
          val: user.liquid
        })
      })
    }
    // DEAL ITEMS to users
    // solution.forEach( (solution, key) => {
    //     //settingsUsers[key].solution = solution
    //     settingsUsers[key].liquid = solution.val
    // })

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
  }).then(function(){
    console.log('Data saved successfully.');
  }).catch(function(error) {
    alert('Data could not be saved.' + error);
  })

  //return settings
  return totalScore
}

export default Pz6

export {
  genSettingsPz6
}
