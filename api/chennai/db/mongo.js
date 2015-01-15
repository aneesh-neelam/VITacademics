/*
 *  VITacademics
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/VITacademics';


exports.update = function (doc, keys, callback) {
    var onConnect = function (err, db) {
        if (err) {
            callback(err);
        }
        else {
            var change = {};
            var onEach = function (item) {
                change[item] = doc[item];
            };
            keys.forEach(onEach);

            var collection = db.collection('chennai_student');
            var onUpdate = function (err, docs) {
                if (err) {
                    callback(err);
                }
                else {
                    db.close();
                    callback(null);
                }
            };
            collection.findAndModify({reg_no: doc.reg_no}, [
                ['reg_no', 'asc']
            ], {$set: change}, {safe: true, new: true, upsert: true}, onUpdate);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};

exports.fetch = function (queryDoc, keys, callback) {
    var onConnect = function (err, db) {
        if (err) {
            callback(err);
        }
        else {
            var collection = db.collection('chennai_student');
            var onFetch = function (err, doc) {
                if (err) {
                    callback(err);
                }
                else {
                    db.close();
                    callback(null, doc);
                }
            };
            collection.findOne(queryDoc, keys, onFetch)
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};
