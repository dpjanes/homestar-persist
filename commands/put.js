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

const configuration = require("..").configuration;

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

exports.run = ad => {
    if (ad.help) {
        exports.help();
        process.exit()
    }

    const cfgd = _.first(configuration());
    const out_transporter = require(cfgd.transporter).make(cfgd.initd);

    console.log("HERE")

};
