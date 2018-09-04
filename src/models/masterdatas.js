"use strict";

import mongoose from 'mongoose'
import * as dotenv from "dotenv";

dotenv.config()
dotenv.load()

mongoose.connect('mongodb://' + process.env.DBUSER + ':' + process.env.DBPASSWORD + '@' + process.env.DBHOST + ':' + process.env.DBPORT + '/' + process.env.DBNAME + '', { autoIndex: false , useNewUrlParser: true});

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const masterdataSchema = new Schema({
    id: ObjectId,
    code: { type: String, required: true, unique: true },
    name: String,
    price: Number,
});

let Masterdatas = mongoose.model('Masterdatas', masterdataSchema);

module.exports = Masterdatas
