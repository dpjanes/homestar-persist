/*
 *  commands/things.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-09-16
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

const iotdb_transport_fs = require('iotdb-transport-fs');

exports.command = "things";
exports.summary = "list things (known by homestar-metadata)";

exports.help = () => {
    console.log("usage: homestar things <options>");
    console.log("");
};

const _explain = (band, d) => 
    _.flatten(_.keys(d || {})
        .sort()
        .filter(key => !key.match(/^@/))
        .map(key => ({ key: key, value: d[key] }))
        .filter(itemd => !_.is.Dictionary(itemd.value))
        .map(itemd => ({ key: itemd.key, values: _.coerce.list(itemd.value) }))
        .map(itemd => itemd.values.map(value => `${ band }/${ itemd.key } ${ value }`)), true)

exports.run = ad => {
    const fs_transporter = iotdb_transport_fs.make({
        prefix: ".iotdb/things"
    });

    fs_transporter.list()
        .subscribe(
            ld => {
                fs_transporter.one({
                    id: ld.id,
                })
                    .subscribe(
                        bandd => {
                            console.log("id", ld.id);
                            _.flatten(
                                _.keys(bandd)
                                    .sort()
                                    .filter(band => band !== "model")
                                    .map(band => _explain(band, bandd[band])), true)
                                .map(line => console.log(line));

                            console.log()
                        }
                    );

            }
        );
};