var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/VITacademics';

exports.insert = function (doc, callback)
{
    var onConnect = function (err, db)
    {
        if (err) callback(err);
        else
        {
            var collection = db.collection('vellore_student');
            var onUpdate = function (err, docs)
            {
                db.close();
                callback(null);
            };
            collection.update({"RegNo": doc.RegNo}, doc, {upsert: true}, onUpdate);
        }
    };
    MongoClient.connect(mongoUri, onConnect);
};