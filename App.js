import React from 'react';
import SocketIOClient from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
const USER_ID = '@userId';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      userId: null,
    }
    
    this.determineUser = this.determineUser.bind(this);
    this.onReceivedMessage = this.onReceivedMessage.bind(this);
    this.onSend = this.onSend.bind(this);
    this._storeMessages = this._storeMessages.bind(this);
    this.socket = SocketIOClient('http://localhost:3000');
    this.socket.on('message', this.onReceivedMessage);
    this.determineUser();
  };

  determineUser() {
    AsyncStorage.getItem(USER_ID).then((userId) => {
      if (!userId) {
        
        this.socket.emit('userJoined', null);
        this.socket.on('userJoined', (userId) => {
          AsyncStorage.setItem(USER_ID, userId);
          this.setState({userId})
        })
      } else {
        this.socket.emit('userJoined', userId);
        this.setState({userId})
      }
    }).catch((err) => alert(e))
  }

  onReceivedMessage(messages) {
    this._storeMessages(messages);
  }

  onSend(messages = []) {
    this.socket.emit('message', messages[0]);
    this._storeMessages(messages);
  }

  _storeMessages(messages) {
    this.setState(prevState => {
      return {
        messages: GiftedChat.append(prevState.messages, messages)
      }
    })
  }
  
  render() {
    var user = {
      _id: this.state.userId || -1
    }
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={this.onSend}
        user={user}
      />
    )
  }

}

export default Main