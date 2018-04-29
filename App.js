import React from 'react';
import MainScreen from './routes/Main';
import CameraScreen from './routes/Camera';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

console.disableYellowBox = true;

const initial_state = {
  is_loading: false,
  qrcode_list: []
};

function reducer(state = initial_state, action) {
  switch (action.type) {
    case 'NEW_QRCODE':
      return Object.assign({}, state,{ qrcode_list: action.payload.qrcode_list })
    case 'CLEAR_QRCODE':
      return Object.assign({}, state,{
        qrcode_list: []
      })
      case 'INIT_QRCODE':
        return Object.assign({}, state,{
          qrcode_list: action.payload.qrcode_list
        })
    default:
      return state
  }
}

const store = createStore(reducer);

const RootStack = StackNavigator(
  {
    main: { screen: MainScreen, },
    camera: { screen: CameraScreen, },
  },
  // {
  //   navigationOptions: {
  //       headerStyle: {
  //       backgroundColor: '#fff',
  //     },
  //   }
  // },
  {
    mode: 'modal',
    headerMode: 'none',
  }
);

export default class App extends React.Component {
    render() {
        return (
          <Provider store={store}>
            <RootStack />
          </Provider>
        )
    }
}
