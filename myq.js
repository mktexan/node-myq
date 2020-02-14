//    Copyright 2019 Cole Stasney
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

const bent = require('bent')
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
        const deviceCall = bent(type, configuration.constants.json)
        const response = await deviceCall(options.url, options.body, options.headers)
        resolve(response)
    })
}

const getToken = async () => {
    return new Promise(async (resolve, reject) => {
        const options = {
            url: configuration.constants.baseUrl + configuration.constants.validateUrl,
            headers: setHeader(),
            gzip: true,
            body: {
                password: configuration.config.password,
                username: configuration.config.user
            },
            json: true
        }

        let data = await callMyQDevice(options, configuration.constants.POST)

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

        const deviceList = await callMyQDevice(options, configuration.constants.GET)

        if (deviceList.ErrorMessage != configuration.constants.emptyString) reject(deviceList.ErrorMessage)

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

        const deviceState = await callMyQDevice(options, configuration.constants.GET)

        const doorStatus = configuration.constants.doorStates[Number(deviceState.AttributeValue)]

        resolve(doorStatus)

    }).catch(error => reject(error))
}

const openDoor = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        deviceId = deviceId || configuration.config.deviceId

        let data = await setDoorState(configuration.constants.open, deviceId)

        if (data.ErrorMessage != configuration.constants.emptyString) reject(data.ErrorMessage)

        resolve(data)

    }).catch(error => reject(error))
}

const closeDoor = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        deviceId = deviceId || configuration.config.deviceId

        let data = await setDoorState(configuration.constants.close, deviceId)

        if (data.ErrorMessage) reject(data.ErrorMessage)

        resolve(data)

    }).catch(error => reject(error))
}

const setDoorState = async (change, deviceId) => {
    return new Promise(async (resolve, reject) => {
        const token = await getToken()

        const options = {
            url: configuration.constants.baseUrl + configuration.constants.changeDeviceStateUrl,
            headers: setHeader({ SecurityToken: token }),
            body: {
                attributeName: configuration.constants.desiredDoorState,
                AttributeValue: configuration.constants.types[change],
                myQDeviceId: deviceId
            },
            json: true,
            gzip: true
        }

        let data = await callMyQDevice(options, configuration.constants.PUT)

        resolve(data)

    }).catch(error => reject(error))
}

const getLightState = async () => {
    return new Promise(async (resolve, reject) => {
        deviceId = deviceId || configuration.config.deviceId

        const token = await getToken()

        const options = {
            url: configuration.constants.baseUrl + configuration.constants.stateUrlFront + deviceId + configuration.constants.lightStateUrlEnd,
            headers: setHeader({ SecurityToken: token }),
            gzip: true
        }

        const lightState = await callMyQDevice(options, configuration.constants.GET)

        const lightStatus = configuration.constants.lightState[Number(lightState.AttributeValue)]

        resolve(lightStatus)

    }).catch(error => reject(error))
}

const setLightState = async (desiredState, deviceId) => {
    return new Promise(async (resolve, reject) => {
        deviceId = deviceId || configuration.config.deviceId

        const token = await getToken()

        const options = {
            url: configuration.constants.baseUrl + configuration.constants.changeDeviceStateUrl,
            headers: setHeader({ SecurityToken: token }),
            body: {
                attributeName: configuration.constants.desiredLightState,
                AttributeValue: configuration.constants.lightState[desiredState],
                myQDeviceId: deviceId
            },
            json: true,
            gzip: true
        }

        const lightState = await callMyQDevice(options, configuration.constants.PUT)

        resolve(lightState)

    }).catch(error => reject(error))
}

const detectDoorStateChange = async (desiredState, deviceId) => {
    return new Promise(async (resolve, reject) => {
        let stop = false
        let timeStamp = new Date()
        let thirtySeconds = 1 * 30 * 1000

        while (!stop) {
            await pause()
            let doorState = await getDoorState(deviceId)
            let tickTimestamp = new Date()
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

const checkApiVersion = async () => {
    const apiV4 = await getDevices()
    if (apiV4) return
}

const pause = async () => {
    return new Promise(resolve => setTimeout(() => { resolve() }, 2000)).catch(error => reject(error))
}

exports.getAutoAddedDevices = getAutoAddedDevices
exports.setCredentials = setCredentials
exports.detectDoorStateChange = detectDoorStateChange
exports.getDevices = getDevices
exports.getDoorState = getDoorState
exports.openDoor = openDoor
exports.closeDoor = closeDoor
exports.getLightState = getLightState
exports.setLightState = setLightState
