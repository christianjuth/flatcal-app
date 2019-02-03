import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, StatusBar } from 'react-native';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as loc,
  removeOrientationListener as rol
} from 'react-native-responsive-screen';

global.math = require('mathjs');
global.Algebrite = require('algebrite');
let Equation = require('./Equation.js');



let themeName = 'android';
let theme = require(`./themes/${themeName}.json`);



class Btn extends React.Component {

  constructor(props) {
    super(props);
    this.parent  = props.p;
    this.onPress = props.onPress;
    this.type    = props.type || 'default';

    this.state = {
      text: props.text,
      val: props.val || props.text
    }
  }

  // needed for rad/deg button
  componentWillReceiveProps(newProps) {
    this.setState({
      text: newProps.text,
      val: newProps.val || newProps.text
    });
  }

  press() {
    if(this.onPress)
      this.onPress();
    else
      this.parent.add(this.state.val);
  }

  render() {
    let screen = Dimensions.get('window'),
        landscape = screen.width > screen.height,
        b = theme.button;

    let styles = {
      button: {
        flex: 1,
        height: '100%',
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: b.color,
        borderWidth: parseInt(b.borderWidth),
        borderColor: b.borderColor || theme.body.color
      },

      buttonLong: {
        flex: 0,
        width: '50%'
      },

      buttonText: {
        color: b.textColor,
        fontSize: landscape ? wp('2.5%') : wp('8%'),
        textAlign: 'center'
      }
    };


    this.type.split(' ')
    .map((key) => {
      if(key == 'op') 
        return 'operators';
      else if(key == 'number') 
        return 'numbers'
      else if(key == 'decimal')
        return 'point';
      else 
        return key;
    })
    .forEach(key => {
      if(b[key]){
        if(b[key].color)
          styles.button.backgroundColor = b[key].color;
        if(b[key].textColor)
          styles.buttonText.color = b[key].textColor;
      }
    });
      


    styles = StyleSheet.create(styles);
    let css = [styles.button];
    if(this.type.indexOf('long') > -1) css.push(styles.buttonLong);

    return (
      <TouchableOpacity style={css} onPress={this.press.bind(this)}>
        <Text style={styles.buttonText}>{this.state.text}</Text>
      </TouchableOpacity>
    );
  }
}



export default class App extends React.Component {

  componentDidMount() {
    Expo.ScreenOrientation.allowAsync(Expo.ScreenOrientation.Orientation.ALL_BUT_UPSIDE_DOWN);
    loc(this);
  }
  
  componentWillUnMount() {
    Expo.ScreenOrientation.allowAsync(Expo.ScreenOrientation.Orientation.PORTRAIT);
    rol();
  }

  constructor(props) {
    super(props);
    this.state = {
      screen: '0',
      mode: 'rad'
    };
  }

  add(char) {
    let val = this.state.screen;

    char = char.toString();

    // replace zero if needed
    if(val === '0' && char != '.')
        val = char;
    else
        val += char;

    // validate
    let eq1 = new Equation(val),
        eq2 = new Equation(val+' 1');

    if(eq1.isValid() || eq2.isValid()){
      this.setState({
        screen: val
      });
    }
  }

  clear() {
    this.setState({
      screen: '0'
    });
  }

  solve() {
    let screen = this.state.screen;
    eq = new Equation(screen);
    if(eq.isValid()){
      this.setState({
        screen: eq.solve(this.state.mode)
      });
    }
  }

  toggleMode() {
    let mode = this.state.mode;
    if(mode == 'rad') mode = 'deg';
    else mode = 'rad';

    this.setState({
      mode: mode
    });
  }

  render() {
    let screen = Dimensions.get('window'),
        landscape = screen.width > screen.height;

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.body.color
      },

      screenWrap: {
        flex: 1,
        width: '100%',
        backgroundColor: theme.input.color
      },

      screen: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        paddingRight: 20,
        paddingBottom: hp('2%'),
        fontSize: 50,
        textAlign: 'right',
        color: theme.input.textColor
      },

      sectionWrap: {
        flex: 0,
        flexDirection: 'row'
      },

      section: {
        width: landscape ? '50%' : '100%'
      },

      scientific: {
        display: landscape ? 'flex' : 'none'
      },

      row: {
        flex: 0,
        height: 20 + hp('8%'),
        flexDirection: 'row'
      }
    });

    let c = theme.body.color.replace(/^#/,'');
    // convert #fff to #ffffff
    if(c.length < 6) c = c.split('').map(v => v+v).join('');
    let rgb = parseInt(c, 16),
        r = (rgb >> 16) & 0xff,
        g = (rgb >>  8) & 0xff,
        b = (rgb >>  0) & 0xff,
        luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    if (luma < 175)
      StatusBar.setBarStyle('light-content', true);
    else
      StatusBar.setBarStyle('dark-content', true);

    return (
      <View style={styles.container}>
        <View style={styles.screenWrap}>
          <Text style={styles.screen}>{this.state.screen}</Text>
        </View>

        <View style={styles.sectionWrap}>

          <View style={[styles.section, styles.scientific]}>
            <View style={styles.row}>
              <Btn text={this.state.mode} onPress={this.toggleMode.bind(this)}/>
              <Btn val='!' text='x!' p={this}/>
              <Btn text='%' p={this}/>
              <Btn text='Ans' p={this}/>
            </View>

            <View style={styles.row}>
              <Btn val='rt2' text='xrt2' p={this}/>
              <Btn text='rt' p={this}/>
              <Btn val='^2' text='x^2' p={this}/>
              <Btn text='^' p={this}/>
            </View>

            <View style={styles.row}>
              <Btn val='log10(' text='log' p={this}/>
              <Btn val='acos(' text='acos' p={this}/>
              <Btn val='atan(' text='atan' p={this}/>
              <Btn val='asin(' text='asin' p={this}/>
            </View>

            <View style={styles.row}>
              <Btn val='log2(' text='log2' p={this}/>
              <Btn val='cos(' text='cos' p={this}/>
              <Btn val='tan(' text='tan' p={this}/>
              <Btn val='sin(' text='sin' p={this}/>
            </View>

            <View style={styles.row}>
              <Btn val='ln(' text='ln' p={this}/>
              <Btn text='P' p={this}/>
              <Btn text='e' p={this}/>
              <Btn text='mod' onPress={this.solve.bind(this)}/>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <Btn text='C' onPress={this.clear.bind(this)}/>
              <Btn text='(' p={this}/>
              <Btn text=')' p={this}/>
              <Btn text='/' type='op' p={this}/>
            </View>

            <View style={styles.row}>
              <Btn text='7' type='number' p={this}/>
              <Btn text='8' type='number' p={this}/>
              <Btn text='9' type='number' p={this}/>
              <Btn val='*' type='op' text='x' p={this}/>
            </View>

            <View style={styles.row}>
              <Btn text='4' type='number' p={this}/>
              <Btn text='5' type='number' p={this}/>
              <Btn text='6' type='number' p={this}/>
              <Btn text='-'type='op' p={this}/>
            </View>

            <View style={styles.row}>
              <Btn text='1' type='number' p={this}/>
              <Btn text='2' type='number' p={this}/>
              <Btn text='3' type='number' p={this}/>
              <Btn text='+' type='op' p={this}/>
            </View>

            <View style={styles.row}>
              <Btn text='0' type='number long' p={this}/>
              <Btn text='.' type='decimal' p={this}/>
              <Btn text='=' type='equal' onPress={this.solve.bind(this)}/>
            </View>
          </View>
        </View>

      </View>
    );
  }
}
