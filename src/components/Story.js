import React, { Component } from 'react'
import { connect } from 'react-redux'

import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'

import { staticStory } from '../data/static.js'
import game from '../Settings.js'

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
    // TODO: for ref, different states of checking chapter in case anything goes wrong
    /*Sate Chapter {this.state.chapter}<br/>
    Props Chapter {this.props.chapter}<br/>
    Dbase Chapter {this.state.dbaseChapter}<br/>
    {console.log('this.state.chapter',this.state.chapter)}
    {console.log('this.state.chapterRank',this.state.chapterRank)}*/

    let rankMsg = ''
    let story = ''

    if(game.story.chapterRanks) {
      // show a rank msg and chapter on the dashboard. make sure there are three msgs in chapter array
      if (this.state.chapterRank === 1) {
        rankMsg = 'Great job!'
      } else if (this.state.chapterRank === 2) {
        rankMsg = 'Not bad cadet.'
      } else if (this.state.chapterRank === 3) {
        rankMsg = 'Well, at least you completed the mission.'
      }

      story = (this.state.chapter === 0) ? staticStory[0] : staticStory[this.state.chapter][this.state.chapterRank-1]
    } else {
      // everybody gets the same chapters
      story = staticStory[this.state.chapter][0]
    }

    let welcome = (this.state.chapter === 0) ? 'Welcome to your communications center. blah blah...' : ''

    return(
      <div id='component-story' className='component-wrapper'>
        {/*welcome*/}
        { (rankMsg) ? rankMsg + '/<br/>' : '' }
        {story}
      </div>
    )
  }
}

const StoryContainer = connect(
  mapStateToProps
)(Story)

export default StoryContainer
