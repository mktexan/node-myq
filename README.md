A module for the Chamberlain myQ garage door opener.

# Install

`npm i --save node-myQ`

# Usage

```javascript
const myQ = require('node-myq')

myQ.setCredentials('email@example.com', 'password', { autoSetGarageDoorDevice: true, deviceId: 213213})
// Email and password are reqired
// autoSetGarageDoorDevice will only work with one garage controller connected!
// If not selected autoSetGarageDoorDevice, pass the device Id in the options

// Use this method if you wish to manually set your device id or if you have more than one device
myQ.getDevices().then(devices => {
  console.log(devices) //returns array of devices
}).catch(console.log) //Don't forget to catch errors

myQ.getState().then(state => {
  console.log(state)
}).catch(console.log)

myQ.openDoor().then(door => {
  console.log(door) //If this does not work, try other device Ids'
}).catch(console.log)

myQ.closeDoor().then(door => {
  console.log(door)
}).catch(console.log)
```

# Methods

## getDevices()

Promise, gets devices connected to your myQ account.

## getState([deviceId])

Promise resolves door state of "opened" or "closed"

## openDoor([deviceId])

Promis resolves on success of call

## closeDoor([deviceId])

Promise resolves on success of call
