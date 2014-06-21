var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/VITacademics';

exports.update = function (doc, key, callback)
{
    var onConnect = function (err, db)
    {
        if (err) callback(err);
        else
        {
            var change = {};
            change[key] = doc[key];
            var collection = db.collection('vellore_student');
            var onUpdate = function (err, docs)
            {
                if (err) callback(err);
                else
                {
                    db.close();
                    callback(null);
                }
            };
            collection.findAndModify({RegNo: doc.RegNo}, [
                ['RegNo', 'asc']
            ], {$set: change}, {safe: true, new: true, upsert: true}, onUpdate);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};