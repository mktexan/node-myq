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

const setV5Header = (token) => token ? Object.assign(configuration.constants.apiV5.base, token) : configuration.constants.apiV5.base

const addDeviceToList = (element) => configuration.devices.push(element)

const openDoor = async (providedSerialNumber) => await setDoorState(configuration.constants.open, providedSerialNumber)

const closeDoor = async (providedSerialNumber) => await setDoorState(configuration.constants.close, providedSerialNumber)

const pause = async () => new Promise(resolve => setTimeout(() => { resolve() }, 2000)).catch(error => reject(error))

const autoSetMultipleGarageDoorDevices = async () => {
    const device = await getDevices()

    configuration.config.multipleDevices = true

    device.items.forEach(element => {
        if (element.device_type === configuration.constants.apiV5.deviceTypes.virtualGarageDoorOpener) addDeviceToList(element)
    })
}

const setRefreshToken = async () => {
    configuration.config.smartTokenManagement = true
    setInterval(() => {
        getToken()
    }, configuration.constants.timeOutRefreshToken)
}

const autoSetSingleGarageDevice = async () => {
    const device = await getDevices()

    device.items.forEach(element => {
        const deviceType = element.device_type

        if (deviceType === configuration.constants.apiV5.deviceTypes.virtualGarageDoorOpener) {
            configuration.config.deviceSerialNumber = element.serial_number
            configuration.config.deviceUrl = element.href
            configuration.config.openUrl = element.state.open
            configuration.config.closeUrl = element.state.close
        }
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

        options.url = configuration.constants.apiV5.loginUrl
        options.headers = setV5Header()
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
        let accountId = await getAccountId()

        options.url = configuration.constants.apiV5.getDevices + accountId + configuration.constants.apiV5.getDevicesSubUrl
        options.headers = setV5Header({ SecurityToken: token })

        const deviceList = await callMyQDevice(options, configuration.constants.GET)

        resolve(deviceList)
    })
}

const getAccountId = async () => {
    return new Promise(async (resolve, reject) => {
        const token = await getToken()
        const options = {}

        options.url = configuration.constants.apiV5.getAccounts
        options.headers = setV5Header({ SecurityToken: token })

        const accountData = await callMyQDevice(options, configuration.constants.GET)
        const devices = accountData.Items

        configuration.config.accountId = devices[0].Id

        resolve(devices[0].Id)
    })
}

const getDoorState = async (serialNumber) => {
    return new Promise(async (resolve, reject) => {
        const token = await getToken()
        const options = {}
        let url = configuration.config.deviceUrl

        if (serialNumber) url = configuration.constants.apiV5.getAccounts + configuration.config.accountId + configuration.constants.apiV5.devicesSub + serialNumber

        options.url = url
        options.headers = setV5Header({ SecurityToken: token })

        let deviceState = await callMyQDevice(options, configuration.constants.GET)

        if (deviceState.Message === configuration.constants.invalidRequest) reject(configuration.constants.invalidSerialNumber)

        const doorStatus = deviceState.state.door_state

        resolve(doorStatus)
    })
}

const setDoorState = async (change, providedSerialNumber) => {
    return new Promise(async (resolve, reject) => {
        let serialNumber = configuration.config.deviceSerialNumber
        const accountId = configuration.config.accountId
        const token = await getToken()
        const options = {}

        serialNumber = providedSerialNumber ? providedSerialNumber : serialNumber

        options.url = configuration.constants.apiV5.getAccounts + accountId + configuration.constants.apiV5.devicesSub + serialNumber + configuration.constants.apiV5.actions
        options.headers = {}
        options.headers[configuration.constants.contentType] = configuration.constants.apiV5.base.contentType
        options.headers.SecurityToken = token
        options.headers.MyQApplicationId = configuration.constants.apiV5.base.MyQApplicationId
        options.headers.Culture = configuration.constants.apiV5.base.Culture
        options.body = {}
        options.body.action_type = change

        const data = await callMyQDevice(options, configuration.constants.PUT)

        if (data && data.code === configuration.constants.apiV5.errorCodes.NotFound) reject(data)
        if (data && data.ReturnCode === configuration.constants.apiV4.errorCodes.ErrorProcessingRequest) reject(data)

        resolve(data)
    })
}

const detectDoorStateChange = async (desiredState, providedSerialNumber) => {
    return new Promise(async (resolve, reject) => {
        let stop = false
        const timeStamp = new Date()
        const thirtySeconds = 1 * 30 * 1000

        if (desiredState != configuration.constants.apiV5.closed) desiredState = configuration.constants.apiV5.open

        while (!stop) {
            await pause()
            const doorState = await getDoorState(providedSerialNumber)
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

exports.setRefreshToken = setRefreshToken
exports.autoSetMultipleGarageDoorDevices = autoSetMultipleGarageDoorDevices
exports.autoSetSingleGarageDevice = autoSetSingleGarageDevice
exports.getAccountId = getAccountId
exports.getToken = getToken
exports.addDeviceToList = addDeviceToList
exports.getAutoAddedDevices = getAutoAddedDevices
exports.detectDoorStateChange = detectDoorStateChange
exports.getDevices = getDevices
exports.getDoorState = getDoorState
exports.openDoor = openDoor
exports.closeDoor = closeDoor
