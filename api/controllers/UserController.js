/**
 * UserController
 *
 * @description :: Server-side logic for managing User
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var bcrypt = require('bcrypt-nodejs');
var emailRegex = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);

module.exports = {
    login: function (req, res) {

        if (req.body.email && emailRegex.test(req.body.email)) {
            User.findOne().where({email: req.body.email})
                .then(function (user) {
                    bcrypt.compare(req.body.password, user.password, function (err, match) {

                        if (err) {
                            return res.serverError({message: 'Something went wrong when comparing the two hashed passwords, please contact server administrator',  error: 'ERROR_COMPARING_HASHED_PASSWORD', errorObject: err }, 401);
                        }

                        if (match) {
                            return res.json(user);
                        } else {
                            return res.serverError({message: 'The password you entered did not match our records.', error: 'INVALID_PASSWORD' }, 401);
                        }
                    });
                })
                .fail(function(err) {
                    return res.serverError(err);
                });
        } else if (!emailRegex.test(req.body.email)) {
            return res.serverError({ error: 'INVALID_EMAIL' }, 500);
        } else if (req.body.username) {
            User.findOne().where({username: req.body.username})
                .then(function (user) {
                    bcrypt.compare(req.body.password, user.password, function (err, match) {
                        if (err) {
                            return res.serverError({message: 'Something went wrong when comparing the two hashed passwords, please contact server administrator',  error: 'ERROR_COMPARING_HASHED_PASSWORD', errorObject: err }, 401);
                        }

                        if (match) {
                            return res.json(user);
                        } else {
                            return res.serverError({message: 'The password you entered did not match our records.', error: 'INVALID_PASSWORD' }, 401);
                        }
                    });
                })
                .fail(function(err) {
                    return res.serverError(err);
                });
        } else if (!req.body.email || !req.body.username) {
            return res.serverError({ error: 'INVALID_USERNAME_OR_EMAIL' }, 500);
        }
    },

    register: function (req, res) {

        if(!emailRegex.test(req.body.email)) {
            return res.serverError({message: 'The email you attempted to use does not look like a valid email address. please use the email@web.com format', error: 'INVALID_EMAIL' }, 401);
        }
        if(!req.body.username || !req.body.email || !req.body.firstName || !req.body.lastName || !req.body.gender || !req.body.password) {
            return res.serverError({message: 'The data object you sent to the server was missing some values, please insure that username, email, firstName, lastName, gender and password are being passed to the server.', error: 'MISSING_PARAMETER' }, 401);
        }
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return res.serverError({message: 'Something went wrong when generating the salt to hash the password, please contact server administrator', error: 'ERROR_GENERATING_SALT', errorObject: err }, 401);
            }
            bcrypt.hash(req.body.password, salt, function() {} , function(err, hash) {
                if (err) {
                    return res.serverError({message: 'Something went wrong when comparing the two hashed passwords, please contact server administrator',  error: 'ERROR_COMPARING_HASHED_PASSWORD', errorObject: err }, 401);
                }
                req.body.password = hash;
                bcrypt.genSalt(10, function(err, salt) {
                    if (err) {
                        return res.serverError({message: 'Something went wrong when generating the salt to hash the password, please contact server administrator', error: 'ERROR_GENERATING_SALT', errorObject: err  }, 401);
                    }

                    bcrypt.hash(req.body.password, salt, function() {} , function(err, hash1) {
                        if (err) {
                            return res.serverError({message: 'Something went wrong when comparing the two hashed passwords, please contact server administrator',  error: 'ERROR_COMPARING_HASHED_PASSWORD', errorObject: err }, 401);
                        }

                        User.find({username: req.body.username}).exec( function findCB(err, found) {

                            if (found.length >= 1) {
                                return res.json({message: 'The username (' + req.body.username + ') is already in use by another user, please use a different one', errorCode: 'USERNAME_EXISTS'});
                            } else if (!found || found.length < 1) {
                                User.find({email: req.body.email}).exec(function findCB(err, found) {
                                    if (found.length >= 1) {
                                        return res.json({message: 'The email (' + req.body.email + ') is already in use by another user, please use a different one', errorCode: 'EMAIL_EXISTS'});
                                    } else if (!found || found.length < 1) {
                                        User.create({ username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, password: req.body.password, gender: req.body.gender}).exec(function aftwards(err, user) {
                                            if (user) {
                                               return res.json(user);
                                            } else if (err) {
                                                return res.json({message: 'Something went wrong when attempting to create the user, please contact the server administrator', error: 'Could not create user', errorObject: err }, 404);
                                            }
                                        });
                                    }
                                    if (err) {
                                        return res.serverError({message: 'Something went wrong when trying to find if the email exists, please contact server administrator', error: 'ERROR_FINDING_EMAIL', errorObject: err  }, 401);
                                    }
                                });
                            }
                            if (err) {
                                return res.serverError({message: 'Something went wrong when trying to find if the username exists, please contact server administrator', error: 'ERROR_FINDING_USERNAME', errorObject: err  }, 401);
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
                return res.serverError({message: 'Something went wrong when trying to find if the email exists, please contact server administrator', error: 'ERROR_FINDING_EMAIL', errorObject: err  }, 401);
            });
    }
};

