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

const v4Api = require('./v4/v4-api')
const v5Api = require('./v5/v5-api')
const configuration = require('./config')

let api = v4Api

const setCredentials = async (user, password, options) => {
    if (!user) throw new Error(configuration.constants.emailError)
    if (!password) throw new Error(configuration.constants.passwordError)

    configuration.config.user = user
    configuration.config.password = password

    if (options.deviceId) configuration.config.deviceId = options.deviceId
    if (options.apiVersion) options.apiVersion != 5 && options.apiVersion != 4 ? api = v4Api : configuration.defaultApiVersion = options.apiVersion
    if (options.apiVersion === 4) api = v4Api
    else api = v5Api
    if (options.autoSetGarageDoorDevice) autoSetSingleGarageDevice()
    if (options.autoSetMultipleGarageDoorDevices) autoSetMultipleGarageDoorDevices()
    if (options.smartTokenManagement) setRefreshToken()
}

const setRefreshToken = async () => {
    configuration.config.smartTokenManagement = true
    setInterval(() => {
        api.getToken()
    }, configuration.constants.timeOutRefreshToken)
}

const autoSetMultipleGarageDoorDevices = async () => {
    const device = await api.getDevices()
    const apiVersion5 = configuration.defaultApiVersion === 5

    configuration.config.multipleDevices = true

    if (apiVersion5) {
        device.items.forEach(element => {
            if (element.device_type === configuration.constants.apiV5.deviceTypes.virtualGarageDoorOpener) addDeviceToList(element)

        })
    } else {
        device.Devices.forEach(element => {
            const id = element.MyQDeviceTypeId
            if (id === 7 || id === 17 || id === 5) addDeviceToList(element)
        })
    }
}

const autoSetSingleGarageDevice = async () => {
    const apiVersion5 = configuration.defaultApiVersion === 5
    const device = await api.getDevices()

    if (apiVersion5) {
        device.items.forEach(element => {
            const deviceType = element.device_type
            const serialNumber = element.serial_number
            const deviceUrl = element.href
            const openUrl = element.state.open
            const closeUrl = element.state.close

            if (deviceType === configuration.constants.apiV5.deviceTypes.virtualGarageDoorOpener) {
                configuration.config.deviceSerialNumber = serialNumber
                configuration.config.deviceUrl = deviceUrl
                configuration.config.openUrl = openUrl
                configuration.config.closeUrl = closeUrl
            }
        })
    }
    else {
        device.Devices.forEach(element => {
            const id = element.MyQDeviceTypeId
            if (id === 7 || id === 17 || id === 5) configuration.config.deviceId = element.MyQDeviceId
        })
    }
}

const addDeviceToList = (element) => api.addDeviceToList(element)

const getDevices = async () => await api.getDevices()

const getDoorState = async (deviceId) => await api.getDoorState(deviceId)

const openDoor = async (deviceId) => await api.openDoor(deviceId)

const closeDoor = async (deviceId) => await api.closeDoor(deviceId)

//const detectDoorStateChange = (desiredState, deviceId) => api.detectDoorStateChange(desiredState, deviceId)
const detectDoorStateChange = async (desiredState, deviceId) => await api.detectDoorStateChange(desiredState, deviceId)

const getAutoAddedDevices = async () => await api.getAutoAddedDevices()

const checkAndSetApiVersion = async () => {
    // const apiV4 = await apiV4Check()
    // const apiV5 = await apiV5Check()
    // if (apiV4 && apiV5) {
    //     configuration.defaultApiVersion = 4
    //     api = v4Api
    // }
    // if (apiV4 && !apiV5) {
    //     configuration.defaultApiVersion = 4
    //     api = v4Api
    // }
    // if (!apiV4 && !apiv5) throw new Error(configuration.constants.apiVersionError)
}

const apiV4Check = async () => {
    return new Promise(async (resolve, reject) => {
        const options = {}

        options.url = configuration.constants.apiV4.baseUrl + configuration.constants.apiV4.validateUrl
        options.headers = setV4Header()
        options.body = {}
        options.body.password = configuration.config.password
        options.body.username = configuration.config.user

        const data = await callMyQDevice(options, configuration.constants.POST)

        if (data.SecurityToken === undefined) reject(false)

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
