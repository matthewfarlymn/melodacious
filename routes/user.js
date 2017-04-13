var express = require('express');
var router = express.Router();
var connect = require('../database/connect');

var createError = '';
var edit = false;

/* GET PLAYLISTS */
router.get('/playlists', function(req, res, next) {
    var email = req.session.email;
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, results, fields) {
                if (err) {
                    throw err;
                } else {
                    var userId = req.session.userId = results[0].id;
                    var firstName = results[0].firstName;
                    var infoPlaylist = req.session.infoPlaylist;
                    connection.query('SELECT * FROM playlists WHERE userId = ? ORDER BY id DESC', [userId], function(err, results, fields) {
                        connection.release();
                        if (err) {
                            throw err;
                        } else {
                            console.log(infoPlaylist);
                            res.render('playlists', {
                                title: 'Melodacious | playlists',
                                firstName: firstName,
                                playlists: results,
                                infoPlaylist: infoPlaylist,
                                access: email,
                                edit: edit,
                                createError: createError
                            });
                            edit = false;
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
    var userId = req.session.userId;
    var playlistTitle = req.body.title.trim();
    var playlistDescription = req.body.description.trim();
    var playlistCover = req.body.cover;
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            connection.query('SELECT * FROM playlists WHERE title = ? AND userId = ?', [playlistTitle, userId], function(err, results, fields) {
                if (err) {
                    throw err;
                } else if (results.length === 0) {
                    if (playlistCover === undefined) {
                        playlistCover = '/img/playlist.jpg';
                        console.log(playlistCover);
                    }
                    connection.query('INSERT INTO playlists (title, description, cover, userId) VALUES (?, ?, ?, ?)', [playlistTitle, playlistDescription, playlistCover, userId], function(err, results, fields) {
                        connection.release();
                        if (err) {
                            throw err;
                        } else {
                            res.redirect('/user/playlists');
                        }
                    });
                } else {
                    createError = 'Playlist title already exists. Please try a different title.';
                    res.redirect('/user/playlists');
                }
            });
        }
    });
});

/* EDIT PLAYLIST */
router.get('/edit-playlist/:id', function(req, res, next) {
    if (req.params.id) {
        connect(function(err, connection) {
            if (err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            } else {
                connection.query('SELECT * FROM playlists WHERE id = ?', [req.params.id], function(err, results, fields) {
                    if (err) {
                        throw err;
                    } else {
                        req.session.infoPlaylist = results;
                        edit = true;
                        res.redirect('/user/playlists');
                    }
                });
            }
        });
    }
});

/* UPDATE PLAYLIST */
router.post('/update-playlist', function(req, res, next) {
    var userId = req.session.userId;
    var playlistId = req.session.infoPlaylist[0].id;
    var playlistTitle = req.body.title.trim();
    var playlistDescription = req.body.description.trim();
    var playlistCover = req.body.cover;
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            connection.query('SELECT * FROM playlists WHERE title = ? AND userId = ?', [playlistTitle, userId], function(err, results, fields) {
                if (err) {
                    throw err;
                } else if ((results.length === 0) || (results[0].id === playlistId)) {
                    if (playlistCover === undefined) {
                        playlistCover = '/img/playlist.jpg';
                        console.log(playlistCover);
                    }
                    connection.query('UPDATE playlists SET title = ?, description = ?, cover = ? WHERE id = ?', [playlistTitle, playlistDescription, playlistCover, playlistId], function(err, results, fields) {
                        connection.release();
                        if (err) {
                            throw err;
                        } else {
                            res.redirect('/user/playlists');
                        }
                    });
                } else {
                    edit = true;
                    createError = 'Playlist title already exists. Please try a different title.';
                    res.redirect('/user/playlists');
                }
            });
        }
    });
});

/* DELETE PLAYLIST */
router.get('/delete-playlist/:id', function(req, res, next) {
    if (req.params.id) {
        connect(function(err, connection) {
            if (err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            } else {
                connection.query('DELETE FROM playlists WHERE id = ?', [req.params.id], function(err, results, fields) {
                    connection.release();
                    if (err) {
                        throw err;
                    } else {
                        res.redirect('/user/playlists');
                    }
                });
            }
        });
    }
});

