import React, { Component } from 'react'
import { connect } from 'react-redux'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { staticStory } from '../data/static.js'

const mapStateToProps = (state, props) => {
  return {
    userId: state.user.id,
    chapter: state.user.chapter,
    chapterRank: state.user.chapterRank
  }
}

class Story extends Component {
  constructor(props){
    super(props)
    this.state = {
      chapter: this.props.chapter,
      chapterRank: this.props.chapterRank,
      dbaseChapter: 0
    }

  }

  // componentWillReceiveProps(nextProps) {
  //   if(this.props != nextProps) {
  //     this.setState({
  //       user: nextProps.user,
  //       userChapter: 2
  //     });
  //   }
  // }

  componentDidMount() {
    this.watchDB()
  }

  componentWillUnmount() {
    this.unwatchDB()
  }

  // WATCH

  unwatchDB() {
    firebase.database().ref('users/' + this.props.userId + '/chapter').off()
  }

  watchDB() {
    let self = this
    firebase.database().ref('users/' + this.props.userId + '/chapter').on('value', function(snapshot){
      if(parseInt(snapshot.val()) >= 0) {
        self.updateStateChapter(snapshot.val())
      }
    })
  }

  updateStateChapter(chapter){
    this.setState({
      dbaseChapter: chapter
    })
  }

  render(){
    return(
      <div className='component-wrapper'>
        <h2>Story</h2>
        Sate Chapter {this.state.chapter}<br/>
        Props Chapter {this.props.chapter}<br/>
        Dbase Chapter {this.state.dbaseChapter}<br/>
        {staticStory[this.state.chapter][this.state.chapterRank]}
      </div>
    )
  }
}

const StoryContainer = connect(
  mapStateToProps
)(Story)

export default StoryContainer
