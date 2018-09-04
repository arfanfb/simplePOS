"use strict";

import React, { Component } from 'react'
import request from 'request'
import xlsx from 'xlsx'

class Masterdatas extends Component {
    constructor(props, context) {
      super(props, context);

      this.state = {
        formActive: false,
        code: '',
        name: '',
        price: 0,
        id: null,
        cart: [],
        action: null,
        code: '',
        qty: 0,
        subtotal: 0,
        totalitem: 0,
        datefrom: '',
        dateto: '',
        report: []
      };

      this.codeChange = this.codeChange.bind(this)
      this.qtyChange = this.qtyChange.bind(this)
      this.addCart = this.addCart.bind(this)
      this.checkout = this.checkout.bind(this)
      this.datefromChange = this.datefromChange.bind(this)
      this.datetoChange = this.datetoChange.bind(this)
      this.submitReport = this.submitReport.bind(this)
      this.exportReport = this.exportReport.bind(this)
      this.logout = this.logout.bind(this)
    }

    logout() {
      window.location = 'logout'
    }

    karatsubaAlgorithm(items) {
      let mid = (items === undefined) ? Math.round(this.state.cart.length / 2) : Math.round(items.length / 2)
      let arrOne = (items === undefined) ? this.state.cart.slice(0, mid) : items.slice(0, mid)
      let arrTwo = (items === undefined) ? this.state.cart.slice(mid, this.state.cart.length) : items.slice(mid, items.length)
      let res = []

      for (var i = 0; i < arrOne.length; i++) {
          if (arrOne[i] && arrOne[i+1]) {
            if (arrOne[i].subtotal > arrOne[i+1].subtotal) {
              var temp = arrOne[i]
              arrOne[i] = arrOne[i+1]
              arrOne[i+1] = temp
            }
          }

          if (arrTwo[i] && arrTwo[i+1]) {
            if (arrTwo[i].subtotal > arrTwo[i+1].subtotal) {
              var temp = arrTwo[i]
              arrTwo[i] = arrTwo[i+1]
              arrTwo[i+1] = temp
            }
          }
      }

      while (arrOne.length > 0 || arrTwo.length > 0) {
        if (arrOne[0] !== undefined && arrTwo[0] !== undefined) {
          if (arrOne[0].subtotal < arrTwo[0].subtotal) {
            res.push(arrOne[0])
            arrOne.shift()
          } else {
            res.push(arrTwo[0])
            arrTwo.shift()
          }
        } else if (arrTwo[0] == undefined) {
          res.push(arrOne[0])
          arrOne.shift()
        } else {
          res.push(arrTwo[0])
          arrTwo.shift()
        }
      }

      if (items === undefined) {
        this.setState({cart: res})
      } else {
        return res
      }
    }

    codeChange(evt) {
      this.setState({code: evt.target.value})
    }

    qtyChange(evt) {
      this.setState({qty: evt.target.value})
    }

    datefromChange(evt) {
      this.setState({datefrom: evt.target.value})
    }

    datetoChange(evt) {
      this.setState({dateto: evt.target.value})
    }

