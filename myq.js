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
    if (options.apiVersion && options.apiVersion === 5) api = v5Api
    else api = v4Api
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

const getDevices = () => api.getDevices()

const getDoorState = (deviceId) => api.getDoorState(deviceId)

const openDoor = (deviceId) => api.openDoor(deviceId)

const closeDoor = (deviceId) => api.closeDoor(deviceId)

//const detectDoorStateChange = (desiredState, deviceId) => api.detectDoorStateChange(desiredState, deviceId)
const detectDoorStateChange = (desiredState, deviceId) => api.detectDoorStateChange(desiredState, deviceId)

const getAutoAddedDevices = () => api.getAutoAddedDevices()

exports.getAutoAddedDevices = getAutoAddedDevices
exports.setCredentials = setCredentials
exports.detectDoorStateChange = detectDoorStateChange
exports.getDevices = getDevices
exports.getDoorState = getDoorState
exports.openDoor = openDoor
exports.closeDoor = closeDoor
