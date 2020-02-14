A lightweight module for the Chamberlain / Liftmaster - MyQ Smart Garage Hub

*This project is actively developed. Please report any bugs and they will be addressed in a very timely manner.*

# Install

`npm i --save node-myq` 

# Initilization

``` javascript
const myq = require('node-myq')

const options = {
    autoSetGarageDoorDevice: true, //automatically adds a SINGLE DOOR to the API
    autoSetMultipleGarageDoorDevices: false, //automatically adds ALL DETECTED DOORS to the API
    deviceId: 213213 //use this to manually set your own single deviceId
}

myq.setCredentials('email@example.com', 'password', options)
```

# Methods
Other APIs hav a login() function for myQ. This API handles login state and tokens automatically for you! Just set your credentials and the rest is taken care of.

## getDevices()

A promise that returns an array of devices detected on the network

``` javascript
//returns array of devices detected on the network

myq.getDevices().then(deviceList => {
    console.log(deviceList)
}).catch(error => {})

//or

const deviceList = await myq.getDevices()
```

## getDoorState(deviceId)

Promise resolves a string of door state on success of the call. Reference the constants below to see the door state output.
deviceId is optional. Use it if you have multiple devices in your network and wish to call a specific device.
If deviceId is not provided, the API will default to the single deviceId that you set using autoSetGarageDoorDevice: true or deviceId: yourDeviceId.

``` javascript
const deviceId = 212121

//deviceId is an optional overload

myq.getDoorState(deviceId).then(doorState => {
    console.log(doorState)
    //Returns a string of door state. See Return Values at the bottom of the page.
}).catch(error => {})

//or

const doorState = await myq.getDoorState()
```

## openDoor(deviceId)

Promise resolves on success of call.deviceId is optional. Use it if you have multiple devices in your network and wish to call a specific device.
If deviceId is not provided, the API will default to the single deviceId that you set using autoSetGarageDoorDevice: true or deviceId: yourDeviceId.

``` javascript
const deviceId = 212121

//deviceId is an optional overload

myq.openDoor(deviceId).then(data => {
    // Promise resolves on success with a return object from the MyQ device
}).catch(error => {})

//or

await myq.openDoor()
```

This is an example return object 

``` javascript
{
  UpdatedTime: '1581692278599',
  ReturnCode: '0',
  ErrorMessage: '',
  CorrelationId: '223e24ef-e452-4fda-a027-5570858ab341'
}
```

## closeDoor(deviceId)

Promise resolves on success of call. deviceId is an optional overload. Use it if you have multiple devices in your network and wish to call a specific device.
If deviceId is not provided, the API will default to the single deviceId that you set using autoSetGarageDoorDevice: true or deviceId: yourDeviceId.

``` javascript
const deviceId = 212121

//deviceId is an optional overload

myq.closeDoor(deviceId).then(data => {
    // Promise resolves on success with a return object from the MyQ device
}).catch(error => {})

//or

await myq.closeDoor()
```

This is an example return object 

``` javascript
{
  UpdatedTime: '1581692278599',
  ReturnCode: '0',
  ErrorMessage: '',
  CorrelationId: '223e24ef-e452-4fda-a027-5570858ab341'
}
```

## detectDoorStateChange(state, deviceId)

Resolves when door action completes. Use this method once the door starts closing or opening.
Rejects after 30 seconds and if the door is still in the previous state.
 deviceId is optional. Use it if you have multiple devices in your network and wish to call a specific device.
If deviceId is not provided, the API will default to the single deviceId that you set using autoSetGarageDoorDevice: true or deviceId: yourDeviceId.

``` javascript
const deviceId = 212121

//pass either opened or closed as the state
const desiredState = "closed"
const desiredState = "opened"

//deviceId is an optional overload

myq.detectDoorStateChange(desiredState, deviceId).then(state => {
    console.log('the door is now ' + state)
    // Promise resolves on success
}).catch(error => {})

//or 

const state = await myq.detectDoorStateChange(state)

console.log('the door is now ' + state)
```

## getAutoAddedDevices()

Returns an array of door or garage door devices that were automatically added to the API using autoSetMultipleGarageDoorDevices: true

``` javascript
myq.getAutoAddedDevices().then(deviceList => {
    console.log(deviceList)
    // Promise resolves on success
}).catch(error => {})

//or

const deviceList = await myq.getAutoAddedDevices()
```

## Return Values

| Door State | Description           |
|------------|-----------------------|
| 1          | NA                    |
| 2          | closed                |
| 3          | stopped in the middle |
| 4          | going up              |
| 5          | going down            |
| 9          | opened                |

