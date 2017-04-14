var express = require('express');
var router = express.Router();
var connect = require('../database/connect');

// Declaring global variables
var createError = '';
var edit = false;

/* GET PLAYLISTS */
router.get('/playlists', function(req, res, next) {
    // Declaring function variables
    var email = req.session.email;
    // Opening connection to database
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            // Selecting all users that match session email
            connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, results, fields) {
                if (err) {
                    throw err;
                } else {
                    // Declaring results and session variables
                    var userId = req.session.userId = results[0].id;
                    var firstName = results[0].firstName;
                    var infoPlaylist = req.session.infoPlaylist;
                    // Selecting all playlists that match user id and ordering them by playlist id in decending order
                    connection.query('SELECT * FROM playlists WHERE userId = ? ORDER BY id DESC', [userId], function(err, results, fields) {
                        connection.release();
                        if (err) {
                            throw err;
                        } else {
                            // Playlists page loads
                            res.render('playlists', {
                                title: 'Melodacious | playlists',
                                firstName: firstName,
                                playlists: results,
                                infoPlaylist: infoPlaylist,
                                access: email,
                                edit: edit,
                                createError: createError
                            });
                            // Edit is set to false
                            edit = false;
                            // Resetting error variable
                            createError = '';
                        }
                    });
                }
            });
        }
    });
});

/* CREATE PLAYLIST */
router.post('/create-playlist', function(req, res, next) {
    // Declaring function variables
    var userId = req.session.userId;
    var playlistTitle = req.body.title.trim();
    var playlistDescription = req.body.description.trim();
    var playlistCover = req.body.cover;
    // Opening connection to database
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            // Selecting all playlists that match playlist and session user id
            connection.query('SELECT * FROM playlists WHERE title = ? AND userId = ?', [playlistTitle, userId], function(err, results, fields) {
                if (err) {
                    throw err;
                // Verifies results length is not zero
                } else if (results.length === 0) {
                    // Verifies if playlist cover image is not set
                    if (playlistCover === undefined) {
                        // Sets playlist cover image address
                        playlistCover = '/img/playlist.jpg';
                    }
                    // Inserting all playlist info into database
                    connection.query('INSERT INTO playlists (title, description, cover, userId) VALUES (?, ?, ?, ?)', [playlistTitle, playlistDescription, playlistCover, userId], function(err, results, fields) {
                        connection.release();
                        if (err) {
                            throw err;
                        } else {
                            // User is redirected back to playlists
                            res.redirect('/user/playlists');
                        }
                    });
                } else {
                    // Saving error message
                    createError = 'Playlist title already exists. Please try a different title.';
                    // User is redirected back to playlists
                    res.redirect('/user/playlists');
                }
            });
        }
    });
});

/* EDIT PLAYLIST */
router.get('/edit-playlist/:id', function(req, res, next) {
    // Verifying that there is a params id
    if (req.params.id) {
        // Opening connection to database
        connect(function(err, connection) {
            if (err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            } else {
                // Selecting all playlists from database that match params id
                connection.query('SELECT * FROM playlists WHERE id = ?', [req.params.id], function(err, results, fields) {
                    if (err) {
                        throw err;
                    } else {
                        // infoPlaylist session is updated with query results
                        req.session.infoPlaylist = results;
                        // Edit is set to true
                        edit = true;
                        // User is redirected back to playlists page
                        res.redirect('/user/playlists');
                    }
                });
            }
        });
    }
});

/* UPDATE PLAYLIST */
router.post('/update-playlist', function(req, res, next) {
    // Declaring function variables
    var userId = req.session.userId;
    var playlistId = req.session.infoPlaylist[0].id;
    var playlistTitle = req.body.title.trim();
    var playlistDescription = req.body.description.trim();
    var playlistCover = req.body.cover;
    // Opening connection to database
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            // Selecting all playlists from database that match title and user id
            connection.query('SELECT * FROM playlists WHERE title = ? AND userId = ?', [playlistTitle, userId], function(err, results, fields) {
                if (err) {
                    throw err;
                // Verifying if query reults is zero or first object id matches playlist id
            } else if ((results.length === 0) || (results[0].id === playlistId)) {
                    // Verifies if playlist cover image is not set
                    if (playlistCover === undefined) {
                        // Sets playlist cover image address
                        playlistCover = '/img/playlist.jpg';
                    }
                    // Updates playlists fields in database
                    connection.query('UPDATE playlists SET title = ?, description = ?, cover = ? WHERE id = ?', [playlistTitle, playlistDescription, playlistCover, playlistId], function(err, results, fields) {
                        connection.release();
                        if (err) {
                            throw err;
                        } else {
                            // User is redirected to playlists page
                            res.redirect('/user/playlists');
                        }
                    });
                } else {
                    // Edit is reset to true
                    edit = true;
                    // Saving error message
                    createError = 'Playlist title already exists. Please try a different title.';
                    // User is redirected to playlists page
                    res.redirect('/user/playlists');
                }
            });
        }
    });
});

