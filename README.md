A module for the Chamberlain myQ garage door opener.

# Install

`npm i --save node-myQ`

# Usage

```javascript
const myQ = require('node-myq')

// If you have a single garage door device, you can pass autoSetGarageDoorDevice : true 
// to automatically add your garage device by its id
myQ.setCredentials('email@example.com', 'password', { autoSetGarageDoorDevice: true})

// If you do not wish to automatically add your device, pass the device id
myQ.setCredentials('email@example.com', 'password', { deviceId: 213213})

// You can also leave the device id and autoSetGarageDoorDeviceout completely if you have 
// a list of your own device id's. You will need to use the same user and password for each device or set a new myQ variable. 
myQ.setCredentials('email@example.com', 'password')

// Use this method if you wish to manually set your device id or if you have more than one device
myQ.getDevices().then(devices => {
 //returns array of devices
}).catch(error => {})

myQ.getState().then(state => {
  //Returns a string of opened or closed
}).catch(error => {})

myQ.openDoor().then(door => {
  // Promise resolves on success
}).catch(error => {})

myQ.closeDoor().then(door => {
  // Promise resolves on success
}).catch(error => {})
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
