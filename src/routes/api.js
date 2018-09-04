"use strict";

import cookie from 'cookie'
import Express from 'express'
import mongoose from 'mongoose'
import redis from 'redis'
import bodyParser from 'body-parser'
import crypto from 'crypto'
import Users from '../models/users.js'
import Masterdatas from '../models/masterdatas.js'
import Checkouts from '../models/checkouts.js'
import Itempayments from '../models/itempayments.js'
import * as dotenv from "dotenv";

dotenv.config()
dotenv.load()

let router = Express.Router()
let urlencodedParser = bodyParser.urlencoded({ extended: false })

router.post('/report', urlencodedParser, (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let datefrom = req.body.datefrom
    let dateto = req.body.dateto

    Checkouts.find({ date: {$gte: new Date(datefrom), $lt: new Date(dateto)}}).
    populate({
       path: 'items',
       populate: {
         path: 'item',
         model: 'Masterdatas'
       }
    }).
    exec(function(err, checkout) {
      if (err) throw err;

      res.status(200);
      res.send(JSON.stringify({checkout: checkout}));
    });
})

router.post('/checkout', urlencodedParser, (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let cart = JSON.parse(req.body.cart)
    let subtotal = req.body.subtotal
    let totalitem = req.body.totalitem
    let itemCheckout = []
    let promises

    let newCheckout = Checkouts({
      subtotal: parseInt(subtotal),
      totalitem: parseInt(totalitem),
      date: Date.now()
    });

    newCheckout.save(function(err) {
      if (err) throw err;

      const cartLen = cart.length

      cart.map((item,idx) =>
        {
          let newItempayment = Itempayments({
            subtotal: item.subtotal,
            totalitem: item.qty,
            item: item.id
          });

          newItempayment.save(function(err) {
            if (err) throw err;

            itemCheckout.push(newItempayment)

            if (cartLen === idx + 1) {
                newCheckout.items = itemCheckout
                newCheckout.save(function(err) {
                    if (err) throw err;

                    res.status(200);
                    res.send(JSON.stringify({message: "Checkout success", newCheckout: newCheckout}));
                })
            }
          })
        }
      )
    });
})

router.post('/masterdata/add', urlencodedParser, (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let code = req.body.code
    let name = req.body.name
    let price = req.body.price

    Masterdatas.find({ code: code }, function(err, data) {
      if (err) throw err;

      if (data.length == 0) {
        let newData = Masterdatas({
          code: code,
          name: name,
          price: price,
        });

        newData.save(function(err) {
          if (err) throw err;

          res.status(200);
          res.send(JSON.stringify({message: "Add data success", newData: newData}));
        });
      } else {
        res.status(406);
        res.send(JSON.stringify({message: "Already Registered"}));
      }
    });
})

router.put('/masterdata/edit/:id', urlencodedParser, (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let id = req.params.id
    let code = req.body.code
    let name = req.body.name
    let price = req.body.price

    Masterdatas.findOne({ _id: id }, function(err, data) {
      if (err) throw err;

      if (data) {
        data.code = code
        data.name = name
        data.price = price

        data.save(function(err) {
          if (err) throw err;

          res.status(200);
          res.send(JSON.stringify({message: "Edit data success", data: data}));
        });
      } else {
        res.status(446);
        res.send(JSON.stringify({message: "Data not found"}));
      }
    });
})

router.get('/masterdata/:code', urlencodedParser, (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let code = req.params.code

    Masterdatas.findOne({

      $and: [
          { $or: [{code: code}, {name: new RegExp('^' + code + '$', "i")}] },
      ]
    }, function(err, data) {
      if (err) throw err;

      if (data) {
        res.status(200);
        res.send(JSON.stringify({data: data}));
      } else {
        res.status(446);
        res.send(JSON.stringify({message: "Data not found"}));
      }
    });
})

router.get('/masterdata/:page/:limit', (req, res) => {
    let next = null
    let previous = null
    let page = req.params.page
    let limit = req.params.limit
    let response = res

    let task = Masterdatas.find({}, null, { skip: (page - 1) * limit , sort: {'_id': -1}}).limit(parseInt(limit));

    task.exec(function(err, datas) {
        let taskNext = Masterdatas.findOne({}, null, { skip: page * limit , sort: {'_id': -1}})

        taskNext.exec(function(err, data) {
          if (data) {
              next = parseInt(page) + 1
          }

          if (page > 1) {
              previous = page - 1
          }

          response.setHeader('Content-Type', 'application/json');
          response.status(200);
          response.send(JSON.stringify({data: datas, page: page, next: next, previous: previous}));
        })
    })
})

router.post('/login', urlencodedParser, (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let username = req.body.username
    let password = crypto.createHash('sha256').update(req.body.password).digest('base64')

    Users.findOne({ username: username , password: password}, function(err, user) {
      if (err) throw err;

      if (user != null) {
        let client = redis.createClient(process.env.REDISPORT, process.env.REDISHOST);
        let key =  crypto.createHash('sha256').update(username + new Date().toLocaleString()).digest('base64')
        let url = '/'

        client.set(key, JSON.stringify(user), 'EX', 86400);

        res.setHeader('Set-Cookie', cookie.serialize('token', key, {
          httpOnly: true,
          maxAge: 60 * 60 * 24,
          path: '/'
        }));

        if (user.role == "Operator") {
          url = 'masterdata'
        } else {
          url = 'cashier'
        }

        res.status(200);
        res.send(JSON.stringify({accessToken: key, url: url}));
      } else {
        res.status(404);
        res.send(JSON.stringify({message: "Invalid user. Please check your username and password."}));
      }
    });
})

router.post('/register', urlencodedParser, (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let username = req.body.username
    let password = crypto.createHash('sha256').update(req.body.password).digest('base64')
    let role = req.body.role

    Users.find({ username: username }, function(err, user) {
      if (err) throw err;


      if (user.length == 0) {
        let newUser = Users({
          username: username,
          password: password,
          role: role,
          createdAt: Date.now(),
        });

        newUser.save(function(err) {
          if (err) throw err;

          res.status(200);
          res.send(JSON.stringify({message: "Register success, please login."}));
        });
      } else {
        res.status(406);
        res.send(JSON.stringify({message: "Already Registered"}));
      }
    });
})

function validateToken(token) {
  client.get(token, function (err, result) {
      if (err) throw err;

      if (result) {
          return true
      }

      return false
  });
}


export { router as apiRoute }
