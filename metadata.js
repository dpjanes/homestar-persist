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

var _facets = [
    { value: "iot-facet:appliance", key: "appliance", },
    { value: "iot-facet:climate", key: "climate", },
    { value: "iot-facet:climate.cooling", key: "climate.cooling", },
    { value: "iot-facet:climate.heating", key: "climate.heating", },
    { value: "iot-facet:control", key: "control", },
    { value: "iot-facet:control.dial", key: "control.dial", },
    { value: "iot-facet:control.dimmer", key: "control.dimmer", },
    { value: "iot-facet:control.keyboard", key: "control.keyboard", },
    { value: "iot-facet:control.keypad", key: "control.keypad", },
    { value: "iot-facet:control.mouse", key: "control.mouse", },
    { value: "iot-facet:control.switch", key: "control.switch", },
    { value: "iot-facet:control.touchpad", key: "control.touchpad", },
    { value: "iot-facet:gateway", key: "gateway", },
    { value: "iot-facet:lighting", key: "lighting", },
    { value: "iot-facet:media", key: "media", },
    { value: "iot-facet:security", key: "security", },
    { value: "iot-facet:sensor", key: "sensor", },
    { value: "iot-facet:sensor.chemical", key: "sensor.chemical", },
    { value: "iot-facet:sensor.chemical.carbon-dioxide", key: "sensor.chemical.carbon-dioxide", },
    { value: "iot-facet:sensor.chemical.carbon-monoxide", key: "sensor.chemical.carbon-monoxide", },
    { value: "iot-facet:sensor.fire", key: "sensor.fire", },
    { value: "iot-facet:sensor.heat", key: "sensor.heat", },
    { value: "iot-facet:sensor.humidity", key: "sensor.humidity", },
    { value: "iot-facet:sensor.humidty", key: "sensor.humidty", },
    { value: "iot-facet:sensor.motion", key: "sensor.motion", },
    { value: "iot-facet:sensor.particulates", key: "sensor.particulates", },
    { value: "iot-facet:sensor.presence", key: "sensor.presence", },
    { value: "iot-facet:sensor.shatter", key: "sensor.shatter", },
    { value: "iot-facet:sensor.sound", key: "sensor.sound", },
    { value: "iot-facet:sensor.spatial", key: "sensor.spatial", },
    { value: "iot-facet:sensor.temperature", key: "sensor.temperature", },
    { value: "iot-facet:sensor.water", key: "sensor.water", },
    { value: "iot-facet:toy", key: "toy", },
    { value: "iot-facet:wearable", key: "wearable", },
];

var _zones1 = [
    "Kitchen", "Living Room", "Basement", "Master Bedroom", "Bedroom", "Den",
    "Main Floor", "Second Floor",
    "Front Garden", "Back Garden",
];
_zones1.sort()
var _zones = []
_zones1.map(function(zone) {
    _zones.push({
        key: zone,
        value: zone,
    });
});

var thing_metadata = function(request, response, locals, done) {
    /* XXX check the user's permissions to edit metadata */
    
    locals.thing_id = request.params.thing_id;
    locals.zones = _zones;
    locals.facets = _facets;

    /* find a thing with the Thing id */
    var thing = index.homestar.things.thing_by_id(locals.thing_id);
    var metadata = _.ld.compact(thing.meta().state());

    if (request.method === "POST") {
        var updated = {};

        var name = request.body['schema:name']
        if (name && name.length && name != metadata['schema:name']) {
            updated['schema:name'] = name;
        }

        var old_facets = _.ld.list(metadata, 'iot:facet', []);
        var new_facets = _.ld.list(request.body, 'iot:facet', []);
        if (!_.equals(old_facets, new_facets)) {
            updated['iot:facet'] = new_facets;
        }

        var old_zones = _.ld.list(metadata, 'iot:zone', []);
        var new_zones = _.ld.list(request.body, 'iot:zone', []);
        if (!_.equals(old_zones, new_zones)) {
            updated['iot:zone'] = new_zones;
        }

        if (!_.is.Empty(updated)) {
            thing.meta().update(updated, { set_timestamp: true });
            _.extend(metadata, updated);
        }

        response.redirect("/things#" + locals.thing_id);
        return done(null, true);
    }

    var metadata_facets = _.ld.list(metadata, 'iot:facet', []);
    for (var fi in _facets) {
        var fd = _facets[fi];
        fd.selected = false;
        if (metadata_facets.indexOf(fd.value) > -1) {
            fd.selected = true;
        }
    }

    var metadata_zones = _.ld.list(metadata, 'iot:zone', []);
    for (var fi in _zones) {
        var fd = _zones[fi];
        fd.selected = false;
        if (metadata_zones.indexOf(fd.value) > -1) {
            fd.selected = true;
        }
    }

    locals.metadata = metadata;
    locals.metadata_facets = metadata_facets;
    locals.metadata_zones = metadata_zones;

    return done(null);
};

/**
 *  API
 */
exports.thing_metadata = thing_metadata;

exports.make_dynamic = null;    // this will be pushed in by index.js during setup
