"use strict";

import Express from 'express'
import redis from 'redis'
import bodyParser from 'body-parser'
import cookie from 'cookie'
import * as dotenv from "dotenv";

dotenv.config()
dotenv.load()

let urlencodedParser = bodyParser.urlencoded({ extended: false })

let router = Express.Router()
let redisClient = redis.createClient(process.env.REDISPORT, process.env.REDISHOST);

router.get('/', function (req, res) {
  return res.render('login');
});

router.get('/masterdata', urlencodedParser, function (req, res) {
  validateToken('masterdata','Operator', req, res)
});

router.get('/cashier', function (req, res) {
  validateToken('cashier','Cashier', req, res)
});

router.get('/logout', function (req, res) {
  let cookies = cookie.parse(req.headers.cookie || '')

  if (cookies.token != undefined) {
    redisClient.del(cookies.token)
  }

  res.clearCookie("token");
  return res.redirect('/')
});

const validateToken = (url, role, req, res) => {
  let cookies = cookie.parse(req.headers.cookie || '')

  if (cookies.token != undefined) {
      redisClient.get(cookies.token, function (error, value) {
          if (error) return cb(error);

          if (value != null) {
              if (JSON.parse(value).role == role)
                return res.render(url)
              else
                return res.redirect('/')
          } else {
              return res.redirect('/')
          }
      });
  } else {
    return res.redirect('/')
  }
}

export { router as appRoute }
