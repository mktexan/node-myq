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

const setCredentials = (user, password, options) => {
    if (!user) throw new Error(configuration.constants.emailError)
    if (!password) throw new Error(configuration.constants.passwordError)

    configuration.config.user = user
    configuration.config.password = password

    if (options.deviceId) configuration.config.deviceId = options.deviceId
    if (options.apiVersion && options.apiVersion === 5) api = v5Api
    if (options.autoSetGarageDoorDevice) api.autoSetSingleGarageDevice()
    if (options.autoSetMultipleGarageDoorDevices) api.autoSetMultipleGarageDoorDevices()
    if (options.smartTokenManagement) api.setRefreshToken()
}

const getDevices = () => api.getDevices()

const getDoorState = (deviceId) => api.getDoorState(deviceId)

const openDoor = (deviceId) => api.openDoor(deviceId)

const closeDoor = (deviceId) => api.closeDoor(deviceId)

const detectDoorStateChange = (desiredState, deviceId) => api.detectDoorStateChange(desiredState, deviceId)

const getAutoAddedDevices = () => api.getAutoAddedDevices()

exports.getAutoAddedDevices = getAutoAddedDevices
exports.setCredentials = setCredentials
exports.detectDoorStateChange = detectDoorStateChange
exports.getDevices = getDevices
exports.getDoorState = getDoorState
exports.openDoor = openDoor
exports.closeDoor = closeDoor
