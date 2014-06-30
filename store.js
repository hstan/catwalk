define([
    'underscore',
    'jquery',
    'async_request',
    './cache'
], function(_, $, request, cache) {
    'use strict';

    return {
        find: function(Model, id) {
            id = id || '';
            var properties = cache.get(Model.prototype.namespace + '_' + id);

            return new Model(properties);
        },
        fetch: function(Model, query, id) {
            query = query || {};
            id = id || '';

            if (!id && _.isString(query)) {
                id = query;
                query = {};
            }

            var deferred = $.Deferred(),
                _model = new Model();

            request(_model.getResourceURL(query) + '/' + id).done(function(result) {
                var model = new Model(result);
                cache.set(Model.prototype.namespace + '_' + id, model.toJSON());
                deferred.resolve(model);
            }).fail(function(e) {
                deferred.reject(e);
            });
            return deferred.promise();
        },
        fetchAll: function(Model, query) {
            var deferred = $.Deferred(),
                _model = new Model();

            request(_model.getResourceURL(query)).done(function(results) {
                deferred.resolve(_.reduce(results, function(models, result) {
                    var model = new Model(result);
                    models.push(model);
                    cache.set(Model.prototype.namespace + '_' + model.getID(), model.toJSON());
                    return models;
                }, []));
            }).fail(function(e) {
                deferred.reject(e);
            });
            return deferred.promise();
        },
        fetchOne: function(Model, query) {
            var deferred = $.Deferred(),
                _model = new Model(),
                model;

            request(_model.getResourceURL(query)).done(function(results) {
                if (_.isArray(results)) {
                    results = results[0];
                }

                model = new Model(results);
                cache.set(Model.prototype.namespace + '_' + model.getID(), model.toJSON());
                deferred.resolve(model);
            }).fail(function(e) {
                deferred.reject(e);
            });

            return deferred.promise();
        },
        update: function(model, field) {
            var deferred = $.Deferred(),
                resourceURL = model.getResourceURL(model._properties) + '/' + model.getID();

            resourceURL += field ? '/' + field : '';

            request(resourceURL, model._properties, 'put').done(function(results) {
                model.set(results);
                cache.set(model.namespace + '_' + model.getID(), model.toJSON());
                deferred.resolve(model);
            }).fail(function(e) {
                deferred.reject(e);
            });
            return deferred.promise();
        },
        create: function(model) {
            var deferred = $.Deferred();

            request(model.getResourceURL(model._properties), model._properties, 'post').done(function(result) {
                model._properties[model.idField] = result[model.idField];
                cache.set(model.namespace + '_' + model.getID(), model.toJSON());
                deferred.resolve(model);
            }).fail(function(e) {
                deferred.reject(e);
            });
            return deferred.promise();
        },
        delete: function(model) {
            var deferred = $.Deferred();

            request(model.getResourceURL(model._properties) + '/' + model.getID(), {}, 'delete', 'text').done(function() {
                cache.remove(model.namespace + '_' + model.getID());
                deferred.resolve();
            }).fail(function(e) {
                deferred.reject(e);
            });
            return deferred.promise();
        },
        // async request proxy for interface consistence.
        put: function(where, what) {
            var deferred = $.Deferred();
            request(where, what, 'put').done(function(result) {
                deferred.resolve(result);
            }).fail(function(e) {
                deferred.reject(e);
            });
            return deferred.promise();
        },
        get: function(url, query) {
            var deferred = $.Deferred();
            request(url, query, 'get').done(function(result) {
                deferred.resolve(result);
            }).fail(function(e) {
                deferred.reject(e);
            });
            return deferred.promise();
        }
    };
});

