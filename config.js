
let config = new Object()

let constants = {
    types: {
        close: 0,
        open: 1
    },
    doorStates: {
        1: 'open',
        2: 'closed',
        3: 'stopped in the middle',
        4: 'going up',
        5: 'going down',
        9: 'not closed'
    },
    deviceTypes: {
        7: 'garageDoor'
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
    stateUrlEnd: '&attributeName=doorstate',
    devicesUrl: 'UserDeviceDetails/Get?filterOn=true',
    changeDeviceStateUrl: 'DeviceAttribute/PutDeviceAttribute',
    validateUrl: 'User/Validate',
    closed: 'closed',
    opened: 'opened'
}

let token = ''
var devices = []

module.exports = {
    config,
    constants,
    token,
    devices
}

