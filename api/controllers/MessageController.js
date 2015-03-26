/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    send: function(req, res) {
        if(!req.body.message) {
            return res.serverError({ error: 'You need to type a message in', errorCode: 'MESSAGE_REQUIRED' }, 404)
        } else if(!req.body.user) {
            return res.serverError({ error: 'You dont have a user ID stop trying to hack us', errorCode: 'NO_USERID' }, 404)

        } else {
            Message.create({ message: req.body.message, user: req.body.userId}).exec(function aftwards(err, message) {
                if (message) {
                    res.json(message);
                } else if (err) {
                    res.json({ error: 'Could not send message' }, 404);
                }
            });
        }

    }
	
};