/* DELETE PLAYLIST */
router.get('/delete-playlist/:id', function(req, res, next) {
    // Verifying that there is a params id
    if (req.params.id) {
        // Opening connection to database
        connect(function(err, connection) {
            if (err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            } else {
                // Remove playlist if the params id matches
                connection.query('DELETE FROM playlists WHERE id = ?', [req.params.id], function(err, results, fields) {
                    connection.release();
                    if (err) {
                        throw err;
                    } else {
                        // User is redirected to playlists
                        res.redirect('/user/playlists');
                    }
                });
            }
        });
    }
});

/* GET TRACKS */
router.get('/playlist/:id/:title', function(req, res, next) {
    // Declaring function variables
    var email = req.session.email;
    // Verifying that there is a params id
    if (req.params.id) {
        // Opening connection to database
        connect(function(err, connection) {
            if (err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            } else {
                // Selecting all playlists from database that match params id
                connection.query('SELECT * FROM playlists WHERE id = ?', [req.params.id], function(err, results, fields) {
                    if (err) {
                        throw err;
                    } else {
                        // Declaring variables of sessions and results
                        var playlistId = req.session.playlistId = results[0].id;
                        var playlistTitle = req.session.playlistTitle = results[0].title;
                        var playlistDescription = req.session.playlistDescription = results[0].description;
                        var playlistTracks = req.session.playlistTracks = results[0].tracks;
                        var infoTrack = req.session.infoTrack;
                        // Selecting all tracks from database that match playlist id and order them by date added descending
                        connection.query('SELECT * FROM tracks WHERE playlistId = ? ORDER BY dateAdded DESC', [playlistId], function(err, results, fields) {
                            connection.release();
                            if (err) {
                                throw err;
                            } else {
                                // Tracks page loads
                                res.render('tracks', {
                                    title: 'Melodacious | playlist',
                                    playlistTitle: playlistTitle,
                                    playlistDescription: playlistDescription,
                                    tracks: results,
                                    infoTrack: infoTrack,
                                    access: email,
                                    edit: edit,
                                    createError: createError
                                });
                                // Edit is set to false
                                edit = false;
                                // Resetting error variable
                                createError = '';
                            }
                        });
                    }
                });
            }
        });
    }
});

/* CREATE TRACK */
router.post('/create-track', function(req, res, next) {
    // Declaring function variables
    var playlistId = req.session.playlistId;
    var playlistTitle = req.session.playlistTitle;
    var playlistTracks = req.session.playlistTracks;
    var trackTitle = req.body.title.trim();
    var trackArtist = req.body.artist.trim();
    var trackUrl = req.body.url.trim();
    // Opening connection to database
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            // Selecting al tracks where title and playlist id or url and playlist id or title, url and playlists match
            connection.query('SELECT * FROM tracks WHERE url = ? AND playlistId = ?', [trackUrl, playlistId], function(err, results, fields) {
                if (err) {
                    throw err;
                // Verifying if the query results are zero
                } else if (results.length === 0) {
                    // Declaring trackService variable
                    var trackService;
                    // Verifying what trackUrl contains and sets trackServcie based on constraints
                    if (trackUrl.includes('https://soundcloud.com')) {
                        trackService = 'soundcloud';
                    } else if (trackUrl.includes('https://www.mixcloud.com')) {
                        trackService = 'mixcloud';
                    } else {
                        trackService = null;
                    }
                    // Adds track to database
                    connection.query('INSERT INTO tracks (title, artist, url, service, playlistId) VALUES (?, ?, ?, ?, ?)', [trackTitle, trackArtist, trackUrl, trackService, playlistId], function(err, results, fields) {
                        if (err) {
                            throw err;
                        } else {
                            // Updates playlist column tracks by 1
                            connection.query('UPDATE playlists SET tracks = ? WHERE id = ?', [playlistTracks + 1, playlistId], function(err, results, fields) {
                                connection.release();
                                if (err) {
                                    throw err;
                                } else {
                                    // User is redirected to specific playlist
                                    res.redirect('playlist/' + playlistId + '/' + playlistTitle);
                                }
                            });
                        }
                    });
                } else {
                    // Saving error message
                    createError = 'Track url already exists. Please try using a different url.';
                    // User is redirected specific playlist
                    res.redirect('playlist/' + playlistId + '/' + playlistTitle);
                }
            });
        }
    });
});

