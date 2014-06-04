var config = require('../../config');
var MongoClient = require('mongodb').MongoClient;

exports.insert = function (doc, callback)
{
    MongoClient.connect(config.MongoDB, function (err, db)
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
    MongoClient.connect(config.MongoDB, function (err, db)
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