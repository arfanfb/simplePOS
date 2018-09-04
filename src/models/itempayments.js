"use strict";

import mongoose from 'mongoose'
import Masterdatas from './masterdatas.js'
import * as dotenv from "dotenv";

dotenv.config()
dotenv.load()

mongoose.connect('mongodb://' + process.env.DBUSER + ':' + process.env.DBPASSWORD + '@' + process.env.DBHOST + ':' + process.env.DBPORT + '/' + process.env.DBNAME + '', { autoIndex: false , useNewUrlParser: true});

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const itempaymentsSchema = new Schema({
    id: ObjectId,
    totalitem: Number,
    subtotal: Number,
    item: { type: Schema.Types.ObjectId, ref: 'Masterdatas' }
});

let Itempayments = mongoose.model('Itempayments', itempaymentsSchema);

module.exports = Itempayments