/* EDIT TRACK */
router.get('/edit-track/:id', function(req, res, next) {
    // Declaring function variables
    var playlistId = req.session.playlistId;
    var playlistTitle = req.session.playlistTitle;
    // Verifying that there is a params id
    if (req.params.id) {
        // Opening connection to database
        connect(function(err, connection) {
            if (err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            } else {
                // Selecting all tracks that match params id
                connection.query('SELECT * FROM tracks WHERE id = ?', [req.params.id], function(err, results, fields) {
                    if (err) {
                        throw err;
                    } else {
                        // infoTrack session is set to results
                        req.session.infoTrack = results;
                        // Edit is set to true
                        edit = true;
                        // User is redirected to specific playlist
                        res.redirect('/user/playlist/' + playlistId + '/' + playlistTitle);
                    }
                });
            }
        });
    }
});

/* CREATE TRACK */
router.post('/update-track', function(req, res, next) {
    // Declaring function variables
    var playlistId = req.session.playlistId;
    var playlistTitle = req.session.playlistTitle;
    var trackId = req.session.infoTrack[0].id;
    var trackTitle = req.body.title.trim();
    var trackArtist = req.body.artist.trim();
    var trackUrl = req.body.url.trim();
    // Opening connection to database
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            // Selecting all tracks from database where title and playlist id or url and playlist id or title and url and playlist id match
            connection.query('SELECT * FROM tracks WHERE url = ? AND playlistId = ?', [trackUrl, playlistId], function(err, results, fields) {
                if (err) {
                    throw err;
                // Verifying if query reults returns zero
                } else if ((results.length === 0) || (results[0].id === trackId)) {
                    // Declaring trackService variable
                    var trackService;
                    // Verifying what trackUrl contains and sets trackServcie based on constraints
                    if (trackUrl.includes('https://soundcloud.com')) {
                        trackService = 'soundcloud';
                    } else if (trackUrl.includes('https://www.mixcloud.com')) {
                        trackService = 'mixcloud';
                    } else {
                        trackService = null;
                    }
                    // Updates track info
                    connection.query('UPDATE tracks SET title = ?, artist = ?, url = ?, service = ? WHERE id = ?', [trackTitle, trackArtist, trackUrl, trackService, trackId], function(err, results, fields) {
                        connection.release();
                        if (err) {
                            throw err;
                        } else {
                            // User is redirected to specific playlist
                            res.redirect('playlist/' + playlistId + '/' + playlistTitle);
                        }
                    });
                } else {
                    // Edit is reset to true
                    edit = true;
                    // Saving error message
                    createError = 'Track url already exists. Please try using a different url.';
                    // User is redirected to specific playlist
                    res.redirect('playlist/' + playlistId + '/' + playlistTitle);
                }
            });
        }
    });
});

/* DELETE TRACK */
router.get('/delete-track/:id', function(req, res, next) {
    // Declaring function variables
    var playlistId = req.session.playlistId;
    var playlistTitle = req.session.playlistTitle;
    var playlistTracks = req.session.playlistTracks;
    // Verifying that there is a params id
    if (req.params.id) {
        // Opening connection to database
        connect(function(err, connection) {
            if (err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            } else {
                // Deleting track from database if params id matches
                connection.query('DELETE FROM tracks WHERE id = ? AND playlistId = ?', [req.params.id, playlistId], function(err, results, fields) {
                    if (err) {
                        throw err;
                    } else {
                        // Updates playlist column tracks by -1
                        connection.query('UPDATE playlists SET tracks = ? WHERE id = ?', [playlistTracks - 1, playlistId], function(err, results, fields) {
                            connection.release();
                            if (err) {
                                throw err;
                            } else {
                                // User is redirected to specific playlist
                                res.redirect('/user/playlist/' + playlistId + '/' + playlistTitle);
                            }
                        });
                    }
                });
            }
        });
    }
});

module.exports = router;
