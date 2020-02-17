A module for the Chamberlain / Liftmaster - MyQ Smart Garage Hub

Tested and works on API V4 and API V5!

*Light functionality coming soon*

# Install

`npm i --save node-myq` 

# Initilization

``` javascript
const myq = require('node-myq')

const options = {
    autoSetGarageDoorDevice: true, //automatically adds a SINGLE DOOR to the API if true
    autoSetMultipleGarageDoorDevices: false, //automatically adds MULTIPLE DOORS to the API if true
    deviceId: 213213, //manually set your own single deviceId, otherwise leave this option out
    smartTokenManagement: true, // allows for significantly increased performance by managing token state
    apiVersion: 5 // Set either 4 or 5. Defaults to 4 if no option provided untill MyQ API V4 is no longer supported
}

myq.setCredentials('email@example.com', 'password', options)
```

# Notes

API V5 funtionality has been added. When using API V5, you can pass in a device serial number in place of a deviceId used in API V4 to communicate with a single device.
The getDevices call for V5 returns a different object than V4.

Here is the V4 return object for Get Devices

``` javascript
{
    Devices: [{
            MyQDeviceId: 1801232,
            ParentMyQDeviceId: 11751349,
            MyQDeviceTypeId: 7,
            MyQDeviceTypeName: 'VGDO',
            RegistrationDateTime: '2020-02-17T15:11:41.7911418Z',
            SerialNumber: 'CG0846239ED5',
            UserName: 'example@example.com',
            UserCountryId: 0,
            Attributes: [Array],
            ChildrenMyQDeviceIds: '',
            UpdatedBy: 'System',
            UpdatedDate: '2020-02-17T15:11:41.7911418Z',
            ConnectServerDeviceId: '180912312'
        },
        {
            MyQDeviceId: 11751349,
            MyQDeviceTypeId: 1,
            MyQDeviceTypeName: '',
            RegistrationDateTime: '2020-02-17T15:29:37.9694407Z',
            SerialNumber: 'GW23032C61',
            UserName: 'example@example.com',
            UserCountryId: 0,
            Attributes: [Array],
            ChildrenMyQDeviceIds: '12221232',
            UpdatedBy: 'System',
            UpdatedDate: '2020-02-17T15:29:37.9694407Z',
            ConnectServerDeviceId: '1172399'
        }
    ],
    ReturnCode: '0',
    ErrorMessage: '',
    CorrelationId: 'ed8e1eb8-397a-4f58-af79-d1c53d8c3cc5'
}
```

Here is the V5 return object for Get Devices

``` javascript
{
    href: 'http://api.myqdevice.com/api/v5/accounts/79a4960d-e449-4c80-85f7-e28dasdsa203d31/devices',
    count: 2,
    items: [{
            href: 'http://api.myqdevice.com/api/v5/accounts/79a4960d-e449-4c80-85f7-e281asddas03d31/devices/CG0846469ED5',
            serial_number: 'CG0846469ED5',
            device_family: 'garagedoor',
            device_platform: 'myq',
            device_type: 'virtualgaragedooropener',
            name: 'Garage Door',
            parent_device: 'http://api.myqdevice.com/api/v5/accounts/79a4960d-e449-4c80-85f7-e281asddsa3d31/devices/GW2300201C61',
            parent_device_id: 'GW2300201C61',
            created_date: '2020-02-01T16:02:20.773',
            state: [Object]
        },
        {
            href: 'http://api.myqdevice.com/api/v5/accounts/79a4960d-e449-4c80-85f7-e281bsasad31/devices/GW2300201C61',
            serial_number: 'GW2300201C61',
            device_family: 'gateway',
            device_platform: 'myq',
            device_type: 'hub',
            name: 'Garage Door',
            created_date: '2020-02-01T16:01:26.14',
            state: [Object]
        }
    ]
}
```

The state object is where you will find all the information you need about your device for V5. Here is the example.

``` javascript
{
    dps_low_battery_mode: false,
    monitor_only_mode: false,
    number_of_learned_dps_devices: 1,
    sensor_comm_error: false,
    door_state: 'closed',
    open: 'http://api.myqdevice.com/api/v5/accounts/79a4960d-e449-4c80-85f7-e12331/devices/CG084644125/open',
    close: 'http://api.myqdevice.com/api/v5/accounts/79a4960d-e449-4c80-85f7-2131d31/devices/CG0421ED5/close',
    last_update: '2020-02-17T15:11:41.7911418Z',
    passthrough_interval: '00:00:00',
    door_ajar_interval: '00:00:00',
    invalid_credential_window: '00:00:00',
    invalid_shutout_period: '00:00:00',
    is_unattended_open_allowed: true,
    is_unattended_close_allowed: true,
    aux_relay_delay: '00:00:00',
    use_aux_relay: false,
    aux_relay_behavior: 'None',
    rex_fires_door: false,
    command_channel_report_status: false,
    control_from_browser: false,
    report_forced: false,
    report_ajar: false,
    max_invalid_attempts: 0,
    online: true,
    last_status: '2020-02-17T15:21:56.6413241Z'
}
```

Enjoy API V5 and please report any bugs or submit a pull request if you have something to improve!

# Methods

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

