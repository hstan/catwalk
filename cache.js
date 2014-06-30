define(function() {
    'use strict';

    //TODO: this is a naive cache implementation.
    var _cache = {};

    return {
        set: function(k, v) {
            _cache[k] = v;
        },
        get: function(k) {
            return _cache[k];
        },
        remove: function(k) {
            delete _cache[k];
        }
    };
});
