#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const userHome = require('user-home')
const xtend = require('xtend')

const command = process.argv[2]
const name = process.argv[3]
const args = require('minimist')(process.argv.slice(3))

const cleanedArgs = xtend(args, {})
delete cleanedArgs._

const defaultOpinions = {
	settings: {
		minimum: 4000,
		maximum: 5000
	},
	numbers: {}
}

const settingsFile =  args.settingsFile || path.join(userHome, '.reserved-numbers.json')
if (!args.settingsFile) {
	try {
		fs.statSync(settingsFile).isFile()
	} catch (e) {
		console.log('writing default opinions to:', settingsFile)
		write(defaultOpinions)
	}
}
const config = JSON.parse(fs.readFileSync(settingsFile, { encoding: 'utf8' }))

const helpMessage = `
use like: reserved-numbers-cli command
where 'command' is one of the following:
  list
  get NAME                           # list all reserved numbers for that name
  reserve NAME [quantityOfNumbers]   # reserves N more numbers and echos out
  free NAME [number]                   # deallocate a number from a name
  config [options]                   # set program options like --foo-bar`

function die(message) {
	console.log(message)
	process.exit(1)
}

function write(data) {
	fs.writeFileSync(settingsFile, JSON.stringify(data, undefined, 2), { encoding: 'utf8' })
}

function getUsedNumbers() {
	return Object.keys(config.numbers)
		.map(key => config.numbers[key])
		.reduce((arr, numbers) => arr.concat(numbers), [])
}

function getUsedNumbersMap(usedNumbers) {
	return usedNumbers.reduce((map, number) => {
		map[number] = true
		return map
	}, {})
}

function reserveNumbers(usedNumbersMap, quantityOfNumbers) {
	const min = config.settings.minimum
	const max = config.settings.maximum
	const numbers = []
	for (var i = min; i <= max; i++) {
		if (!usedNumbersMap[i]) {
			numbers.push(i)
		}
		if (numbers.length === quantityOfNumbers) {
			return numbers
		}
	}
	die('could not reserve enough numbers!')
}

if (!command) {
	die(helpMessage)
}

if (command === 'list' || (command === 'get' && !name)) {
	const numbers = Object.keys(config.numbers)
	if (numbers.length > 0) {
		numbers.forEach(key => {
			console.log(`  ${key} (${config.numbers[key].length}): ${JSON.stringify(config.numbers[key])}`)
		})
	} else {
		die('none configured')
	}
} else if (command === 'get' && name) {
	console.log(JSON.stringify(config.numbers[name]))
} else if (command === 'delete') {
	delete config.numbers[name]
	write(config)
} else if (command === 'reserve' && process.argv[4]) {
	const quantityOfNumbersToReserve = parseInt(process.argv[4], 10)
	const numbersToReserve = reserveNumbers(getUsedNumbersMap(getUsedNumbers()), quantityOfNumbersToReserve)
	config.numbers[name] = (config.numbers[name] || []).concat(numbersToReserve)
	console.log(JSON.stringify(config.numbers[name]))
	write(config)
} else if (command === 'free' && process.argv[4]) {
	const numberToDeallocate = parseInt(process.argv[4], 10)
	if (config.numbers[name]) {
		config.numbers[name] = config.numbers[name].filter(num => num !== numberToDeallocate)
		console.log(JSON.stringify(config.numbers[name]))
		write(config)
	}
} else if (command === 'config') {
	const setters = Object.keys(cleanedArgs)
	if (setters.length === 0) {
		if (process.argv[3]) {
			console.log(JSON.stringify(config.settings[process.argv[3]]))
		} else {
			console.log('configurable properties (set with --foo=bar):')
			Object.keys(config.settings).forEach(key => {
				console.log(`  ${key}: ${config.settings[key]}`)
			})
		}
	} else if (setters.length > 0) {
		setters.forEach(key => {
			if (cleanedArgs[key]) {
				config.settings[key] = cleanedArgs[key]
			} else {
				delete config.settings[key]
			}
		})
		write(config)
	} else {
		die(`unknown command to config`)
	}
} else {
	die(helpMessage)
}
