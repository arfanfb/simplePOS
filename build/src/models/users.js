"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

var dotenv = _interopRequireWildcard(require("dotenv"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

dotenv.config();
dotenv.load();

_mongoose.default.connect('mongodb://' + process.env.DBUSER + ':' + process.env.DBPASSWORD + '@' + process.env.DBHOST + ':' + process.env.DBPORT + '/' + process.env.DBNAME + '', {
  autoIndex: false,
  useNewUrlParser: true
});

var Schema = _mongoose.default.Schema;
var ObjectId = Schema.ObjectId;
var userSchema = new Schema({
  id: ObjectId,
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  role: String,
  createdAt: String
});

var Users = _mongoose.default.model('Users', userSchema);

module.exports = Users;
//# sourceMappingURL=users.js.map
