/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    send: function(req, res) {
        Message.create({ message: req.body.message, user: req.body.userId}).exec(function aftwards(err, message) {
            if (message) {
                res.json(message);
            } else if (err) {
                res.json({ error: 'Could not send message' }, 404);
            }
        });
    }
	
};

