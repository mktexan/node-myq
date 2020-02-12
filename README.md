A module for the Chamberlain - MyQ Smart Garage Hub

# Install

`npm i --save node-myq`

# Usage Example

```javascript
const node_myQ = require('node-myq')

let options = {
    autoSetGarageDoorDevice: true, // use for automatically adding a SINGLE DEVICE
    autoSetMultipleGarageDoorDevices: false, // automatically adds ALL DETECTED DOORS to the API. 
    deviceId: 213213 // Use this to manually set your own single deviceId
}

node_myQ.setCredentials('email@example.com', 'password', options)

node_myQ.getDevices().then(devices => {
 //returns array of devices detected on the network
}).catch(error => {})

node_myQ.getDoorState().then(state => {
  //Returns a string of door state. See constants
}).catch(error => {})

node_myQ.openDoor().then(_ => {
  // Promise resolves on success
}).catch(error => {})

node_myQ.closeDoor().then(_ => {
  // Promise resolves on success
}).catch(error => {})
```


# Methods

## getDevices()

A promise that returns an array of devices detected on the network

## getDoorState(deviceId)

Promise resolves a string of door state on success of the call. Reference the constants below to see the door state output.
deviceId is optional. Use it if you have multiple devices in your network and wish to call a specific device. 
If deviceId is not provided, the API will default to the single deviceId that you set using autoSetGarageDoorDevice: true or deviceId: yourDeviceId.

## openDoor(deviceId)

Promise resolves on success of call. deviceId is optional. Use it if you have multiple devices in your network and wish to call a specific device. 
If deviceId is not provided, the API will default to the single deviceId that you set using autoSetGarageDoorDevice: true or deviceId: yourDeviceId.

## closeDoor(deviceId)

Promise resolves on success of call

## detectWhenDoorIsClosed(deviceId)

Resolves when door closes. Use this method once the door starts closing. 
Rejects after 30 seconds and if the door is still opened.
deviceId is optional. Use it if you have multiple devices in your network and wish to call a specific device. 
If deviceId is not provided, the API will default to the single deviceId that you set using autoSetGarageDoorDevice: true or deviceId: yourDeviceId.

## detectWhenDoorIsOpen(deviceId)

Resolves when door opens. Use this method once the door starts opening.
deviceId is optional. Use it if you have multiple devices in your network and wish to call a specific device. 
If deviceId is not provided, the API will default to the single deviceId that you set using autoSetGarageDoorDevice: true or deviceId: yourDeviceId.
Rejects after 30 seconds and if the door is still closed.

## getAutoAddedDevices(deviceId)

Returns an array of door or garage door devices that were automatically added to the API using autoSetMultipleGarageDoorDevices: true


## Return Values

| Door State | Description           |
|------------|-----------------------|
| 1          | NA                    |
| 2          | closed                |
| 3          | stopped in the middle |
| 4          | going up              |
| 5          | going down            |
| 9          | opened                |
