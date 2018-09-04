"use strict";

import React, { Component } from 'react'
import request from 'request'

class Masterdatas extends Component {
    constructor(props, context) {
      super(props, context);

      this.state = {
        masterdata: [],
        formActive: false,
        pagination: null,
        page: 1,
        previous: null,
        next: null,
        code: '',
        name: '',
        price: 0,
        action: 'close',
        id: null
      };

      this.loadMasterdata(10)
      this.navPartial = this.navPartial.bind(this)
      this.addSubmit = this.addSubmit.bind(this)
      this.codeChange = this.codeChange.bind(this)
      this.nameChange = this.nameChange.bind(this)
      this.priceChange = this.priceChange.bind(this)
      this.previous = this.previous.bind(this)
      this.next = this.next.bind(this)
      this.page = this.page.bind(this)
      this.logout = this.logout.bind(this)
    }

    logout() {
      window.location = 'logout'
    }

    addSubmit() {
      let that = this
      if (this.state.code != '' && this.state.name != '' && this.state.price > 0) {
        request.post({url: window.location.origin + '/api/masterdata/add', form: {code: this.state.code, name: this.state.name, price: this.state.price}}, function(err, response, body){
            alert(JSON.parse(body).message)
            switch (response.statusCode) {
              case 200:
                that.state.masterdata.pop()
                that.state.masterdata.unshift(JSON.parse(body).newData)
                that.setState({formActive: !that.state.formActive, code: '', name: '', price: 0, masterdata: that.state.masterdata})
                break;
              default:
            }
        })
      } else {
        alert('Please fill data')
      }
    }

    editSubmit() {
      let that = this
      if (this.state.code != '' && this.state.name != '' && this.state.price > 0) {
        request.put({url: window.location.origin + '/api/masterdata/edit/' + this.state.id, form: {code: this.state.code, name: this.state.name, price: this.state.price}}, function(err, response, body){
            alert(JSON.parse(body).message)
            switch (response.statusCode) {
              case 200:
                let index = that.state.masterdata.findIndex(item => item._id === that.state.id);
                that.state.masterdata[index] = JSON.parse(body).data
                that.setState({formActive: !that.state.formActive, code: '', name: '', price: 0, masterdata: that.state.masterdata, action: 'close'})
                break;
              default:
            }
        })
      } else {
        alert('Please fill data')
      }
    }

    previous() {
      this.state.page--
      this.loadMasterdata(10)
    }

    next() {
      this.state.page++
      this.loadMasterdata(10)
    }

    page(pageTo) {
      this.state.page = pageTo
      this.loadMasterdata(10)
    }

    pageCLick(pageTo) {
      console.log(pageTo)
      this.state.page = pageTo
      this.loadMasterdata(10)
    }

    form(action, item) {
      if (action == 'new') {
          this.setState({formActive: false, code: '', name: '', price: 0, action: 'close'})
      } else if (action == 'edit') {
          this.setState({formActive: true, id: item._id, code: item.code, name: item.name, price: item.price, action: 'edit'})
      } else {
          this.setState({formActive: true, code: '', name: '', price: 0, action: 'new'})
      }
    }

    formPartial() {
      if (this.state.formActive) {
        return (
          <div className="form">
            <div className="row">
              <input type="text" name="code" placeholder="Kode" value={this.state.code} onChange={this.codeChange} />
            </div>
            <div className="row">
              <input type="text" name="name" placeholder="Nama" value={this.state.name} onChange={this.nameChange}/>
            </div>
            <div className="row">
              <input type="text" name="price" placeholder="Harga" value={this.state.price} onChange={this.priceChange}/>
            </div>
          </div>
        )
      }
    }

    codeChange(evt) {
      this.setState({code: evt.target.value})
    }

    nameChange(evt) {
      this.setState({name: evt.target.value})
    }

    priceChange(evt) {
      this.setState({price: evt.target.value})
    }

    loadMasterdata(limit) {
      let that = this
      let page = this.state.page

      request.get({url: window.location.origin + '/api/masterdata/' + page + '/' + limit}, function(err, response, body){
          switch (response.statusCode) {
            case 200:
              let resJson = JSON.parse(body)
              that.setState({masterdata: resJson.data, page: resJson.page, previous: resJson.previous, next: resJson.next})
              break;
            case 404:
              alert(JSON.parse(body).message)
              break;
            default:
          }
      })
    }

    generateMasterdata(masterdata) {
      let that = this
      if (masterdata.length > 0) {
        return (
          <tbody>
          {
            masterdata.map((item,idx) =>
              {
                return (
                  <tr key={item._id}>
                    <th scope="row">{item.code}</th>
                    <td>{item.name}</td>
                    <td>{item.price}</td>
                    <td><button type="button" className="btn btn-primary btn-sm" onClick={that.form.bind(this, 'edit', item)}>Edit Data</button></td>
                  </tr>
                )
              }
            )
          }
          </tbody>
        )
      } else {
        return (
          <tbody>
            <tr>
              <td colSpan="4">No Data</td>
            </tr>
          </tbody>
        )
      }
    }

    navPartial() {
      return (
        <nav aria-label="...">
          <ul className="pagination pagination-sm">
            {
              this.state.previous != null &&
              <li className="page-item">
                <span className="page-link" onClick={this.previous}>Previous</span>
              </li>
            }
            {
              this.state.previous != null &&
              <li className="page-item" onClick={this.pageCLick.bind(this,this.state.previous)}><a className="page-link" href="#">{this.state.previous}</a></li>
            }
            <li className="page-item active">
              <span className="page-link">
                {this.state.page}
                <span className="sr-only">(current)</span>
              </span>
            </li>
            {this.state.next != null &&
              <li className="page-item" onClick={this.pageCLick.bind(this,this.state.next)}><a className="page-link" href="#">{this.state.next}</a></li>
            }
            {this.state.next != null &&
              <li className="page-item">
                <span className="page-link" onClick={this.next}>Next</span>
              </li>
            }
          </ul>
        </nav>
      )
    }

    tablePartial() {
      return (
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th scope="col">Kode </th>
              <th scope="col">Nama Roti</th>
              <th scope="col">Harga</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          {this.generateMasterdata(this.state.masterdata)}
        </table>
      )
    }

    buttonPartial() {
      return (
        <div className="button-wrapper">
          <div className="row">
            {
              this.state.formActive &&
              <button type="button" className="btn btn-success btn-sm" onClick={(this.state.action == 'new') ? this.addSubmit : this.editSubmit.bind(this)}>{(this.state.action == 'new') ? "Add Data" : "Edit Data"}</button>
            }
            <button type="button" className="btn btn-primary btn-sm" onClick={this.form.bind(this, (!this.state.formActive) ? "close" : "new", null)}>{(!this.state.formActive) ? "Add Masterdata" : "Close"}</button>
          </div>
        </div>
      )
    }

    render() {
        return (
          <div className="masterdata-wrapper">
              <div className="row">
                <header className="App-header hover">
                  <h5 className="App-title">Masterdata <button type="button" className="btn btn-danger btn-sm" onClick={this.logout}>LOGOUT</button></h5>
                </header>
              </div>
              <div className="row">
                {this.formPartial()}
              </div>
              <div className="row">
                {this.buttonPartial()}
              </div>
              <div className="row">
                {this.tablePartial()}
              </div>
              <div className="row">
                {this.navPartial()}
              </div>
          </div>
        );
    }
}

export default Masterdatas;
