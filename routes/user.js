var express = require('express');
var router = express.Router();
var database = require('../modules/database');

var createError = "";

/* GET PLAYLISTS */
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
                connection.query('SELECT * FROM PLAYLISTS WHERE userId=? ORDER BY id DESC', [userId], function(err, results, fields) {
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

/* CREATE PLAYLIST */
router.post('/create-playlist', function(req, res, next) {
    var userId = req.session.userId;
    var playlistTitle = req.body.title.trim();
    var playlistDescription = req.body.description.trim();
    var playlistImage = req.body.image;
    database(function(err, connection) {
        if(err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        }
        connection.query('SELECT * FROM PLAYLISTS WHERE title=? AND userId=?', [playlistTitle, userId], function(err, results, fields) {
            if(err) {
                throw err;
            } else if ((results.length === 0)) {
                connection.query('INSERT INTO PLAYLISTS (title, description, image, userId) VALUES(?, ?, ?, ?)', [playlistTitle, playlistDescription, playlistImage, userId], function(err, results, fields) {
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

/* GET PLAYLIST */
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
                    var playlistTitle = req.session.playlistTitle = results[0].title;
                    var playlistDescription = results[0].description;
                    connection.query('SELECT * FROM TRACKS WHERE playlistId=? ORDER BY dateAdded DESC', [playlistId], function(err, results, fields) {
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

/* CREATE TRACK */
router.post('/create-track', function(req, res, next) {
    var playlistId = req.session.playlistId;
    var playlistTitle = req.session.playlistTitle;
    var trackTitle = req.body.title.trim();
    var trackArtist = req.body.artist.trim();
    var trackAlbum = req.body.album.trim();
    var trackUrl = req.body.url.trim();
    var trackService = req.body.service;
    database(function(err, connection) {
        if(err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        }
        connection.query('SELECT * FROM PLAYLISTS WHERE id=? AND title=?', [playlistId, playlistTitle], function(err, results, fields) {
            if(err) {
                throw err;
            } else {
                var playlistDescription = results[0].description;
                connection.query('SELECT * FROM TRACKS WHERE title=? AND playlistId=?', [trackTitle, playlistId], function(err, results, fields) {
                    if(err) {
                        throw err;
                    } else if ((results.length === 0)) {
                        connection.query('INSERT INTO TRACKS (title, artist, album, url, service, playlistId) VALUES(?, ?, ?, ?, ?, ?)', [trackTitle, trackArtist, trackAlbum, trackUrl, trackService, playlistId], function(err, results, fields) {
                            connection.release();
                            if(err) {
                                throw err;
                            } else if ((playlistTitle !== "")) {
                                res.redirect('playlists/' + playlistId + '/' + playlistTitle);
                            } else {
                                createError = 'An error occurred. Please try creating track again.';
                                res.redirect('playlists/' + playlistId + '/' + playlistTitle);
                            }
                        });
                    } else {
                        createError = 'Track already exists. Please try creating track again.';
                        res.redirect('playlists/' + playlistId + '/' + playlistTitle);
                    }
                });
            }
        });
    });
});

/* DELETE TRACK */
router.get('/delete-track/:id', function(req, res, next) {
    var playlistId = req.session.playlistId;
    var playlistTitle = req.session.playlistTitle;
    if(req.params.id) {
        database(function(err, connection) {
            if(err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            }
            connection.query('DELETE FROM TRACKS WHERE id=? AND playlistId=?', [req.params.id, playlistId], function(err, results, fields) {
                if(err) {
                    throw err;
                } else {
                    res.redirect('/user/playlists/' + playlistId + '/' + playlistTitle);
                }
            });
        });
    }
});

module.exports = router;
