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


myQ.getDevices().then(devices => {
 //returns array of devices
}).catch(error => {})

myQ.getDoorState().then(state => {
  //Returns a string of door state. See constants
}).catch(error => {})

myQ.openDoor().then(_ => {
  // Promise resolves on success
}).catch(error => {})

myQ.closeDoor().then(_ => {
  // Promise resolves on success
}).catch(error => {})

myQ.detectWhenDoorIsOpen().then(_ => {
  // Resolves when door opens. Use this method once the door starts opening. 
  // Rejects after 30 seconds and door is still closed
}).catch(error => {})

myQ.detectWhenDoorIsClosed().then(_ => {
  // Resolves when door closes. Use this method once the door starts closing. 
  // Rejects after 30 second timeout and door is still open
}).catch(error => {})

myQ.getLightState().then(state => {
  // UNDER CONSTRUCTION
}).catch(error => {})

myQ.setLightState().then(state => {
  // UNDER CONSTRUCTION
}).catch(error => {})
```


# Methods

## getDevices()

Promise, gets devices connected to your myQ account.

## getDoorState()

Promise resolves a string of Door State

## openDoor()

Promis resolves on success of call

## closeDoor()

Promise resolves on success of call

## detectWhenDoorIsClosed()

Resolves when door closes. Use this method once the door starts closing. 
Rejects after 30 second timeout and door is still open

## detectWhenDoorIsOpen()

Resolves when door closes. Use this method once the door starts closing. 
Rejects after 30 second timeout and door is still open

## setLightState()

NOT CURRENTLY AVAILABLE

## getLightState()

NOT CURRENTLY AVAILABLE




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