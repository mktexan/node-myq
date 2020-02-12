
let config = new Object()

let constants = {
    types: {
        close: 0,
        open: 1
    },
    doorStates: {
        1: 'NA',
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
    emailError: 'Enter an email address',
    passwordError: 'Enter a password',
    deviceSetError: 'Unable to auto set MyQ device',
    baseUrl: 'https://myqexternal.myqdevice.com/api/v4/',
    stateUrlFront: 'DeviceAttribute/GetDeviceAttribute?myQDeviceId=',
    doorStateUrlEnd: '&attributeName=doorstate',
    lightStateUrlEnd: 'attributeName=lightstate',
    devicesUrl: 'UserDeviceDetails/Get?filterOn=true',
    changeDeviceStateUrl: 'DeviceAttribute/PutDeviceAttribute',
    validateUrl: 'User/Validate',
}

let token = ''
var devices = []

module.exports = {
    config,
    constants,
    token,
    devices
}

