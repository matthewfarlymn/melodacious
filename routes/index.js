var express = require('express');
var router = express.Router();
var database = require('../modules/database');

var signInError = "";
var registrationError = "";

/* INDEX */
router.get('/', function(req, res, next) {
    if (!req.session.email) {
        res.render('index', {
            title: 'Melodacious',
            signInError: signInError,
            registrationError: registrationError
        });
        signInError = "";
        registrationError = "";
    } else {
        res.redirect('/user/playlists');
    }
});

/* SIGN-OUT */
router.get('/sign-out', function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

/* SIGN-IN */
router.post('/sign-in', function(req, res, next) {
    var email = req.body.email.trim();
    var password = req.body.password;
    database(function(err, connection) {
        if(err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        }
        connection.query('SELECT * FROM USERS WHERE email=?', [email], function(err, results, fields) {
            connection.release();
            if(err) {
                throw err;
            } else if ((results.length !== 0) && (password === results[0].password)) {
                req.session.email = results[0].email;
                req.session.userId = results[0].id;
                console.log(req.session.email);
                res.redirect('/user/playlists');
            } else {
                signInError = 'Incorrect email/password entered';
                res.redirect('/');
            }
        });
    });
});

/* REGISTER */
router.post('/register', function(req, res, next) {
    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var email = req.body.email.trim();
    var password = req.body.password;
    database(function(err, connection) {
        if(err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        }
        connection.query('SELECT * FROM USERS WHERE email=?', [email], function(err, results, fields) {
            if(err) {
                throw err;
            } else if ((results.length === 0)) {
                connection.query('INSERT INTO USERS (firstName, lastName, email, password) VALUES(?, ?, ?, ?)', [firstName, lastName, email, password], function(err, results, fields) {
                    connection.release();
                    if(err) {
                        throw err;
                    } else if ((firstName !== "") && (lastName !== "") && (email !== "") && (password !== "")) {
                        req.session.email = email;
                        res.redirect('/user/playlists');
                    } else {
                        registrationError = 'An error occurred. Please try registering again.';
                        res.redirect('/');
                    }
                });
            } else {
                registrationError = 'User already exists. Please try registering again.';
                res.redirect('/');
            }
        });
    });
});

module.exports = router;
