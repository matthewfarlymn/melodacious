var express = require('express');
var router = express.Router();
var database = require('../modules/database');

var createError = "";

/* GET playlists page. */
router.get('/playlists', function(req, res, next) {
    var email = req.session.email;
    database(function(err, connection) {
        if(err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        }
        connection.query('SELECT * FROM USERS WHERE email=?', [email], function(err, results, fields) {
            if(err) {
                throw err;
            } else {
                var userId = req.session.userId = results[0].id;
                var firstName = results[0].firstName;
                connection.query('SELECT * FROM PLAYLISTS WHERE user_id=? ORDER BY id DESC', [userId], function(err, results, fields) {
                    connection.release();
                    if(err) {
                        throw err;
                    } else {
                        res.render('playlists', {
                            title: 'Melodacious | playlists',
                            firstName: firstName,
                            playlists: results,
                            access: email,
                            createError: createError
                        });
                        createError= "";
                    }
                });
            }
        });
    });
});

/* POST create playlist */
router.post('/create-playlist', function(req, res, next) {
    var playlistTitle = req.body.title.trim();
    var playlistDescription = req.body.description.trim();
    database(function(err, connection) {
        if(err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        }
        connection.query('SELECT * FROM PLAYLISTS WHERE title=? AND user_id=?', [playlistTitle, userId], function(err, results, fields) {
            if(err) {
                throw err;
            } else if ((results.length === 0)) {
                connection.query('INSERT INTO PLAYLISTS (title, description, user_id) VALUES(?, ?, ?)', [playlistTitle, playlistDescription, userId], function(err, results, fields) {
                    connection.release();
                    if(err) {
                        throw err;
                    } else if ((playlistTitle !== "")) {
                        res.redirect('/user/playlists');
                    } else {
                        createError = 'An error occurred. Please try creating playlist again.';
                        res.redirect('/user/playlists');
                    }
                });
            } else {
                createError = 'Playlist already exists. Please try creating playlist again.';
                res.redirect('/user/playlists');
            }
        });
    });
});

/* GET playlists page. */
router.get('/playlists/:id/:title', function(req, res, next) {
    var email = req.session.email;
    if(req.params.id) {
        database(function(err, connection) {
            if(err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            }
            connection.query('SELECT * FROM PLAYLISTS WHERE id=?', [req.params.id], function(err, results, fields) {
                if(err) {
                    throw err;
                } else {
                    var playlistId = req.session.playlistId = results[0].id;
                    var playlistTitle = results[0].title;
                    var playlistDescription = results[0].description;
                    connection.query('SELECT * FROM TRACKS WHERE playlist_id=? ORDER BY title', [playlistId], function(err, results, fields) {
                        if(err) {
                            throw err;
                        } else {
                            res.render('tracks', {
                                title: 'Melodacious | playlist',
                                playlistTitle: playlistTitle,
                                playlistDescription: playlistDescription,
                                tracks: results,
                                access: email,
                                createError: createError,
                            });
                        }
                    });
                }
            });
        });
    }
});

module.exports = router;
