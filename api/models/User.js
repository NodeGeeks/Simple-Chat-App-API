/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'users',
    schema: true,
    attributes: {
        username: {
            type: 'string',
            unique: true,
            primaryKey: true
        },
        firstName: 'string',
        lastName: 'string',
        password: 'string',
        gender: 'boolean',
        email: {
            type: 'email',
            unique: true
        },
        birthday: 'date',
        //messages: {
        //    collection: 'message',
        //    via: ''
        //},
        groups: {
            collection: 'group',
            via: 'members'
        },
        toJSON: function() {
            var obj = this.toObject();
            delete obj.activationToken;
            delete obj.password;
            return obj;
        }
    }
};

