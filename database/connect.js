var mysql = require('mysql');
require('dotenv').config();

var host = {
    host : process.env.APPSETTING_DB_HOST,
    user : process.env.APPSETTING_DB_USER,
    password : process.env.APPSETTING_DB_PASSWORD,
    database : process.env.APPSETTING_DB_NAME
};

console.log(process.env.APPSETTING_DB_HOST + ', ' + process.env.APPSETTING_DB_USER + ', ' + process.env.APPSETTING_DB_PASSWORD + ', ' + process.env.APPSETTING_DB_NAME);

var pool = mysql.createPool(host);

var connection = function(callback) {
    pool.getConnection(function(err, connection) {
        if (!err) {
            console.log("Connected to the DB");
            connection.on('error', function(err) {
                if (err.code == 'PROTOCOL_SEQUENCE_TIMEOUT') {
                    console.log('Got a DB PROTOCOL_SEQUENCE_TIMEOUT Error ... ignoring ');
                } else {
                console.log('Got a DB Error: ', err);
                }
            });
            callback(null, connection);
        } else {
            callback(err, null);
        }
    });
};

 module.exports = connection;