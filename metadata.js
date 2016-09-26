/*
 *  metadata.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-03-25
 *
 *  Copyright [2013-2016] [David P. Janes]
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

const iotdb = require('iotdb');
const _ = iotdb._;

const iotdb_transport_iotdb = require('iotdb-transport-iotdb');

/**
 *  Callback by 'make_dynamic' to do the work specific to this form
 */
const thing_metadata = function(request, response, locals, done) {
    if (!request.user || !request.user.is_owner) {
        return done(new Error("Permission denied"));
    }

    iotdb_transporter = iotdb_transport_iotdb.make({});
    iotdb_transport.one({
        id: request.params.thing_id,
    }, 
        bandd => {
            const thing = iotdb_thing.make(bandd);

            locals.thing_id = request.params.thing_id;
            locals.zones = _.map(locals.homestar.data.zones(), _process_zone);
            locals.facets = _.map(locals.homestar.data.facets(), _process_facet);
        },
        error => {
            return done(new Error("Thing not found"));
        }
    )

    locals.metadata = thing.state("meta");
    locals.metadata_facets = _.ld.list(locals.metadata, 'iot:facet', []);
    locals.metadata_zones = _.ld.list(locals.metadata, 'iot:zone', []);

    const _process_zone = zone => ({
        value: zone,
        name: zone,
        selected: locals.metadata_zones.indexOf(zone) > -1,
    });

    const _process_facet = facet => ({
        value: facet,
        name: facet.replace(/^.*:/, ":"),
        selected: locals.metadata_facets.indexOf(facet) > -1,
    });


    /*
    if (request.method === "POST") {
        const updated = {};

        const name = request.body['schema:name']
        if (name && name.length && name !== locals.metadata['schema:name']) {
            updated['schema:name'] = name;
        }

        const new_facets = _.ld.list(request.body, 'iot:facet', []);
        if (!_.is.Equal(locals.metadata_facets, new_facets)) {
            updated['iot:facet'] = new_facets;
        }

        const new_zones = _.ld.list(request.body, 'iot:zone', []);
        if (!_.is.Equal(locals.metadata_zones, new_zones)) {
            updated['iot:zone'] = new_zones;
        }

        if (!_.is.Empty(updated)) {
            thing.update("meta", updated)
            _.extend(locals.metadata, updated);
        }

        response.redirect("/things#" + locals.thing_id);
        return done(null, true);
    }
    */

    return done(null);
};

/**
 *  API
 */
exports.thing_metadata = thing_metadata;
