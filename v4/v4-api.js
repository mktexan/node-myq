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

const request = require('request')
const configuration = require('../config')

const setV4Header = (token) => token ? Object.assign(configuration.constants.apiV4.base, token) : configuration.constants.apiV4.base

const autoSetMultipleGarageDoorDevices = async () => {
    const device = await api.getDevices()

    configuration.config.multipleDevices = true

    device.Devices.forEach(element => {
        const id = element.MyQDeviceTypeId
        if (id === 7 || id === 17 || id === 5) addDeviceToList(element)
    })
}

const setRefreshToken = async () => {
    configuration.config.smartTokenManagement = true
    setInterval(() => {
        getToken()
    }, configuration.constants.timeOutRefreshToken)
}


const addDeviceToList = (element) => {
    const device = {}

    device.MyQDeviceId = element.MyQDeviceId
    device.MyQDeviceTypeId = element.MyQDeviceTypeId
    device.MyQDeviceTypeName = element.MyQDeviceTypeName

    configuration.devices.push(device)
}

const autoSetSingleGarageDevice = async () => {
    const device = await getDevices()

    device.Devices.forEach(element => {
        const id = element.MyQDeviceTypeId
        if (id === 7 || id === 17 || id === 5) configuration.config.deviceId = element.MyQDeviceId
    })
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
    })
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
    })
}

const openDoor = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        const id = deviceId ? deviceId : configuration.config.deviceId
        const data = await setDoorState(configuration.constants.open, id)

        if (data.ErrorMessage != configuration.constants.emptyString) reject(data.ErrorMessage)

        resolve(data)
    })
}

const closeDoor = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        const id = deviceId ? deviceId : configuration.config.deviceId
        const data = await setDoorState(configuration.constants.close, id)

        if (data.ErrorMessage) reject(data.ErrorMessage)

        resolve(data)
    })
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
    })
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
    })
}

const getAutoAddedDevices = async () => {
    return new Promise((resolve, reject) => {
        const list = configuration.devices
        resolve(list)
    })
}

const pause = async () => {
    return new Promise(resolve => setTimeout(() => { resolve() }, 2000)).catch(error => reject(error))
}

exports.setRefreshToken = setRefreshToken
exports.autoSetMultipleGarageDoorDevices = autoSetMultipleGarageDoorDevices
exports.autoSetSingleGarageDevice = autoSetSingleGarageDevice
exports.setDoorState = setDoorState
exports.getToken = getToken
exports.addDeviceToList = addDeviceToList
exports.getAutoAddedDevices = getAutoAddedDevices
exports.detectDoorStateChange = detectDoorStateChange
exports.getDevices = getDevices
exports.getDoorState = getDoorState
exports.openDoor = openDoor
exports.closeDoor = closeDoor
