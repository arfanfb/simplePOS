"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appRoute = void 0;

var _express = _interopRequireDefault(require("express"));

var _redis = _interopRequireDefault(require("redis"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cookie = _interopRequireDefault(require("cookie"));

var dotenv = _interopRequireWildcard(require("dotenv"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

dotenv.config();
dotenv.load();

var urlencodedParser = _bodyParser.default.urlencoded({
  extended: false
});

var router = _express.default.Router();

exports.appRoute = router;

var redisClient = _redis.default.createClient(process.env.REDISPORT, process.env.REDISHOST);

router.get('/', function (req, res) {
  return res.render('login');
});
router.get('/masterdata', urlencodedParser, function (req, res) {
  validateToken('masterdata', 'Operator', req, res);
});
router.get('/cashier', function (req, res) {
  validateToken('cashier', 'Cashier', req, res);
});
router.get('/logout', function (req, res) {
  var cookies = _cookie.default.parse(req.headers.cookie || '');

  if (cookies.token != undefined) {
    redisClient.del(cookies.token);
  }

  res.clearCookie("token");
  return res.redirect('/');
});

var validateToken = function validateToken(url, role, req, res) {
  var cookies = _cookie.default.parse(req.headers.cookie || '');

  if (cookies.token != undefined) {
    redisClient.get(cookies.token, function (error, value) {
      if (error) return cb(error);

      if (value != null) {
        if (JSON.parse(value).role == role) return res.render(url);else return res.redirect('/');
      } else {
        return res.redirect('/');
      }
    });
  } else {
    return res.redirect('/');
  }
};
//# sourceMappingURL=app.js.map
