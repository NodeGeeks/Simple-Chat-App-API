/**
 * Message.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {
        content: 'string',
        isRead: 'boolean',
        datetime: 'datetime',
        group: {
            model: 'group'
        },
        sender: {
            model: 'user'
        },
        receiver: {
            model: 'user'
        }
    }

};

