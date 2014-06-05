var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/VITacademics';

exports.insert = function (doc, callback)
{
    MongoClient.connect(mongoUri, function (err, db)
    {
        if (err) throw err;
        var collection = db.collection('vellore_student');
        collection.update({"RegNo": doc.RegNo}, doc, {upsert: true}, function (error, docs)
        {
            callback(function ()
                     {
                         db.close();
                     });
        });
    });
};

exports.fetch = function (doc, callback)
{
    MongoClient.connect(mongoUri, function (err, db)
    {
        if (err) throw err;
        var collection = db.collection('vellore_student');
        var cursor = collection.find({"RegNo": doc.RegNo});
        cursor.toArray(function (error, docs)
                       {
                           callback(docs[0], function ()
                           {
                               db.close();
                           });
                       });
    });
};