"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.apiRoute = void 0;

var _cookie = _interopRequireDefault(require("cookie"));

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _redis = _interopRequireDefault(require("redis"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _crypto = _interopRequireDefault(require("crypto"));

var _users = _interopRequireDefault(require("../models/users.js"));

var _masterdatas = _interopRequireDefault(require("../models/masterdatas.js"));

var _checkouts = _interopRequireDefault(require("../models/checkouts.js"));

var _itempayments = _interopRequireDefault(require("../models/itempayments.js"));

var dotenv = _interopRequireWildcard(require("dotenv"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

dotenv.config();
dotenv.load();

var router = _express.default.Router();

exports.apiRoute = router;

var urlencodedParser = _bodyParser.default.urlencoded({
  extended: false
});

router.post('/report', urlencodedParser, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var datefrom = req.body.datefrom;
  var dateto = req.body.dateto;

  _checkouts.default.find({
    date: {
      $gte: new Date(datefrom),
      $lt: new Date(dateto)
    }
  }).populate({
    path: 'items',
    populate: {
      path: 'item',
      model: 'Masterdatas'
    }
  }).exec(function (err, checkout) {
    if (err) throw err;
    res.status(200);
    res.send(JSON.stringify({
      checkout: checkout
    }));
  });
});
router.post('/checkout', urlencodedParser, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var cart = JSON.parse(req.body.cart);
  var subtotal = req.body.subtotal;
  var totalitem = req.body.totalitem;
  var itemCheckout = [];
  var promises;
  var newCheckout = (0, _checkouts.default)({
    subtotal: parseInt(subtotal),
    totalitem: parseInt(totalitem),
    date: Date.now()
  });
  newCheckout.save(function (err) {
    if (err) throw err;
    var cartLen = cart.length;
    cart.map(function (item, idx) {
      var newItempayment = (0, _itempayments.default)({
        subtotal: item.subtotal,
        totalitem: item.qty,
        item: item.id
      });
      newItempayment.save(function (err) {
        if (err) throw err;
        itemCheckout.push(newItempayment);

        if (cartLen === idx + 1) {
          newCheckout.items = itemCheckout;
          newCheckout.save(function (err) {
            if (err) throw err;
            res.status(200);
            res.send(JSON.stringify({
              message: "Checkout success",
              newCheckout: newCheckout
            }));
          });
        }
      });
    });
  });
});
router.post('/masterdata/add', urlencodedParser, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var code = req.body.code;
  var name = req.body.name;
  var price = req.body.price;

  _masterdatas.default.find({
    code: code
  }, function (err, data) {
    if (err) throw err;

    if (data.length == 0) {
      var newData = (0, _masterdatas.default)({
        code: code,
        name: name,
        price: price
      });
      newData.save(function (err) {
        if (err) throw err;
        res.status(200);
        res.send(JSON.stringify({
          message: "Add data success",
          newData: newData
        }));
      });
    } else {
      res.status(406);
      res.send(JSON.stringify({
        message: "Already Registered"
      }));
    }
  });
});
router.put('/masterdata/edit/:id', urlencodedParser, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var id = req.params.id;
  var code = req.body.code;
  var name = req.body.name;
  var price = req.body.price;

  _masterdatas.default.findOne({
    _id: id
  }, function (err, data) {
    if (err) throw err;

    if (data) {
      data.code = code;
      data.name = name;
      data.price = price;
      data.save(function (err) {
        if (err) throw err;
        res.status(200);
        res.send(JSON.stringify({
          message: "Edit data success",
          data: data
        }));
      });
    } else {
      res.status(446);
      res.send(JSON.stringify({
        message: "Data not found"
      }));
    }
  });
});
router.get('/masterdata/:code', urlencodedParser, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var code = req.params.code;

  _masterdatas.default.findOne({
    $and: [{
      $or: [{
        code: code
      }, {
        name: new RegExp('^' + code + '$', "i")
      }]
    }]
  }, function (err, data) {
    if (err) throw err;

    if (data) {
      res.status(200);
      res.send(JSON.stringify({
        data: data
      }));
    } else {
      res.status(446);
      res.send(JSON.stringify({
        message: "Data not found"
      }));
    }
  });
});
router.get('/masterdata/:page/:limit', function (req, res) {
  var next = null;
  var previous = null;
  var page = req.params.page;
  var limit = req.params.limit;
  var response = res;

  var task = _masterdatas.default.find({}, null, {
    skip: (page - 1) * limit,
    sort: {
      '_id': -1
    }
  }).limit(parseInt(limit));

  task.exec(function (err, datas) {
    var taskNext = _masterdatas.default.findOne({}, null, {
      skip: page * limit,
      sort: {
        '_id': -1
      }
    });

    taskNext.exec(function (err, data) {
      if (data) {
        next = parseInt(page) + 1;
      }

      if (page > 1) {
        previous = page - 1;
      }

      response.setHeader('Content-Type', 'application/json');
      response.status(200);
      response.send(JSON.stringify({
        data: datas,
        page: page,
        next: next,
        previous: previous
      }));
    });
  });
});
router.post('/login', urlencodedParser, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var username = req.body.username;

  var password = _crypto.default.createHash('sha256').update(req.body.password).digest('base64');

  _users.default.findOne({
    username: username,
    password: password
  }, function (err, user) {
    if (err) throw err;

    if (user != null) {
      var _client = _redis.default.createClient(process.env.REDISPORT, process.env.REDISHOST);

      var key = _crypto.default.createHash('sha256').update(username + new Date().toLocaleString()).digest('base64');

      var url = '/';

      _client.set(key, JSON.stringify(user), 'EX', 86400);

      res.setHeader('Set-Cookie', _cookie.default.serialize('token', key, {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        path: '/'
      }));

      if (user.role == "Operator") {
        url = 'masterdata';
      } else {
        url = 'cashier';
      }

      res.status(200);
      res.send(JSON.stringify({
        accessToken: key,
        url: url
      }));
    } else {
      res.status(404);
      res.send(JSON.stringify({
        message: "Invalid user. Please check your username and password."
      }));
    }
  });
});
router.post('/register', urlencodedParser, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var username = req.body.username;

  var password = _crypto.default.createHash('sha256').update(req.body.password).digest('base64');

  var role = req.body.role;

  _users.default.find({
    username: username
  }, function (err, user) {
    if (err) throw err;

    if (user.length == 0) {
      var newUser = (0, _users.default)({
        username: username,
        password: password,
        role: role,
        createdAt: Date.now()
      });
      newUser.save(function (err) {
        if (err) throw err;
        res.status(200);
        res.send(JSON.stringify({
          message: "Register success, please login."
        }));
      });
    } else {
      res.status(406);
      res.send(JSON.stringify({
        message: "Already Registered"
      }));
    }
  });
});

function validateToken(token) {
  client.get(token, function (err, result) {
    if (err) throw err;

    if (result) {
      return true;
    }

    return false;
  });
}
//# sourceMappingURL=api.js.map
