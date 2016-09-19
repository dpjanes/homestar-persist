# homestar-persist
[IOTDB](https://github.com/dpjanes/node-iotdb) module to persist all Thing data to disk.

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

# About

This will persist (write to disk) all the data belonging to your Things.
It will also allow modification of that data, which will be written back to the 
Things, e.g. to modify metadata or the state

## Files

Files are persisted in `.iotdb/things`. After you've played with this
it's worth looking at what it's actually storing.

# Installation and Configuration

* [Read this first](https://github.com/dpjanes/node-iotdb/blob/master/docs/install.md)

If you want to use the CLI tools (you probably do), also install HomeStar:

* [Read about installing Home☆Star](https://github.com/dpjanes/node-iotdb/blob/master/docs/homestar.md) 

Then:

    $ npm install homestar-persist

# Use
## Tracking IOTDB installation

    const iotdb = require("iotdb")

    // e.g. connect to stuff
    iotdb.use("homestar-wemo");
    iotdb.connect("WeMoSocket");

    // this is the magic
    iotdb.use("homestar-persist");

That's it! If you look in `.iotdb/things` you'll see 
all the Things that IOTDB discovers listed here, one
folder per `id` and then one JSON file per **band**.

## In HomeStar

Just add the following to `boot/index.js` after you've
set up HomeStar:

    iotdb.use("homestar-persist");

# Command Line

## `things`

This will list everything this module knows about your Things:

    $ homestar things

Note that 

## `put`

To get all the options, try

    $ homestar put --help

The naming convention for keys, e.g. `meta/schema:name` will make more
sense if you try `homestar things` first

Turn on Thing named 'WeMo Switch' (`--boolean` is optional here because 
IOTDB's type coercion system will Do The Right Thing)

    $ homestar put --boolean --name 'WeMo Switch' :on true

Rename the Thing with id 'urn:iotdb:t:sArvozfc:092qoWwd'

    $ homestar put --id 'urn:iotdb:t:sArvozfc:092qoWwd' meta/schema:name 'New Name'

Turn off everything

    $ homestar put --all :on 0

XXX

    $ homestar put --select meta/schema:manufacturer=http://www.belkin.com/

