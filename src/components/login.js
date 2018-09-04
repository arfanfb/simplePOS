"use strict";

import React, { Component } from 'react'
import request from 'request'
import cookie from 'cookie'

class Login extends Component {
    constructor(props, context) {
      super(props, context);

      const { cookies } = props;

      this.state = {
        userName: '',
        password: '',
        role: null,
        isLogin: true
      };

      this.loginSubmit = this.loginSubmit.bind(this)
      this.registerSubmit = this.registerSubmit.bind(this)
      this.usernameChange = this.usernameChange.bind(this)
      this.passwordChange = this.passwordChange.bind(this)
      this.register = this.register.bind(this)
      this.roleChange = this.roleChange.bind(this)
    }

    loginSubmit() {
        let that = this
        if (this.state.userName != '' && this.state.password != '') {
          request.post({url: window.location.origin + '/api/login', form: {username: this.state.userName, password: this.state.password}}, function(err, response, body){
              switch (response.statusCode) {
                case 200:
                  window.location = JSON.parse(body).url

                  break;
                case 404:
                  alert(JSON.parse(body).message)
                  break;
                default:
              }
          })
        } else {
          alert('Please fill data')
        }
    }

    registerSubmit() {
        let that = this
        if (this.state.userName != '' && this.state.password != '' && this.state.role != null) {
          request.post({url: window.location.origin + '/api/register', form: {username: this.state.userName, password: this.state.password, role: this.state.role}}, function(err, response, body){
              alert(JSON.parse(body).message)
              switch (response.statusCode) {
                case 200:
                  that.setState({isLogin: !that.state.isLogin, userName: '', password: '', role: null})
                  break;
                default:
              }
          })
        } else {
          alert('Please fill data')
        }
    }

    usernameChange(evt) {
        this.setState({userName: evt.target.value})
    }

    passwordChange(evt) {
        this.setState({password: evt.target.value})
    }

    roleChange(evt) {
        this.setState({role: evt.target.value})
    }

    buttonPartial() {
          if (this.state.isLogin) {
            return (
              <div className="button-wrapper">
                <div className="row">
                  <button type="button" className="btn btn-success" onClick={this.loginSubmit}>Login</button><button type="button" className="btn btn-danger" onClick={this.register}>Register</button>
                </div>
              </div>
            )
          } else {
            return (
              <div className="button-wrapper">
                <div className="row">
                  <select className="form-control" id="exampleFormControlSelect1" onChange={this.roleChange}>
                    <option value="null">- Pilih Role -</option>
                    <option value="Operator">Operator</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>
                <div className="row">
                  <button type="button" className="btn btn-danger" onClick={this.registerSubmit}>Register</button>
                </div>
                <div className="row">
                  <button type="button" className="btn btn-primary" onClick={this.register}>Kembali Login</button>
                </div>
              </div>
            )
          }
    }

    register() {
        this.setState({isLogin: !this.state.isLogin, userName: '', password: ''})
    }

    render() {
        return (
          <div className="login-wrapper">
              <div className="row">
                <header className="App-header hover">
                  <h5 className="App-title">{(this.state.isLogin) ? "LOGIN" : "REGISTER"}</h5>
                </header>
              </div>
              <div className="row">
                <input type="text" placeholder="Username" onChange={this.usernameChange} value={this.state.userName}/>
              </div>
              <div className="row">
                <input type="password" placeholder="Password" onChange={this.passwordChange} value={this.state.password}/>
              </div>
              {this.buttonPartial()}
          </div>
        );
    }
}

export default Login;
