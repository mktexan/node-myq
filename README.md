A module for the Chamberlain - MyQ Smart Garage Hub

# Install

`npm i --save node-myq`

# Usage

```javascript
const myQ = require('node-myq')

// Available options
// Chose one or the other as autoSetGarageDoorDevice will automatically set your deviceId
let options = { autoSetGarageDoorDevice: true }
let options = { deviceId: 213213 }

myQ.setCredentials('email@example.com', 'password', options)

// Use this method if you wish to get your deviceId's
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

## getState()

Promise resolves a string of Door State

## openDoor()

Promis resolves on success of call

## closeDoor()

Promise resolves on success of call


## Return Values

| Door State | Description           |
|------------|-----------------------|
| 1          | open                  |
| 2          | closed                |
| 3          | stopped in the middle |
| 4          | going up              |
| 5          | going down            |
| 9          | not closed            |


| Light State   | Description |
|---------------|-------------|
| 0             | off         |
| 1             | on          |