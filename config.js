
let config = new Object()

const constants = {
    types: {
        close: 0,
        open: 1,
        toggle: 'toggle'
    },
    doorStates: {
        1: 'open',
        2: 'closed',
        3: 'stopped in the middle',
        4: 'going up',
        5: 'going down',
        9: 'opened'
    },
    lightState: {
        0: 'off',
        1: 'on'
    },
    deviceTypes: {
        1: 'Gateway',
        2: 'GDO',
        3: 'Light',
        5: 'Gate',
        7: 'VGDO Garage Door',
        9: 'Commercial Door Operator (CDO)',
        13: 'Camera',
        15: 'WGDO Gateway AC',
        16: 'WGDO Gateway DC',
        17: 'WGDO Garage Door'
    },
    base: {
        Culture: 'en',
        BrandId: 2,
        MyQApplicationId: 'OA9I/hgmPHFp9RYKJqCKfwnhh28uqLJzZ9KOJf1DXoo8N2XAaVX6A1wcLYyWsnnv',
        ApiVersion: 4.1
    },
    deprecatedBase: {
        Culture: 'en',
        MyQApplicationId: 'Vj8pQggXLhLy0WHahglCD4N1nAkkXQtGYpq2HrHD7H1nvmbT55KqtN6RSF4ILB/i',
    },
    apiV5: {
        baseUrl: 'https://api.myqdevice.com',
        loginUrl: 'https://api.myqdevice.com/api/v5/Login',
        base: {
            Culture: 'en',
            MyQApplicationId: 'JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu',
        },
    },
    deprecatedUrl: 'https://myqexternal.myqdevice.com/',
    emailError: 'Enter an email address',
    passwordError: 'Enter a password',
    apiVersionError:'Your device is incompatible with API V4 and API V5',
    deviceSetError: 'Unable to auto set MyQ device',
    baseUrl: 'https://myqexternal.myqdevice.com/api/v4/',
    stateUrlFront: 'DeviceAttribute/GetDeviceAttribute?myQDeviceId=',
    doorStateUrlEnd: '&attributeName=doorstate',
    lightStateUrlEnd: '&attributeName=lightstate',
    devicesUrl: 'UserDeviceDetails/Get?filterOn=true',
    changeDeviceStateUrl: 'DeviceAttribute/PutDeviceAttribute',
    validateUrl: 'User/Validate',
    desiredDoorState: 'desireddoorstate',
    desiredLightState: 'desiredlightstate',
    getAutoAddedDevices: 'getAutoAddedDevices',
    setDoorState: 'setDoorState',
    getDoorState: 'getDoorState',
    getDevices: 'getDevices',
    getToken: 'getToken',
    timeOutRefreshToken: 600000,
    close: 'close',
    json: 'json',
    emptyString: '',
    open: 'open',
    PUT: 'PUT',
    POST: 'POST',
    GET: 'GET'
}

let token
let defaultApiVersion = 4
let tokenTimeStamp
let devices = []

module.exports = {
    config,
    constants,
    token,
    tokenTimeStamp,
    devices,
    defaultApiVersion
}

