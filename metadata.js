/*
 *  metadata.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-03-25
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb._;

var index = require('./index');

var _map_zone = function(zone) {
    return {
        value: zone,
        name: zone,
        selected: this.indexOf(zone) > -1,
    }
};

var _map_facet = function(facet) {
    return {
        value: facet,
        name: facet.replace(/^.*:/, ":"),
        selected: this.indexOf(facet) > -1,
    }
};

/**
 *  Callback by 'make_dynamic' to do the work specific to this form
 */
var thing_metadata = function(request, response, locals, done) {
    /* XXX check the user's permissions to edit metadata */

    var thing = index.homestar.things.thing_by_id(request.params.thing_id);
    if (!thing) {
        return done(new Error("Thing not found"));
    }

    locals.metadata = _.ld.compact(thing.meta().state());
    locals.metadata_facets = _.ld.list(locals.metadata, 'iot:facet', []);
    locals.metadata_zones = _.ld.list(locals.metadata, 'iot:zone', []);
    
    locals.thing_id = request.params.thing_id;
    locals.zones = _.map(index.homestar.data.zones(), _map_zone, locals.metadata_zones);
    locals.facets = _.map(index.homestar.data.facets(), _map_facet, locals.metadata_facets);

    if (request.method === "POST") {
        var updated = {};

        var name = request.body['schema:name']
        if (name && name.length && name != locals.metadata['schema:name']) {
            updated['schema:name'] = name;
        }

        var old_facets = _.ld.list(locals.metadata, 'iot:facet', []);
        var new_facets = _.ld.list(request.body, 'iot:facet', []);
        if (!_.equals(old_facets, new_facets)) {
            updated['iot:facet'] = new_facets;
        }

        var old_zones = _.ld.list(locals.metadata, 'iot:zone', []);
        var new_zones = _.ld.list(request.body, 'iot:zone', []);
        if (!_.equals(old_zones, new_zones)) {
            updated['iot:zone'] = new_zones;
        }

        if (!_.is.Empty(updated)) {
            thing.meta().update(updated, { set_timestamp: true });
            _.extend(locals.metadata, updated);
        }

        response.redirect("/things#" + locals.thing_id);
        return done(null, true);
    }

    return done(null);
};

/**
 *  API
 */
exports.thing_metadata = thing_metadata;
