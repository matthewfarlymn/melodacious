var express = require('express');
var router = express.Router();
var connect = require('../database/connect');

// Declaring global variables
var signInError = '';
var registrationError = '';

/* INDEX */
router.get('/', function(req, res, next) {
    // Verifying if a session exists
    if (!req.session.email) {
        // Index page loads if session doesn't already exist
        res.render('index', {
            title: 'Melodacious',
            signInError: signInError,
            registrationError: registrationError
        });
        // Resetting error variables
        signInError = '';
        registrationError = '';
    } else {
        // User is redirected to playlists if session already exists
        res.redirect('/user/playlists');
    }
});

/* SIGN-OUT */
router.get('/sign-out', function(req, res, next) {
    // All sessions are destroyed
    req.session.destroy();
    // User is redirected to index page
    res.redirect('/');
});

/* SIGN-IN */
router.post('/sign-in', function(req, res, next) {
    // Declaring function variables
    var email = req.body.email.trim();
    var password = req.body.password;
    // Opening connection to database
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            // Selecting all users that match email
            connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, results, fields) {
                connection.release();
                if (err) {
                    throw err;
                // Verifying that user exists and passwords match
                } else if ((results.length !== 0) && (password === results[0].password)) {
                    // Creating sessions for user email and id
                    req.session.email = results[0].email;
                    req.session.userId = results[0].id;
                    // User is redirected to playlists page
                    res.redirect('/user/playlists');
                } else {
                    // Saving error message
                    signInError = 'Incorrect email/password entered. Please try signing-in again.';
                    // User is redirected to index page
                    res.redirect('/');
                }
            });
        }
    });
});

/* REGISTER */
router.post('/register', function(req, res, next) {
    // Declaring function variables
    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var email = req.body.email.trim();
    var password = req.body.password;
    // Opening connection to database
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            // Selecting all users that match email
            connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, results, fields) {
                if (err) {
                    throw err;
                // Verifying that user doesn't already exist
                } else if (results.length === 0) {
                    // Adding user to database
                    connection.query('INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)', [firstName, lastName, email, password], function(err, results, fields) {
                        connection.release();
                        if (err) {
                            throw err;
                        } else {
                            // Creating sessions for user email
                            req.session.email = email;
                            // User is redirected to playlists page
                            res.redirect('/user/playlists');
                        }
                    });
                } else {
                    // Saving error message
                    registrationError = 'User email already exists. Please register using a different email or try signing-in.';
                    // User is redirected to index page
                    res.redirect('/');
                }
            });
        }
    });
});

module.exports = router;
