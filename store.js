/*
 *  store.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-09-15
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

const iotdb_transport_iotdb = require("iotdb-transport-iotdb");

const _check = bands => d => bands.indexOf(d.band) === -1 ? new Error("denied") : null;

const setup = () => {
    // the live data
    const things = iotdb.things();
    const iotdb_transporter = iotdb_transport_iotdb.make({}, things);

    require(".")
        .configuration()
        .forEach(cfgd => {
            // out store
            const out_transporter = require(cfgd.transporter).make(cfgd.initd);

            // copy live data to the out store
            out_transporter.monitor(iotdb_transporter, {
                check_source: _check(cfgd.out_bands),
                check_destination: _check(cfgd.in_bands),
            });

            // copy change from the out store to live
            iotdb_transporter.monitor(out_transporter, {
                check_source: d => _check(cfgd.in_bands),
                check_destination: d => _check(cfgd.in_bands),
            });
        })

};

/**
 */
exports.setup = setup;
