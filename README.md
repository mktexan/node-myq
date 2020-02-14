A lightweight module for the Chamberlain / Liftmaster - MyQ Smart Garage Hub

*This project is actively developed. Please report any bugs and they will be addressed in a very timely manner.*

# Install

`npm i --save node-myq` 

# Initilization

``` javascript
const myq = require('node-myq')

const options = {
    autoSetGarageDoorDevice: true, //automatically adds a SINGLE DOOR to the API
    autoSetMultipleGarageDoorDevices: true, //automatically adds ALL DETECTED DOORS to the API
    deviceId: 213213 //use this to manually set your own single deviceId
}

myq.setCredentials('email@example.com', 'password', options)
```

# Methods
Other APIs hav a login() function for myQ. This API handles login state and tokens automatically for you! Just set your credentials and the rest is taken care of.

deviceId is an optional overload. Use it if you have multiple devices in your network and wish to call a specific device.
If deviceId is not provided, the API will default to the single deviceId that you set using autoSetGarageDoorDevice: true or deviceId: yourDeviceId.

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

``` javascript
//deviceId is an optional overload
const deviceId = 212121

myq.getDoorState(deviceId).then(doorState => {
    console.log(doorState)
    //Returns a string of door state. See Return Values at the bottom of the page.
}).catch(error => {})

//or
const doorState = await myq.getDoorState()
```

## openDoor(deviceId)

Promise resolves an object from the myQ device on success of call.

``` javascript
//deviceId is an optional overload
const deviceId = 212121

myq.openDoor(deviceId).then(data => {
    // Promise resolves on success with a return object from the MyQ device
}).catch(error => {})

//or
await myq.openDoor()

//or
const response = await myq.openDoor()
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

Promise resolves an object from the myQ device on success of call.

``` javascript
//deviceId is an optional overload
const deviceId = 212121

myq.closeDoor(deviceId).then(data => {
    // Promise resolves on success with a return object from the MyQ device
}).catch(error => {})

//or
await myq.closeDoor()

//or
const response = await myq.closeDoor()
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
Rejects after 30 seconds and if the door is still in the same state.

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
const state = await myq.detectDoorStateChange(desiredState)

console.log('the door is now ' + state)
```

## getAutoAddedDevices()

Returns an array of door or garage door device objects that were automatically added to the API using autoSetMultipleGarageDoorDevices: true

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


## Author

[Cole Stasney](https://cole-stasney.com/) ([mkcoarng@gmail.com](mailto:mkcoarng@gmail.com))

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)

