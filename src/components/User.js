import React, { Component } from 'react'
import { connect } from 'react-redux'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { setUser } from '../actions/userActions'

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateUser: (user) => {
      dispatch(setUser(user))
    }
  }
}

class User extends Component {
  constructor(props){
    super(props)
    this.state = {
      user: this.props.user
    }
  }

  // LIFECYCLE

  componentWillReceiveProps(nextProps) {
    if(this.state.user != nextProps.user) {
      this.setState({
        user: nextProps.user
      });
      if(nextProps.user.id){
        this.watchDB(nextProps.user.id)
      }
    }
  }

  componentDidMount() {
    this.watchDB()
  }

  // WATCH

  watchDB(userID) {
    let self = this
    firebase.database().ref('/users/' + userID).on('value', function(snapshot){
      if(snapshot.val()) {
        let user = snapshot.val()
        user.id = userID
        self.updateStateUser(user)
      }
    })
  }

  updateStateUser(user){
    this.setState({
      user: user
    })
    this.props.updateUser(user)
  }


  render(){
    return(
      <div></div>
    )
  }
}

const UserContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(User)

export default UserContainer
