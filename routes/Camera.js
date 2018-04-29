import React from 'react';
import { StyleSheet, Text, View, Button, AsyncStorage } from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { connect } from 'react-redux'
var _ = require('lodash');

class CameraScreen extends React.Component {
  state = {
    hasCameraPermission: null,
  }
  isFounded = false
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({hasCameraPermission: status === 'granted'});
  }
  render() {
      const { hasCameraPermission } = this.state;
      if (hasCameraPermission === null) {
        return <Text>Requesting for camera permission</Text>;
      } else if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
      } else {
          return (
            <View style={{ flex: 1 }}>
              <BarCodeScanner
                onBarCodeRead={this._handleBarCodeRead}
                style={StyleSheet.absoluteFill}
              />
            </View>
          );
        }
}

_handleBarCodeRead = ({ type, data }) => {
  if (!this.isFounded) {
    this.isFounded = true;
    const res = data.match(/^otpauth:\/\/totp\/(.+)\?secret=(.+)&issuer=(.*)/);
    const [label, secret, issuer] = res.slice(1);
    const qrcode_entry = {label, secret, issuer}
    if (_.some(this.props.qrcode_list, qrcode_entry)) {
      alert(`Sorry the entry ${qrcode_entry.label} already exist`);
      setTimeout(() => {
        this.isFounded = false;
      }, 2000)
    }
    else{
      const updated_qrcode_list = [...this.props.qrcode_list, qrcode_entry]
      try{
        const str = JSON.stringify(updated_qrcode_list)
        AsyncStorage.setItem("qrcode_list", str).then(() => {
          this.props.dispatch({ type: 'NEW_QRCODE', payload: { qrcode_list: updated_qrcode_list } })
        })
      }catch(error){
        this.props.dispatch({type: 'ERROR_QRCODE'})
      }
      this.props.navigation.navigate("main");
      }
    }
  }
}

function mapStateToProps(state) {
  return {
    qrcode_list: state.qrcode_list
  }
}

export default connect(mapStateToProps)(CameraScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop:50,
    margin: 10
  },
  btn: {
     marginTop: 20,
     backgroundColor: '#55efc4',
     padding: 10,
     width:'100%',
     color:'#fff'
  },
});
