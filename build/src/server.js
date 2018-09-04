"use strict";

var _http = require("http");

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _app = require("./routes/app.js");

var _api = require("./routes/api.js");

var dotenv = _interopRequireWildcard(require("dotenv"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

dotenv.config();
dotenv.load();
console.log(process.env.PORT);
var app = new _express.default();
var server = new _http.Server(app);
app.use(_express.default.static(_path.default.join(__dirname, '../assets')));
app.use(_express.default.static(_path.default.join(__dirname, '../../node_modules/bootstrap/dist')));
app.disable('view cache');
app.set('view engine', 'ejs');
app.set('views', _path.default.join(__dirname, '../../src/views'));
app.use('/', _app.appRoute);
app.use('/api', _api.apiRoute); // start the server

var port = process.env.PORT || 8080;
var env = process.env.NODE_ENV || 'production';
server.listen(port, function (err) {
  if (err) {
    return console.error(err);
  }

  console.info("Server running on http://localhost:".concat(port, " [").concat(env, "]"));
});
//# sourceMappingURL=server.js.map
