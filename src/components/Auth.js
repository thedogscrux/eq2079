import React, { Component } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from 'react-router-dom'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { setUser } from '../actions/userActions'

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
      userNameInput: '',
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

  login() {
    //{ name: 'Jack', pin: 1234 }
    let self = this
    let userNameAttempt = this.state.userNameInput
    let userPinAttempt = this.state.userPinInput
    // get all users from db
    let dbUsers = firebase.database().ref('/users').once('value').then(function(snapshot){
      //check if name matches
      let users = snapshot.val()
      let userResults = null
      for (var key in users) {
        if(users[key].name.toLowerCase() === userNameAttempt.toLowerCase()) {
          if(parseInt(users[key].pin) === parseInt(userPinAttempt)) {
            //if name matches, login and load user data
            userResults = users[key]
            userResults.id = key
            self.updateUser(userResults)
            break
          } else {
            self.setMsg('Username already exists! Wrong pin.')
            return
          }
        }
      }
      if(!userResults) {
        // create a new acct
        let user = {
          name: userNameAttempt,
          games: {},
          pin: userPinAttempt,
          photo: 'defaultEngineer.png',
          job: 'Engineer'
        }
        firebase.database().ref('users/').push(user, function(error) {
          self.updateUser(user)
        })
      }
    })
  }

  render(){
    if(this.state.user && this.state.redirect && this.state.display === 'formLogin') {
      return (
        <Redirect to='dashboard'/>
      )
    }

    let html = ''
    switch(this.state.display) {
      case 'userInfo':
        html =
          <div>
            Code Name: {this.state.user.name}&nbsp;&nbsp;
            <button style={{display: 'inline-block'}} onClick={() => this.updateUser('')}>Logout</button>
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
