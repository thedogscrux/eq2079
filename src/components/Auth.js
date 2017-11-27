import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import Cookies from 'js-cookie'

import { setUser } from '../actions/userActions'

import { schemaUser } from '../data/schemas.js'

import { propsPzs } from '../data/propsPzs.js'

const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true
    setTimeout(cb, 100) // fake async
  },
  signout(cb) {
    this.isAuthenticated = false
    setTimeout(cb, 100)
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    authUser: (user) => {
      dispatch(setUser(user))
    }
  }
}

class Auth extends Component {
  constructor(props){
    super(props)
    this.state = {
      userNameInput: Cookies.get('eq2079') || '',
      userPinInput: '',
      user: this.props.user,
      display: this.props.display,
      redirect: false,
      msg: ''
    }
    this.handleChangeUserName = this.handleChangeUserName.bind(this)
    this.handleChangeUserPin = this.handleChangeUserPin.bind(this)
  }

  // lifecycle

  componentDidMount() {
    // TODO: check if this elem exists
    // TODO: exe login on 'enter' key
    // document.getElementById("login-name").addEventListener("keyup", function(event) {
    //     event.preventDefault()
    //     if (event.keyCode == 13) {
    //         document.getElementById("login-button").click()
    //     }
    // })
  }

  componentWillReceiveProps(nextProps) {
    if(this.props != nextProps) {
      this.setState({
        user: nextProps.user
      });
    }
  }

  // form handlers

  handleChangeUserName(event){
    this.setState({ userNameInput: event.target.value })
  }
  handleChangeUserPin(event){
    this.setState({ userPinInput: event.target.value })
  }

  // methods

  updateUser(user) {
    this.props.authUser(user)
    fakeAuth.authenticate(() => {
      this.setState({
        redirect: true
       })
    })
  }

  setMsg(msg){
    this.setState({
      msg: msg
    })
  }

  setCookieUser(userName) {
    let min = 60; //minutes to expire
    var minExp = new Date(new Date().getTime() + min * 60 * 1000);
    Cookies.set('eq2079', userName, { expires: minExp });
  }

  login() {
    let self = this
    let userNameAttempt = this.state.userNameInput
    let userPinAttempt = this.state.userPinInput
    if(!userNameAttempt && !userPinAttempt || userNameAttempt.toLowerCase() === 'lx') {
      console.log('******************');
      console.log('*** Goodbye Lx ***');
      console.log('******************');
      userNameAttempt = 'Lx'
      userPinAttempt = '1111'
    } else if (!userPinAttempt) {
      userPinAttempt = '1111'
    }
    // get all users from db
    let dbUsers = firebase.database().ref('/users').once('value').then(function(snapshot){
      //check if name matches
      let users = snapshot.val()
      let userResults = null
      for (var key in users) {
        if(users[key].name && users[key].name.toLowerCase() === userNameAttempt.toLowerCase()) {
          if(parseInt(users[key].pin) === parseInt(userPinAttempt)) {
            //if name matches, login and load user data
            userResults = users[key]
            userResults.id = key
            self.updateUser(userResults)
            self.setCookieUser(userNameAttempt)
            break
          } else {
            self.setMsg('Wrong pin.')
            return
          }
        }
      }
      if(!userResults) {
        firebase.database().ref('/launches/').orderByChild('status').equalTo('active').once('value', function(snapshot) {
          let launchId = Object.keys(snapshot.val())[0]
          // get total num of players in active launch
          let totalPlayers = 1
          for(let key in users){
            if (users[key].launchId == launchId) {
              totalPlayers++
            }
          }
          //store active launch for update
          let activeLaunch = snapshot.val()
          activeLaunch.id = launchId
          activeLaunch.players = totalPlayers
          // create a new acct
          let user = schemaUser
          user.name = userNameAttempt
          user.pin = userPinAttempt
          user.photo ='engineer.png'
          user.job = 'Engineer'
          user.status = 'active'
          user.launchId = launchId
          user.ai = { strength: 0 }
          // loop and add games
          let pzs = []
          propsPzs.forEach(function(pz){
            pzs.push({
              code: pz.code,
              attempts: 0,
              score: 0.00,
              hints: 0
            })
          })
          user.pzs = pzs
          var newUserId = firebase.database().ref('/users/').push().key // Get a key for a new Post.
          return firebase.database().ref('/users/' + newUserId).set(user, function(error) {
            user.id = newUserId
            self.updateUser(user)
            self.setCookieUser(userNameAttempt)
            // update total players
            firebase.database().ref('/launches/' + launchId).update({
              players: totalPlayers
            })
          })
        })
      }
    })
  }

  render(){
    // either send the user to the dashboard or the start screen
    if(this.state.user && this.state.redirect && this.state.display === 'formLogin') {
      let totalScore = 0
      this.state.user.pzs.map( (pz,key) => {
        totalScore += pz.score
      })
      if(totalScore <= 0) {
        // user either hasnt passed a puzzle or has just created a new account.
        return (
          <Redirect to='start'/>
        )
      } else {
        return (
          <Redirect to='dashboard'/>
        )
      }
    }

    let html = ''
    switch(this.state.display) {
      case 'userInfo':
        html =
          <div>
            {/*Code Name: {this.state.user.name} {(this.state.user.status == 'inactive') ? '  (inactive)' : ''}&nbsp;&nbsp;
            <button style={{display: 'inline-block'}} onClick={() => this.updateUser('')}>Logout</button>*/}
          </div>
        break
      case 'formLogin':
        html =
          <div>
            <input id='login-name' className='login-input' type='text' value={this.state.userNameInput} onChange={this.handleChangeUserName} placeholder='Code Name'/>
            <input id='login-pin' className='login-input' type='password' value={this.state.userPinInput} onChange={this.handleChangeUserPin} min='0000' max='9999' step='1' maxLength='4' placeholder='Secret Pin'/>
            <button id='login-button' className='login-input' onClick={() => this.login()}>Login/Start</button>
            <div style={{color: 'red'}}>{this.state.msg}</div>
          </div>
        break
      default:
        html = ''
        break
    }

    return(
      <div>
        {html}
      </div>
    )
  }
}

const AuthContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Auth)

export default AuthContainer

export {
  fakeAuth
}
