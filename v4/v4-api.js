const request = require('request')
const configuration = require('../config')

const setV4Header = (token) => {
    if (token) return Object.assign(configuration.constants.apiV4.base, token)
    return configuration.constants.apiV4.base
}

const addDeviceToList = (element) => {
    const device = {}

    device.MyQDeviceId = element.MyQDeviceId
    device.MyQDeviceTypeId = element.MyQDeviceTypeId
    device.MyQDeviceTypeName = element.MyQDeviceTypeName

    configuration.devices.push(device)
}

const callMyQDevice = async (options, type) => {
    return new Promise(async (resolve, reject) => {
        options.json = true
        options.gzip = true
        options.method = type

        request(options, (err, res, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
}

const getToken = async () => {
    return new Promise(async (resolve, reject) => {
        const options = {}
        const tenMinutes = 10 * 60 * 1000
        const timeStamp = new Date()
        const configTimeStamp = configuration.tokenTimeStamp
        const smartTokenManagement = configuration.config.smartTokenManagement

        if (configTimeStamp && smartTokenManagement && timeStamp - configTimeStamp < tenMinutes) resolve(configuration.token)

        options.url = configuration.constants.apiV4.baseUrl + configuration.constants.apiV4.validateUrl
        options.headers = setV4Header()
        options.body = {}
        options.body.password = configuration.config.password
        options.body.username = configuration.config.user

        const data = await callMyQDevice(options, configuration.constants.POST)

        if (data.SecurityToken === undefined) reject(data.ErrorMessage)

        configuration.token = data.SecurityToken
        configuration.tokenTimeStamp = new Date()

        resolve(data.SecurityToken)
    })
}

const getDevices = async () => {
    return new Promise(async (resolve, reject) => {
        const token = await getToken()
        const options = {}

        options.url = configuration.constants.apiV4.baseUrl + configuration.constants.apiV4.devicesUrl
        options.headers = setV4Header({ SecurityToken: token })

        const deviceList = await callMyQDevice(options, configuration.constants.GET)

        if (deviceList.ErrorMessage != configuration.constants.emptyString) reject(deviceList.ErrorMessage)

        resolve(deviceList)

    }).catch(error => reject(error))
}

const getDoorState = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        const id = deviceId ? deviceId : configuration.config.deviceId
        const token = await getToken()
        const options = {}

        options.url = configuration.constants.apiV4.baseUrl + configuration.constants.apiV4.stateUrlFront + id + configuration.constants.apiV4.doorStateUrlEnd
        options.headers = setV4Header({ SecurityToken: token })

        const deviceState = await callMyQDevice(options, configuration.constants.GET)
        const doorStatus = configuration.constants.doorStates[Number(deviceState.AttributeValue)]

        resolve(doorStatus)

    }).catch(error => reject(error))
}

const openDoor = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        const id = deviceId ? deviceId : configuration.config.deviceId
        const data = await setDoorState(configuration.constants.open, id)

        if (data.ErrorMessage != configuration.constants.emptyString) reject(data.ErrorMessage)

        resolve(data)

    }).catch(error => reject(error))
}

const closeDoor = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        const id = deviceId ? deviceId : configuration.config.deviceId
        const data = await setDoorState(configuration.constants.close, id)

        if (data.ErrorMessage) reject(data.ErrorMessage)

        resolve(data)

    }).catch(error => reject(error))
}

const setDoorState = async (change, deviceId) => {
    return new Promise(async (resolve, reject) => {
        const token = await getToken()
        const options = {}

        options.url = configuration.constants.apiV4.baseUrl + configuration.constants.apiV4.changeDeviceStateUrl
        options.headers = setV4Header({ SecurityToken: token })
        options.body = {}
        options.body.attributeName = configuration.constants.desiredDoorState
        options.body.AttributeValue = configuration.constants.types[change]
        options.body.myQDeviceId = deviceId

        const data = await callMyQDevice(options, configuration.constants.PUT)

        resolve(data)

    }).catch(error => reject(error))
}

const detectDoorStateChange = async (desiredState, deviceId) => {
    return new Promise(async (resolve, reject) => {
        let stop = false
        const timeStamp = new Date()
        const thirtySeconds = 1 * 30 * 1000

        while (!stop) {
            await pause()
            const doorState = await getDoorState(deviceId)
            const tickTimestamp = new Date()
            if (doorState != desiredState && timeStamp - tickTimestamp < thirtySeconds) continue
            if (timeStamp - tickTimestamp > thirtySeconds) reject()
            stop = true
            resolve(desiredState)
        }

    }).catch(error => reject(error))
}

const getAutoAddedDevices = async () => {
    return new Promise((resolve, reject) => {
        const list = configuration.devices
        resolve(list)
    }).catch(error => reject(error))
}


const pause = async () => {
    return new Promise(resolve => setTimeout(() => { resolve() }, 2000)).catch(error => reject(error))
}

exports.setDoorState = setDoorState
exports.getToken = getToken
exports.addDeviceToList = addDeviceToList
exports.getAutoAddedDevices = getAutoAddedDevices
exports.detectDoorStateChange = detectDoorStateChange
exports.getDevices = getDevices
exports.getDoorState = getDoorState
exports.openDoor = openDoor
exports.closeDoor = closeDoor
