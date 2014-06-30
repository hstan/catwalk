define([
    'underscore',
    'jquery',
    'async_request',
    './inherit',
    './store',
    './cache'
], function(_, $, inherit, request, store, cache) {
    'use strict';

    var Model = function(properties) {
        if (!this.namespace) {
            throw new Error('Namespace is mandatory');
        }
        this._properties = properties || {};
        this._id = _.uniqueId('model');
    };

    _.extend(Model.prototype, store, {
        idField: 'id',
        getResourceURL: function() {
            throw new Error('method getResourceURL needs to be implemented');
        },
        getID: function() {
            return this._properties[this.idField];
        },
        get: function(propKey) {
            return this._properties[propKey];
        },
        set: function(propKey, propVal) {
            var self = this,
                attrs;

            if (typeof propKey === 'object') {
                attrs = propKey;
                _.each(attrs, function(val, key) {
                    self._properties[key] = val;
                });
            } else {
                this._properties[propKey] = propVal;
            }


            this.changed.dispatch();
            return this;
        },
        update: function(field) {
            return store.update(this, field);
        },
        create: function() {
            return store.create(this).done(function(obj) {
                cache.set(obj.namaspace + '_' + obj.getID(), obj);
            });
        },
        delete: function() {
            var self = this;
            return store.delete(this).done(function() {
                cache.remove(self.namaspace + '_' + self.getID());
            });
        },
        find: function(id) {
            return cache.get(id);
        },
        toJSON: function() {
            return _.clone(this._properties);
        }
    });

    Model.extend = inherit;

    return Model;
});