"use strict";

import mongoose from 'mongoose'
import Itempayments from './itempayments.js'
import * as dotenv from "dotenv";

dotenv.config()
dotenv.load()

mongoose.connect('mongodb://' + process.env.DBUSER + ':' + process.env.DBPASSWORD + '@' + process.env.DBHOST + ':' + process.env.DBPORT + '/' + process.env.DBNAME + '', { autoIndex: false , useNewUrlParser: true});

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const checkoutsSchema = new Schema({
    id: ObjectId,
    subtotal: Number,
    totalitem: Number,
    date: Date,
    items: [{ type: Schema.Types.ObjectId, ref: 'Itempayments' }]
});

let Checkouts = mongoose.model('Checkouts', checkoutsSchema);

module.exports = Checkouts