    submitReport() {
      let that = this

      if (this.state.datefrom != '' && this.state.dateto != '') {
        request.post({url: window.location.origin + '/api/report', form: {datefrom: this.state.datefrom, dateto: this.state.dateto}}, function(err, response, body){
            switch (response.statusCode) {
              case 200:
                let resJson = JSON.parse(body)
                that.setState({report: resJson.checkout, datefrom: '', dateto: ''})
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

    exportReport() {
      if (this.state.report.length > 0) {
        let header = [
            'ID',
            'Subtotal',
            'Total Item',
            'Date',
            'Detail Item'
        ]

        let report = []
        let that = this

        this.state.report.map((item, idx) => {
          let date = new Date(item.date)
          let detailItems = []

          item.items.map((detailItem, index) => {
              let objItem = {
                name: detailItem.item.name,
                code: detailItem.item.code,
                price: detailItem.item.price,
                totalitem: detailItem.totalitem,
                subtotal: detailItem.subtotal
              }

              detailItems.push(objItem)
          })

          detailItems = that.karatsubaAlgorithm(detailItems)

          let itemReport = {
            'ID': item._id,
            'Subtotal': item.subtotal,
            'Total Item': item.totalitem,
            'Date': date.getDate() +  '-' + date.getMonth() + '-' + date.getFullYear(),
            'Detail Item': JSON.stringify(detailItems)
          }

          report.push(itemReport)
        })

        let ws = xlsx.utils.json_to_sheet(report, {header: header});
        let wb = xlsx.utils.book_new()

        xlsx.utils.book_append_sheet(wb, ws, "Report")
        xlsx.writeFile(wb, "Tes Report.xlsx")


      }
    }

    doAction(action) {
      this.setState({action: action})
    }

    checkout() {
      let that = this

      if (this.state.cart.length > 0 && this.state.subtotal > 0 && this.state.totalitem > 0) {
        request.post({url: window.location.origin + '/api/checkout', form: {cart: JSON.stringify(this.state.cart), subtotal: this.state.subtotal, totalitem: this.state.totalitem}}, function(err, response, body){
            alert(JSON.parse(body).message)
            switch (response.statusCode) {
              case 200:
                that.setState({formActive: !that.state.formActive, code: '', name: '', price: 0, masterdata: that.state.masterdata, cart: [], action: null, subtotal: 0, totalitem: 0})
                break;
              default:
            }
        })
      } else {
        alert('Please fill data')
      }
    }

    addCart() {
      let that = this
      request.get({url: window.location.origin + '/api/masterdata/' + this.state.code}, function(err, response, body){
          switch (response.statusCode) {
            case 200:
              let item = JSON.parse(body).data
              let index = that.state.cart.findIndex(data => data.id === item._id);

              if (index < 0) {
                let newCart = {
                  id: item._id,
                  code: item.code,
                  name: item.name,
                  qty: that.state.qty,
                  price: item.price,
                  subtotal: parseInt(item.price) * parseInt(that.state.qty)
                }

                that.state.subtotal += newCart.subtotal
                that.state.totalitem += parseInt(newCart.qty)
                that.state.cart.push(newCart)
              } else {
                let oldSubtotal = that.state.cart[index].subtotal
                let oldQty = that.state.cart[index].qty

                that.state.cart[index].qty = parseInt(that.state.cart[index].qty) + parseInt(that.state.qty)
                that.state.cart[index].subtotal = parseInt(item.price) * parseInt(that.state.cart[index].qty)
                that.state.subtotal = that.state.subtotal - oldSubtotal + that.state.cart[index].subtotal
                that.state.totalitem = that.state.totalitem  - oldQty + that.state.cart[index].qty
              }

              that.karatsubaAlgorithm()

              that.setState({formActive: !that.state.formActive, code: '', qty: 0, cart: that.state.cart, subtotal: that.state.subtotal, totalitem: that.state.totalitem})
              break;
            default:
              alert('Produk tidak ditemukan')
              break;
          }
      })
    }

    formPartial() {
      if (this.state.action == "create") {
        return (
          <div>
            <div className="form">
              <div className="row">
                <input type="text" name="code" placeholder="Kode" value={this.state.code} onChange={this.codeChange} />
              </div>
              <div className="row">
                <input type="text" name="kuantiti" placeholder="Qty" value={this.state.qty} onChange={this.qtyChange}/>
              </div>
              <div className="row">
                <button type="button" className="btn btn-primary btn-sm" onClick={this.addCart}>Tambah Item</button>
              </div>
            </div>
            <div className="row">
              {this.tablePartial()}
            </div>
            <div className="row">
              {
                this.state.cart.length > 0 &&
                <button type="button" className="btn btn-success btn-sm" onClick={this.checkout}>Bayar</button>
              }
            </div>
          </div>
        )
      } else if (this.state.action == "report") {
        return (
          <div className="form">
            <div className="row">
              From:
            </div>
            <div className="row">
              <input type="date" value={this.state.datefrom} onChange={this.datefromChange}/>
            </div>
            <div className="row">
              To:
            </div>
            <div className="row">
              <input type="date" value={this.state.dateto} onChange={this.datetoChange}/>
            </div>
            <div className="row">
              <button type="button" className="btn btn-primary btn-sm" onClick={this.submitReport}>Submit</button>
            </div>
            <div className="row">
              <button type="button" className="btn btn-success btn-sm" onClick={this.exportReport}>Export to Excel</button>
            </div>
            <div className="row">
              {this.tablereportPartial()}
            </div>
          </div>
        )
      }
    }

    deleteItem(idx) {
        this.state.subtotal -= this.state.cart[idx].subtotal
        this.state.cart.splice(idx, 1)

        this.setState({cart: this.state.cart, subtotal: this.state.subtotal})
    }

    generateCart(carts) {
      let that = this
      if (carts.length > 0) {
        return (
          <tbody>
          {
            carts.map((item,idx) =>
              {
                return (
                  <tr key={item._id}>
                    <th scope="row">{item.code}</th>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{item.subtotal}</td>
                    <td><button type="button" className="btn btn-danger btn-sm" onClick={that.deleteItem.bind(this, idx)}>DELETE</button></td>
                  </tr>
                )
              }
            )
          }
          <tr>
            <td colSpan='3'>
              TOTAL
            </td>
            <td>
              {this.state.subtotal}
            </td>
            <td>
            </td>
          </tr>
          </tbody>
        )
      } else {
        return (
          <tbody>
            <tr>
              <td colSpan="4">CART EMPTY</td>
            </tr>
          </tbody>
        )
      }
    }

    generateReport(reports) {
      let that = this
      if (reports.length > 0) {
        return (
          <tbody>
          {
            reports.map((item,idx) =>
              {
                return (
                  <tr key={item._id}>
                    <th scope="row">{item._id}</th>
                    <td>{item.subtotal}</td>
                    <td>{item.totalitem}</td>
                    <td>{item.date}</td>
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
              <td colSpan="4">No date result</td>
            </tr>
          </tbody>
        )
      }
    }

    tablePartial() {
      return (
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th scope="col">Kode </th>
              <th scope="col">Nama Produk</th>
              <th scope="col">Qty</th>
              <th scope="col">Total</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          {this.generateCart(this.state.cart)}
        </table>
      )
    }

    tablereportPartial() {
      return (
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th scope="col">ID </th>
              <th scope="col">Subtotal</th>
              <th scope="col">Total Item</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          {this.generateReport(this.state.report)}
        </table>
      )
    }

    render() {
        return (
          <div className="masterdata-wrapper">
              <div className="row">
                <header className="App-header hover">
                  <h5 className="App-title">Cashier  <button type="button" className="btn btn-danger btn-sm" onClick={this.logout}>LOGOUT</button></h5>
                </header>
              </div>
              <div className="row">
                <button type="button" className="btn btn-primary btn-sm" onClick={this.doAction.bind(this, 'create')}>Create Transaction</button>
                <div>&nbsp;</div>
                <button type="button" className="btn btn-primary btn-sm" onClick={this.doAction.bind(this, 'report')}>Report Transaction</button>
              </div>
              <div className="row">
                {this.formPartial()}
              </div>
          </div>
        );
    }
}

export default Masterdatas;