/* GET TRACKS */
router.get('/playlist/:id/:title', function(req, res, next) {
    var email = req.session.email;
    if (req.params.id) {
        connect(function(err, connection) {
            if (err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            } else {
                connection.query('SELECT * FROM playlists WHERE id = ?', [req.params.id], function(err, results, fields) {
                    if (err) {
                        throw err;
                    } else {
                        var playlistId = req.session.playlistId = results[0].id;
                        var playlistTitle = req.session.playlistTitle = results[0].title;
                        var playlistDescription = req.session.playlistDescription = results[0].description;
                        var playlistTracks = req.session.playlistTracks = results[0].tracks;
                        var infoTrack = req.session.infoTrack;
                        connection.query('SELECT * FROM tracks WHERE playlistId = ? ORDER BY dateAdded DESC', [playlistId], function(err, results, fields) {
                            connection.release();
                            if (err) {
                                throw err;
                            } else {
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
                                edit = false;
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
    var playlistId = req.session.playlistId;
    var playlistTitle = req.session.playlistTitle;
    var playlistTracks = req.session.playlistTracks;
    var trackTitle = req.body.title.trim();
    var trackArtist = req.body.artist.trim();
    var trackUrl = req.body.url.trim();
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            connection.query('SELECT * FROM tracks WHERE (title = ? AND playlistId = ?) OR (url = ? AND playlistId = ?) OR (title = ? AND url = ? AND playlistId = ?)', [trackTitle, playlistId, trackUrl, playlistId, trackTitle, trackUrl, playlistId], function(err, results, fields) {
                if (err) {
                    throw err;
                } else if (results.length === 0) {
                    var trackService;
                    if (trackUrl.includes('https://soundcloud.com')) {
                        trackService = 'soundcloud';
                    } else if (trackUrl.includes('https://www.mixcloud.com')) {
                        trackService = 'mixcloud';
                    } else {
                        trackService = null;
                    }
                    connection.query('INSERT INTO tracks (title, artist, url, service, playlistId) VALUES (?, ?, ?, ?, ?)', [trackTitle, trackArtist, trackUrl, trackService, playlistId], function(err, results, fields) {
                        if (err) {
                            throw err;
                        } else {
                            connection.query('UPDATE playlists SET tracks = ? WHERE id = ?', [playlistTracks + 1, playlistId], function(err, results, fields) {
                                connection.release();
                                if (err) {
                                    throw err;
                                } else {
                                    res.redirect('playlist/' + playlistId + '/' + playlistTitle);
                                }
                            });
                        }
                    });
                } else {
                    createError = 'Track title/url already exists. Please try using a different title/url.';
                    res.redirect('playlist/' + playlistId + '/' + playlistTitle);
                }
            });
        }
    });
});

/* EDIT TRACK */
router.get('/edit-track/:id', function(req, res, next) {
    var playlistId = req.session.playlistId;
    var playlistTitle = req.session.playlistTitle;
    if (req.params.id) {
        connect(function(err, connection) {
            if (err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            } else {
                connection.query('SELECT * FROM tracks WHERE id = ?', [req.params.id], function(err, results, fields) {
                    if (err) {
                        throw err;
                    } else {
                        req.session.infoTrack = results;
                        edit = true;
                        res.redirect('/user/playlist/' + playlistId + '/' + playlistTitle);
                    }
                });
            }
        });
    }
});

/* CREATE TRACK */
router.post('/update-track', function(req, res, next) {
    var playlistId = req.session.playlistId;
    var playlistTitle = req.session.playlistTitle;
    var trackId = req.session.infoTrack[0].id;
    var trackTitle = req.body.title.trim();
    var trackArtist = req.body.artist.trim();
    var trackUrl = req.body.url.trim();
    connect(function(err, connection) {
        if (err) {
            console.log("An error occurred. Unable to connect to the database.");
            throw err;
        } else {
            connection.query('SELECT * FROM tracks WHERE (title = ? AND playlistId = ?) OR (url = ? AND playlistId = ?) OR (title = ? AND url = ? AND playlistId = ?)', [trackTitle, playlistId, trackUrl, playlistId, trackTitle, trackUrl, playlistId], function(err, results, fields) {
                if (err) {
                    throw err;
                } else if ((results.length === 0) || (results[0].id === trackId)) {
                    var trackService;
                    if (trackUrl.includes('https://soundcloud.com')) {
                        trackService = 'soundcloud';
                    } else if (trackUrl.includes('https://www.mixcloud.com')) {
                        trackService = 'mixcloud';
                    } else {
                        trackService = null;
                    }
                    connection.query('UPDATE tracks SET title = ?, artist = ?, url = ?, service = ? WHERE id = ?', [trackTitle, trackArtist, trackUrl, trackService, playlistId], function(err, results, fields) {
                        connection.release();
                        if (err) {
                            throw err;
                        } else {
                            res.redirect('playlist/' + playlistId + '/' + playlistTitle);
                        }
                    });
                } else {
                    edit = true;
                    createError = 'Track title/url already exists. Please try using a different title/url.';
                    res.redirect('playlist/' + playlistId + '/' + playlistTitle);
                }
            });
        }
    });
});

/* DELETE TRACK */
router.get('/delete-track/:id', function(req, res, next) {
    var playlistId = req.session.playlistId;
    var playlistTitle = req.session.playlistTitle;
    var playlistTracks = req.session.playlistTracks;
    if (req.params.id) {
        connect(function(err, connection) {
            if (err) {
                console.log("An error occurred. Unable to connect to the database.");
                throw err;
            } else {
                connection.query('DELETE FROM tracks WHERE id = ? AND playlistId = ?', [req.params.id, playlistId], function(err, results, fields) {
                    if (err) {
                        throw err;
                    } else {
                        connection.query('UPDATE playlists SET tracks = ? WHERE id = ?', [playlistTracks - 1, playlistId], function(err, results, fields) {
                            connection.release();
                            if (err) {
                                throw err;
                            } else {
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
