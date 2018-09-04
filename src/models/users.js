"use strict";

import mongoose from 'mongoose'
import * as dotenv from "dotenv";

dotenv.config()
dotenv.load()

mongoose.connect('mongodb://' + process.env.DBUSER + ':' + process.env.DBPASSWORD + '@' + process.env.DBHOST + ':' + process.env.DBPORT + '/' + process.env.DBNAME + '', { autoIndex: false , useNewUrlParser: true});

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    id: ObjectId,
    username: { type: String, required: true, unique: true },
    password: String,
    role: String,
    createdAt: String,
});

let Users = mongoose.model('Users', userSchema);

module.exports = Users
