/*
 *  index.js
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

var path = require('path');

var metadata = require("./metadata");

exports.homestar = null;
exports.web = {
    setup: function(app, homestar) {
        exports.homestar = homestar;

        app.get("/admin/things/:thing_id/meta", homestar.make_dynamic({
            template: path.join(__dirname, "dynamic/metadata_edit.html"),
            customize: metadata.thing_metadata,
        }));
        app.post("/admin/things/:thing_id/meta", homestar.make_dynamic({
            template: path.join(__dirname, "dynamic/metadata_edit.html"),
            customize: metadata.thing_metadata,
        }));
    },
    locals: {
        metadata_editor: true
    },
}