import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, AsyncStorage, Alert } from 'react-native';
import { connect } from 'react-redux'
import TOTP from '../lib/totp'

class MainScreen extends React.Component {
  state = {
    timer: null
  }
  componentWillMount(){
    this.props.dispatch({ type: 'LOADING_QRCODE'})
    try{
    AsyncStorage.getItem('qrcode_list').then((result) => {
      if (result) {
        const qrcode_list = JSON.parse(result);
        this.props.dispatch({ type: 'INIT_QRCODE', payload: { qrcode_list } })
        }
      })
    }catch(error){
      this.props.dispatch({type: 'ERROR_QRCODE'})
    }
  }
  clear = () =>{
    Alert.alert(
      'Remove all items',
      'Are you sure you want to delete all items',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Yes', onPress: () => {
          this.props.dispatch({type: 'CLEAR_QRCODE'});
          AsyncStorage.removeItem("qrcode_list");
        }},
      ],
      { cancelable: true }
    )
  }
  imageClicked = (index) =>{
    Alert.alert(
      'Remove ' + this.props.qrcode_list[index].label+' item',
      'Are you sure you want to delete the '+this.props.qrcode_list[index].label+' item ?',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Yes', onPress: () => {
          const updated_qrcode_list = [...this.props.qrcode_list];
          updated_qrcode_list.splice(index, 1);
          const str = JSON.stringify(updated_qrcode_list)
          AsyncStorage.setItem("qrcode_list", str).then(() => {
            this.props.dispatch({ type: 'INIT_QRCODE', payload: { qrcode_list: updated_qrcode_list } })
          })
        }},
      ],
      { cancelable: true }
    )
  }
  componentDidUpdate(){
    const duration = 5000;
    if (!this.state.time) {
    setInterval(() =>{
      this.setState({timer:this.state.timer + duration})
    }, duration)
  }
  }
  render() {
      const display = this.props.qrcode_list.map((item, index ) => {
          const token = new TOTP(item.secret, 5).generate()
          return (
            <TouchableOpacity style={styles.items} onPress={() => this.imageClicked(index)}>
            <Text style={styles.item}>{item.issuer}</Text>
              <Text style={{fontWeight: 'bold',width:'100%',fontSize:20}}>{token}</Text>
              <Text style={styles.item}>{item.label}</Text>
              <Text style={styles.item}>{item.secret}</Text>
            </TouchableOpacity>
          )
        })

      if (this.props.qrcode_list.length === 0) {
        return(
          <View style={styles.container}>
            <View style={[styles.btn, styles.green]}>
              <Button title="Add" color="#000" onPress={() => this.props.navigation.navigate("camera")}/>
            </View>
        </View>
        )
      }
      return(
        <View style={styles.container}>
        {display}
          <View style={[styles.btn, styles.green]}>
            <Button title="Add" color="#000" onPress={() => this.props.navigation.navigate("camera")}/>
          </View>
          <View style={[styles.btn, styles.red]}>
            <Button title="Clear" color="#000" onPress={this.clear}/>
          </View>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    qrcode_list: state.qrcode_list,
    is_loading: state.is_loading
  }
}

export default connect(mapStateToProps)(MainScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop:50,
  },
  items: {
    marginTop:10,
    backgroundColor: '#C42E2F',
    padding: 20,
    width: '90%'
  },
  item:{
    width: '100%',
    fontSize:15
  },
  btn: {
     marginTop: 20,
     backgroundColor: '#55efc4',
     padding: 10,
     width:'90%',
  },
  green: {
     backgroundColor: '#23d160',
  },
  red: {
     backgroundColor: '#ff3860',
  },
});
