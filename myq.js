const request = require('request')
const configuration = require('./config')

const setCredentials = (user, password, options) => {
    if (!user) throw new Error(configuration.constants.emailError)
    if (!password) throw new Error(configuration.constants.passwordError)

    configuration.config.user = user
    configuration.config.password = password

    if (options.deviceId) configuration.config.deviceId = options.deviceId
    if (options && options.autoSetGarageDoorDevice) autoSetSingleGarageDevice()
    if (options && options.autoSetMultipleGarageDoorDevices) autoSetMultipleGarageDoorDevices()
}

const setHeader = (token) => {
    if (token) return Object.assign(configuration.constants.base, token)
    else return configuration.constants.base
}

const autoSetMultipleGarageDoorDevices = async () => {
    const device = await getDevices()

    configuration.config.multipleDevices = true

    device.Devices.forEach(element => {
        let id = element.MyQDeviceTypeId
        if (id === 7 || id === 17 || id === 5) addDeviceToList(element)
    })
}

const autoSetSingleGarageDevice = async () => {
    const device = await getDevices()
    device.Devices.forEach(element => {
        let id = element.MyQDeviceTypeId
        if (id === 7 || id === 17 || id === 5) configuration.config.deviceId = element.MyQDeviceId
    })
}

const addDeviceToList = (element) => {
    let deviceList = {}

    deviceList.MyQDeviceId = element.MyQDeviceId
    deviceList.MyQDeviceTypeId = element.MyQDeviceTypeId
    deviceList.MyQDeviceTypeName = element.MyQDeviceTypeName

    configuration.devices.push(deviceList)
}

const callMyQDevice = async (options, type) => {
    return new Promise(async (resolve, reject) => {
        request[type](options, (error, ret, body) => {
            if (!error && ret.statusCode === 200) return resolve(body)
            if (ret.statusCode != 200) reject(JSON.stringify())
            else reject(error)
        })
    })
}

const getToken = async () => {
    return new Promise(async (resolve, reject) => {
        const options = {
            url: configuration.constants.baseUrl + configuration.constants.validateUrl,
            headers: setHeader(),
            gzip: true,
            body: {
                'password': configuration.config.password,
                'username': configuration.config.user
            },
            json: true
        }

        let data = await callMyQDevice(options, 'post')

        if (data.SecurityToken === undefined) reject(data.ErrorMessage)

        configuration.token = data.SecurityToken

        resolve(data.SecurityToken)

    }).catch(error => reject(error))
}

const getDevices = async () => {
    return new Promise(async (resolve, reject) => {
        const token = await getToken()

        const options = {
            url: configuration.constants.baseUrl + configuration.constants.devicesUrl,
            headers: setHeader({ SecurityToken: token }),
            gzip: true
        }

        let data = await callMyQDevice(options, 'get')

        const deviceList = JSON.parse(data)

        if (deviceList.ErrorMessage != '') reject(deviceList.ErrorMessage)

        resolve(deviceList)

    }).catch(error => reject(error))
}

const getDoorState = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        deviceId = deviceId || configuration.config.deviceId

        const token = await getToken()

        const options = {
            url: configuration.constants.baseUrl + configuration.constants.stateUrlFront + deviceId + configuration.constants.doorStateUrlEnd,
            headers: setHeader({ SecurityToken: token }),
            gzip: true
        }

        let data = await callMyQDevice(options, 'get')

        const deviceState = JSON.parse(data)

        const doorStatus = configuration.constants.doorStates[Number(deviceState.AttributeValue)]

        resolve(doorStatus)

    }).catch(error => reject(error))
}

const openDoor = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        deviceId = deviceId || configuration.config.deviceId

        let data = await changeDeviceState('open', deviceId)

        if (data.ErrorMessage != '') reject(data.ErrorMessage)

        resolve()

    }).catch(error => reject(error))
}

const closeDoor = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        deviceId = deviceId || configuration.config.deviceId

        let data = await changeDeviceState('close', deviceId)

        if (data.ErrorMessage) reject(data.ErrorMessage)

        resolve()

    }).catch(error => reject(error))
}

const changeDeviceState = async (change, deviceId) => {
    return new Promise(async (resolve, reject) => {
        const token = await getToken()

        const options = {
            url: configuration.constants.baseUrl + configuration.constants.changeDeviceStateUrl,
            headers: setHeader({ SecurityToken: token }),
            body: {
                'attributeName': 'desireddoorstate',
                'AttributeValue': configuration.constants.types[change],
                'myQDeviceId': deviceId
            },
            json: true,
            gzip: true
        }

        let data = await callMyQDevice(options, 'put')

        resolve(data)

    }).catch(error => reject(error))
}

const getLightState = async () => {
    return new Promise(async (resolve, reject) => {
        reject('not available')
        
        deviceId = deviceId || configuration.config.deviceId

        const token = await getToken()

        const options = {
            url: configuration.constants.baseUrl + configuration.constants.stateUrlFront + deviceId + configuration.constants.lightStateUrlEnd,
            headers: setHeader({ SecurityToken: token }),
            gzip: true
        }

        let data = await callMyQDevice(options, 'get')

        const lightState = JSON.parse(data)

        const lightStatus = configuration.constants.lightState[Number(lightState.AttributeValue)]

        resolve(lightStatus)

    }).catch(error => reject(error))
}

const setLightState = async (state) => {
    return new Promise(async (resolve, reject) => {
        reject('not available')
    }).catch(error => reject(error))
}

const detectWhenDoorIsClosed = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        let stop = false
        let timeStamp = new Date()
        let thirtySeconds = 1 * 30 * 1000

        while (!stop) {
            await pause()
            let doorState = await getDoorState(deviceId)
            let tickTimestamp = new Date()
            if (doorState != configuration.constants.doorStates[2] && timeStamp - tickTimestamp < thirtySeconds) continue
            if (timeStamp - tickTimestamp > thirtySeconds) reject()
            stop = true
            resolve()
        }
    }).catch(error => reject(error))
}

const detectWhenDoorIsOpen = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        let stop = false
        let timeStamp = new Date()
        let thirtySeconds = 1 * 30 * 1000

        while (!stop) {
            await pause()
            let doorState = await getDoorState(deviceId)
            let tickTimestamp = new Date()
            if (doorState != configuration.constants.doorStates[9] && timeStamp - tickTimestamp < thirtySeconds) continue
            if (timeStamp - tickTimestamp > thirtySeconds) reject()
            stop = true
            resolve()
        }
    }).catch(error => reject(error))
}

const getAutoAddedDevices = () => {
    return new Promise(async (resolve, reject) => {
        const list = configuration.devices
        resolve(list)
    }).catch(error => reject(error))
}

const pause = async () => {
    return new Promise(resolve => setTimeout(() => { resolve() }, 2000)).catch(error => reject(error))
}

exports.getAutoAddedDevices = getAutoAddedDevices
exports.setCredentials = setCredentials
exports.detectWhenDoorIsClosed = detectWhenDoorIsClosed
exports.detectWhenDoorIsOpen = detectWhenDoorIsOpen
exports.getDevices = getDevices
exports.getDoorState = getDoorState
exports.openDoor = openDoor
exports.closeDoor = closeDoor
exports.getLightState = getLightState
exports.setLightState = setLightState
