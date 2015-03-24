/**
 * UserController
 *
 * @description :: Server-side logic for managing User
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    login: function (req, res) {

        var bcrypt = require('bcrypt-nodejs');
        var encryptionString = "chatapp" + _.random(5151, 89735879) + req.body + _.random(89, 890745789035);
        var emailRegex = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);

        if (emailRegex.test(req.body.email)) {
            User.findOne().where({email: req.body.email})
                .then(function (user) {
                    bcrypt.compare(req.body.password, user.password, function (err, match) {

                        if (err) {
                            res.serverError( {
                                error: 'Server error'
                            }, 500);
                        }

                        if (match) {
                            req.session.user = user.username;
                            bcrypt.genSalt(10, function(err, salt) {
                                if (err) {
                                    return next(err);
                                }

                                bcrypt.hash(encryptionString, salt, function () {}, function (err, hash) {
                                    if (err) {
                                        return next(err);
                                    }
                                    User.update( {username: user.username}, {token: hash})
                                        .then(function (updated) {
                                            return res.json(updated);
                                        })
                                        .fail(function (err) {
                                            return res.serverError(err);
                                        });
                                });
                            });
                        } else {
                            if (req.session.user) {
                                req.session.user = null;
                            }
                            res.serverError( {
                                error: 'Invalid password'
                            }, 401);
                        }
                    });
                })
                .fail(function(err) {
                    return res.serverError(err);
                });
        } else if (req.body.email) {
            User.findOne().where({username: req.body.email})
                .then(function (user) {
                    bcrypt.compare(req.body.password, user.password, function (err, match) {
                        if (err) {
                            res.serverError({ error: 'Server error' }, 500);
                        }

                        if (match) {
                            req.session.user = user.username;
                            bcrypt.genSalt(10, function(err, salt) {
                                if (err) {
                                    return next(err);
                                }

                                bcrypt.hash(encryptionString, salt, function () {}, function (err, hash) {
                                    if (err) {
                                        return next(err);
                                    }
                                    User.update({username: user.username}, {token: hash})
                                        .then(function (updated) {
                                            return res.json(updated);
                                        })
                                        .fail(function (err) {
                                            return res.serverError(err);
                                        });
                                });
                            });
                        } else {
                            if (req.session.user) {
                                req.session.user = null;
                            }
                            res.serverError({ error: 'Invalid password' }, 401);
                        }
                    });
                })
                .fail(function(err) {
                    return res.serverError(err);
                });
        } else if (!req.body.email) {
            res.notFound('Cant log you in if we dont know who you are.');
        }
    },

    register: function (req, res) {
        console.log(req.body);
        var bcrypt = require('bcrypt-nodejs');
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                res.json(err);
            }
            bcrypt.hash(req.body.password, salt, function() {} , function(err, hash) {
                if (err) {
                    res.json(err);
                }
                req.body.password = hash;
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) {
                        res.json(err);
                    }
                    bcrypt.hash(hash, salt, function() {} , function(err, hash2) {
                        req.body.token = hash2;
                    });
                });
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) {
                        res.json(err);
                    }

                    bcrypt.hash(req.body.password, salt, function() {} , function(err, hash1) {
                        if (err) {
                            res.json(err);
                        }
                        req.body.activationToken = hash1;

                        User.find({username: req.body.username}).exec( function findCB(err, found) {

                            if (found.length >= 1) {
                                res.json({exists: 'this username already exists', errorCode: 'USERNAME_EXISTS'});
                            } else if (!found || found.length < 1) {
                                User.find({email: req.body.email}).exec(function findCB(err, found) {
                                    if (found.length >= 1) {
                                        res.json({exists: 'this email already exists', errorCode: 'EMAIL_EXISTS'});
                                    } else if (!found || found.length < 1) {
                                        User.create({ username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, password: req.body.password, gender: req.body.gender}).exec(function aftwards(err, user) {
                                            console.log('attempted to create user');
                                            if (user) {
                                                console.log('created user');
                                                res.json(user);
                                            } else if (err) {
                                                console.log('failed to create user');
                                                res.json({ error: 'Could not create user' }, 404);
                                            }
                                        });
                                    }
                                    if (err) {
                                        res.json({ error: 'Could not create hash' }, 404);
                                    }
                                });
                            }
                            if (err) {
                                res.json(err);
                            }
                        });
                    });
                });
            });
        });

    },

    logout: function (req, res) {
        User.update({username: req.body.username, token:req.body.token}, { token: 'invalid'} )
            .then(function (updated){
                return res.json(updated);
            })
            .failed(function(err) {
                return res.serverError(err);
            });
    },
};

