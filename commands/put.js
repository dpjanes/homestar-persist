/*
 *  commands/put.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-09-18
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

const iotdb = require('iotdb');
const _ = iotdb._;

const iotdb_thing = require('iotdb-thing');
const iotdb_transport = require('iotdb-transport');

exports.command = "put";
exports.summary = "edit a thing (known by homestar-metadata)";
exports.boolean = [ "help", "boolean", "integer", "number", "all" ];

exports.help = () => {
    console.log("usage: homestar put <type-option> <selector-option> <key> <value>");
    console.log("");
    console.log("<selector-option> (required)");
    console.log("  --all                   - select everything");
    console.log("  --id <id>               - same as <key>=id");
    console.log("  --name <name>           - same as <key>=meta/schema:name");
    console.log("  --facet <facet>         - same as <key>=meta/iot:facet");
    console.log("  --select <key>=<value>")
    console.log("");
    console.log("<type-option> (optional)");
    console.log("  --boolean")
    console.log("  --integer")
    console.log("  --number")
    console.log("")
    console.log("  note that when matching lists, we use intersection");
    console.log("");
    console.log("<key>, e.g.");
    console.log("  meta/schema:name");
    console.log("  ostate/on");
    console.log("  :on                     - semantic selector");
    console.log("");
    console.log("Examples:");
    console.log("");
    console.log("  Turn on thing named WeMo Switch");
    console.log("    homestar put --boolean --name 'WeMo Switch' :on true");
    console.log("");
    console.log("  Rename thing with id 'urn:iotdb:t:sArvozfc:092qoWwd'");
    console.log("    homestar put --id 'urn:iotdb:t:sArvozfc:092qoWwd' meta/schema:name 'New Name'");
    console.log("");
    console.log("  Turn off everything");
    console.log("    homestar put --all :on 0");
    console.log("");
};

const _die = msg => {
    if (msg) {
        console.log(msg);
        console.log()
    }
    exports.help();
    process.exit()
}

const _split = v => {
    const match = v.match(/^([^=]*)=(.*$)/)
    if (!match) {
        return _die("error: invalid key=value format");
    }

    return {
        key: match[1],
        value: match[2],
    };
};

exports.run = ad => {
    if (ad.help) {
        exports.help();
        process.exit()
    }

    let selector_key;
    let selector_value;

    if (ad.all) {
    } else if (ad.name) {
        selector_key = "meta/schema:name";
        selector_value = ad.name;
    } else if (ad.id) {
        selector_key = "id";
        selector_value = ad.id;
    } else if (ad.select) {
        const d = _split(ad.select);
        selector_key = d.key;
        selector_value = d.value;
    } else if (ad.facet) {
        selector_key = "meta/iot:facet";
        selector_value = _.ld.compact(_.ld.expand(ad.facet, "iot-facet:"));
    } else {
        return _die("error: one of --all|name|facet|select is required");
    } 

    if (ad._.length !== 3) {
        return _die("error: <key> <value> to set is missing");
    }

    const set_key = ad._[1];
    let set_band = null;
    let set_band_key = null;
    if (set_key === 'id') {
        return _die("error: <key> cannot be 'id'");
    } else if (set_key.match(/^:/)) {
        set_band = "ostate";
        set_band_key = set_key;
    } else if (set_key.indexOf('/') === -1) {
        return _die("error: <key> must start with a band, e.g. 'meta/'");
    } else {
        const match = set_key.match(/^([-_a-zA-Z0-9]+)\/(.*$)/)
        if (!match) {
            return _die("error: invalid <key> format - expected a band");
        }

        set_band = match[1];
        set_band_key = match[2];

        if (set_band === "model") {
            return _die("error: the 'model' band is immutable");
        }
    }

    let set_value = ad._[2];
    if (ad.boolean) {
        set_value = _.coerce.to.Boolean(set_value);
    } else if (ad.integer) {
        set_value = _.coerce.to.Integer(set_value);
    } else if (ad.number) {
        set_value = _.coerce.to.Number(set_value);
    }

    const out_transporter = iotdb_transport.create("persist");

    out_transporter.all()
        .filter(bandd => ad.all || (_.d.list(bandd, selector_key, []).indexOf(selector_value) > -1))
        .subscribe(bandd => {
            const thing = iotdb_thing.make(bandd);
            const promise = thing.band(set_band).set(set_band_key, set_value);
            promise
                .then(ud => {
                    if (_.is.Empty(ud)) {
                        console.log("+", "already-updated", thing.thing_id());
                        return;
                    }

                    const value = thing.state(set_band);
                    value["@timestamp"] = _.timestamp.make();

                    out_transporter.put({
                        id: thing.thing_id(),
                        band: set_band,
                        value: value,
                    })
                        .subscribe(
                            ok => {
                                console.log("+", "updated", thing.thing_id());
                                console.log("id", thing.thing_id());
                                _.mapObject(ud, (value, key) => {
                                    console.log(`${ set_band }/${ key } ${ value }`);
                                });
                                console.log();
                            },
                            error => {
                                console.log("#", "error", thing.thing_id(), _.error.message(error));
                            }
                        );

                })
                .catch(error => {
                    console.log("#", "error", thing.thing_id(), _.error.message(error));
                })
        });

};
