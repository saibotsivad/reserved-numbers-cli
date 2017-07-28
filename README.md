# reserved-numbers-cli

[![Greenkeeper badge](https://badges.greenkeeper.io/saibotsivad/reserved-numbers-cli.svg)](https://greenkeeper.io/)

Manage and reserve a range of number of numbers.

I'm mostly using this as a sort of port manager for an nginx module.

A true port manager would probably check that a port
was being unused before assigning it, but this module
does **not** do that. It assumes that all ports are
allocated and deallocated using this module.

## install

	$ npm install -g reserved-numbers-cli

## use it

Tell it what port range is usable:

	$ reserved-numbers-cli config --minimum=4000 --maximum=5000

Then reserve a quantity of numbers (in this example `4`) for some name:

	$ reserved-numbers-cli reserve somename 4

Then see what numbers were allocated:

	$ reserved-numbers-cli get somename
	[4000,4001,4002,4003]

To deallocate numbers, use `free` and the numbers to deallocate:

	$ reserved-numbers-cli free somename 4001
	[4000,4002,4003]

To list all reserved names, use `list`:

	$ reserved-numbers-cli list
	somename (3): [4000,4002,4003]

## output

The output of the `get` command is run through `JSON.stringify` so you
can grab that and `JSON.parse` it in some other program, if needed, e.g.

	reserved-numbers-cli get somename | someapp

## where data is stored

You can pass in a flag each time you run the command (probably set
an alias) which will tell the program where to load the settings:

	$ reserved-numbers-cli list --settingsFile=/path/to/settings.json

If you call it normally without specifying the file, it will create
a new file in the home folder named `.reserved-numbers.json`

## license

This module fully released under the [Very Open License](http://veryopenlicense.com/).

<3
