import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Dialogflow_V2 } from 'react-native-dialogflow';
import { dialogflowConfig } from './env'; //Input Credential untuk Dialgflow

class ChatApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      inputMessage: '',
    };
  }
  componentDidMount() {
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_ENGLISH,
      dialogflowConfig.project_id
    );
    const permanentContexts = [
      {
        name: 'Auth',
        parameters: {
          lifespanCount: 100,
          AccessToken: dialogflowConfig.client_id,
        },
      },
    ];
    Dialogflow_V2.setPermanentContexts(permanentContexts);
  }


  handleSend = () => {
    const { inputMessage, messages } = this.state;

    if (inputMessage.trim() === '') return;

    let newMessage = {
      id: messages.length.toString(),
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
      isSent: true,
    };

    this.setState({
      messages: [...messages, newMessage],
      inputMessage: '',
    });

    Dialogflow_V2.requestQuery(
      inputMessage,
      result => {
        console.log('result', result);
        this.botResponse(result);
      },
      error => console.log(error)
    );
  };

  botResponse(result) {
    const { inputMessage, messages } = this.state;
    let newMessage = {
      id: messages.length.toString(),
      text: result.queryResult.fulfillmentMessages[0].text.text[0],
      timestamp: new Date().toLocaleTimeString(),
      isSent: false,
    };

    this.setState({
      messages: [...messages, newMessage],
      inputMessage: '',
    });
  }

  renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isSent ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text
        style={
          item.isSent ? styles.sentMessageText : styles.receivedMessageText
        }
      >
        {item.text}
      </Text>
      <Text style={styles.timestampText}>{item.timestamp}</Text>
    </View>
  );

  render() {
    const { messages, inputMessage } = this.state;

    return (
      <View style={styles.container}>
        <FlatList
          data={messages}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.id}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Masukan Pesan..."
            value={inputMessage}
            onChangeText={(text) => this.setState({ inputMessage: text })}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={this.handleSend}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  messageContainer: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    maxWidth: '80%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#38B6F1',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFEFEF',
  },
  sentMessageText: {
    fontSize: 16,
    color: 'white',
  },
  receivedMessageText: {
    fontSize: 16,
    color: 'black',
  },
  timestampText: {
    fontSize: 12,
    color: '#111',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#38B6F1',
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#FFF',
  },
});

export default ChatApp;

