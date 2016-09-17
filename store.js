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

const iotdb_transport = require("iotdb-transport");
const iotdb_transport_iotdb = require("iotdb-transport-iotdb");
const iotdb_transport_fs = require("iotdb-transport-fs");

const setup = () => {
    // the live data
    const things = iotdb.things();
    const iotdb_transporter = iotdb_transport_iotdb.make({}, things);

    // the store
    const fs_transporter = iotdb_transport_fs.make({
        prefix: ".iotdb/things"
    });

    // copy live data to the store
    fs_transporter.monitor(iotdb_transporter, {
        // check_read: d => [ "meta", "model", "connection", "istate", "ostate" ].indexOf(d.band) > -1 ? null : new Error("denied"),
    });

    // copy change from the store to live
    iotdb_transporter.monitor(fs_transporter, {
        check_read: d => [ "meta" ].indexOf(d.band) > -1 ? null : new Error("denied"),
    });
};

/**
 */
exports.setup = setup;
