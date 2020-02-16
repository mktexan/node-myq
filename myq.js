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

    checkApiVersion()

    if (options.deviceId) configuration.config.deviceId = options.deviceId
    if (options.autoSetGarageDoorDevice) autoSetSingleGarageDevice()
    if (options.autoSetMultipleGarageDoorDevices) autoSetMultipleGarageDoorDevices()
    if (options.smartTokenManagement) setRefreshToken()
}

const setV4Header = (token) => {
    if (token) return Object.assign(configuration.constants.base, token)
    return configuration.constants.base
}

const setV5Header = (token) => {
    if (token) return Object.assign(configuration.constants.apiV5.base, token)
    return configuration.constants.apiV5.base
}

const setRefreshToken = async () => {
    configuration.config.smartTokenManagement = true
    setInterval(() => {
        getToken()
    }, configuration.constants.timeOutRefreshToken)
}

const autoSetMultipleGarageDoorDevices = async () => {
    const device = await getDevices()

    configuration.config.multipleDevices = true

    device.Devices.forEach(element => {
        const id = element.MyQDeviceTypeId
        if (id === 7 || id === 17 || id === 5) addDeviceToList(element)
    })
}

const autoSetSingleGarageDevice = async () => {
    const device = await getDevices()
    device.Devices.forEach(element => {
        const id = element.MyQDeviceTypeId
        if (id === 7 || id === 17 || id === 5) configuration.config.deviceId = element.MyQDeviceId
    })
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
        const deviceCall = bent(type, configuration.constants.json)
        const response = await deviceCall(options.url, options.body, options.headers)
        resolve(response)
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

        options.url = configuration.constants.baseUrl + configuration.constants.validateUrl
        options.headers = setV4Header()
        options.body = {}
        options.body.password = configuration.config.password
        options.body.username = configuration.config.user

        const data = await callMyQDevice(options, configuration.constants.POST)

        if (data.SecurityToken === undefined) reject(data.ErrorMessage)

        configuration.token = data.SecurityToken
        configuration.tokenTimeStamp = new Date()

        resolve(data.SecurityToken)

    }).catch(error => reject(error))
}

const getDevices = async () => {
    return new Promise(async (resolve, reject) => {
        const token = await getToken()
        const options = {}

        options.url = configuration.constants.baseUrl + configuration.constants.devicesUrl
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

        options.url = configuration.constants.baseUrl + configuration.constants.stateUrlFront + id + configuration.constants.doorStateUrlEnd
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

        options.url = configuration.constants.baseUrl + configuration.constants.changeDeviceStateUrl
        options.headers = setV4Header({ SecurityToken: token })
        options.body = {}
        options.body.attributeName = configuration.constants.desiredDoorState
        options.body.AttributeValue = configuration.constants.types[change]
        options.body.myQDeviceId = deviceId

        const data = await callMyQDevice(options, configuration.constants.PUT)

        resolve(data)

    }).catch(error => reject(error))
}

const getLightState = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        const id = deviceId ? deviceId : configuration.config.deviceId
        const token = await getToken()
        const options = {}

        options.url = configuration.constants.baseUrl + configuration.constants.stateUrlFront + id + configuration.constants.lightStateUrlEnd
        options.headers = setV4Header({ SecurityToken: token })

        const lightState = await callMyQDevice(options, configuration.constants.GET)
        const lightStatus = configuration.constants.lightState[Number(lightState.AttributeValue)]

        resolve(lightStatus)

    }).catch(error => reject(error))
}

const setLightState = async (desiredState, deviceId) => {
    return new Promise(async (resolve, reject) => {
        const id = deviceId ? deviceId : configuration.config.deviceId
        const token = await getToken()
        const options = {}

        options.url = configuration.constants.baseUrl + configuration.constants.changeDeviceStateUrl
        options.headers = setV4Header({ SecurityToken: token })
        options.body = {}
        options.body.attributeName = configuration.constants.desiredLightState
        options.body.AttributeValue = configuration.constants.lightState[desiredState]
        options.body.myQDeviceId = id

        const lightState = await callMyQDevice(options, configuration.constants.PUT)

        resolve(lightState)

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

const checkApiVersion = async () => {
    const apiV4 = await apiV4Check()
    const apiV5 = await apiV5Check()

    if (apiV4 && apiV5) configuration.defaultApiVersion = 5
    if (apiV4 && !apiV5) configuration.defaultApiVersion = 4
    if (!apiV4 && !apiv5) throw new Error(configuration.constants.emailError)
}

const apiV4Check = async () => {
    return new Promise(async (resolve, reject) => {
        const options = {}

        options.url = configuration.constants.baseUrl + configuration.constants.validateUrl
        options.headers = setV4Header()
        options.body = {}
        options.body.password = configuration.config.password
        options.body.username = configuration.config.user

        await callMyQDevice(options, configuration.constants.POST)

        resolve(true)

    }).catch(error => reject(false))
}

const apiV5Check = async () => {
    return new Promise(async (resolve, reject) => {
        const options = {}

        options.url = configuration.constants.apiV5.loginUrl
        options.headers = setV5Header()
        options.body = {}
        options.body.password = configuration.config.password
        options.body.username = configuration.config.user

        const data = await callMyQDevice(options, configuration.constants.POST)

        if (data.SecurityToken === undefined) reject(false)

        resolve(true)

    }).catch(error => reject(false))
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
