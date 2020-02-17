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
const configuration = require('./config')

const setCredentials = async (user, password, options) => {
    if (!user) throw new Error(configuration.constants.emailError)
    if (!password) throw new Error(configuration.constants.passwordError)

    configuration.config.user = user
    configuration.config.password = password

    if (options.deviceId) configuration.config.deviceId = options.deviceId
    if (options.apiVersion) options.apiVersion != 5 && options.apiVersion != 4 ? configuration.defaultApiVersion = 4 : configuration.defaultApiVersion = options.apiVersion
    else await checkAndSetApiVersion()
    if (options.autoSetGarageDoorDevice) autoSetSingleGarageDevice()
    if (options.autoSetMultipleGarageDoorDevices) autoSetMultipleGarageDoorDevices()
    if (options.smartTokenManagement) setRefreshToken()
}

const setV4Header = (token) => {
    if (token) return Object.assign(configuration.constants.apiV4.base, token)
    return configuration.constants.apiV4.base
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
    const device = await getDevices()

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

const addDeviceToList = (element) => {
    const apiVersion5 = configuration.defaultApiVersion === 5
    const device = {}

    if (apiVersion5) return configuration.devices.push(element)

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
        const apiVersion5 = configuration.defaultApiVersion === 5
        const options = {}
        const tenMinutes = 10 * 60 * 1000
        const timeStamp = new Date()
        const configTimeStamp = configuration.tokenTimeStamp
        const smartTokenManagement = configuration.config.smartTokenManagement

        if (configTimeStamp && smartTokenManagement && timeStamp - configTimeStamp < tenMinutes) resolve(configuration.token)

        options.url = apiVersion5 === true ? configuration.constants.apiV5.loginUrl : configuration.constants.apiV4.logIn
        options.headers = apiVersion5 === true ? setV5Header() : setV4Header()
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
        const apiVersion5 = configuration.defaultApiVersion === 5
        const token = await getToken()
        const options = {}
        let accountId

        if (apiVersion5) accountId = await getAccountId()

        options.url = apiVersion5 === true ? configuration.constants.apiV5.getDevices + accountId + configuration.constants.apiV5.getDevicesSubUrl : configuration.constants.apiV4.getDevices
        options.headers = apiVersion5 === true ? setV5Header({ SecurityToken: token }) : setV4Header({ SecurityToken: token })

        const deviceList = await callMyQDevice(options, configuration.constants.GET)
        //console.log(deviceList)
        resolve(deviceList)
    })
}

const apiV5CallDevice = async (options, type, code) => {
    return new Promise(async (resolve, reject) => {
        request['get'](options, function (error, response, body) {
            const data = JSON.parse(body)
            const devices = data.Items
            configuration.config.accountId = devices[0].Id
            resolve(devices[0].Id)
        })
    })
}

const getAccountId = async () => {
    return new Promise(async (resolve, reject) => {
        const token = await getToken()
        const options = {}

        options.url = configuration.constants.apiV5.getAccounts
        options.headers = setV5Header({ SecurityToken: token })

        const accountId = await apiV5CallDevice(options, configuration.constants.GET)

        configuration.config.accountId = accountId

        resolve(accountId)
    })
}

const getDoorState = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        const apiVersion5 = configuration.defaultApiVersion === 5
        const id = deviceId ? deviceId : configuration.config.deviceId
        const token = await getToken()
        const options = {}
        let url = configuration.config.deviceUrl

        if (deviceId && apiVersion5) url = configuration.constants.apiV5.getAccounts + configuration.config.accountId + configuration.constants.apiV5.devicesSub + deviceId

        options.url = apiVersion5 === true ? url : configuration.constants.apiV4.baseUrl + configuration.constants.apiV4.stateUrlFront + id + configuration.constants.apiV4.doorStateUrlEnd
        options.headers = apiVersion5 === true ? setV5Header({ SecurityToken: token }) : setV4Header({ SecurityToken: token })

        let deviceState = await callMyQDevice(options, configuration.constants.GET)

        if (deviceState.Message === configuration.constants.invalidRequest) reject(configuration.constants.invalidDeviceId)

        if (apiVersion5) deviceState = deviceState.state.door_state

        const doorStatus = apiVersion5 ? deviceState : configuration.constants.doorStates[Number(deviceState.AttributeValue)]

        resolve(doorStatus)
    })
}

const openDoor = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        const id = deviceId ? deviceId : configuration.config.deviceId
        const data = await setDoorState(configuration.constants.open, id)
        resolve(data)
    })
}

const closeDoor = async (deviceId) => {
    return new Promise(async (resolve, reject) => {
        const id = deviceId ? deviceId : configuration.config.deviceId
        const data = await setDoorState(configuration.constants.close, id)
        resolve(data)
    })
}

const setDoorState = async (change, deviceId) => {
    console.log(deviceId)
    return new Promise(async (resolve, reject) => {
        const apiVersion5 = configuration.defaultApiVersion === 5
        let serialNumber = configuration.config.deviceSerialNumber
        const accountId = configuration.config.accountId
        const token = await getToken()
        const options = {}

        if (!apiVersion5) {
            options.url = configuration.constants.apiV4.baseUrl + configuration.constants.apiV4.changeDeviceStateUrl
            options.headers = setV4Header({ SecurityToken: token })
            options.body = {}
            options.body.attributeName = configuration.constants.desiredDoorState
            options.body.AttributeValue = configuration.constants.types[change]
            options.body.myQDeviceId = deviceId
        }
        else {
            serialNumber = deviceId ? deviceId : serialNumber

            options.url = configuration.constants.apiV5.getAccounts + accountId + configuration.constants.apiV5.devicesSub + serialNumber + configuration.constants.apiV5.actions
            options.headers = {}
            options.headers[configuration.constants.contentType] = configuration.constants.apiV5.base.contentType
            options.headers.SecurityToken = token
            options.headers.MyQApplicationId = configuration.constants.apiV5.base.MyQApplicationId
            options.headers.Culture = configuration.constants.apiV5.base.Culture
            options.body = {}
            options.body.action_type = change
        }

        const data = await callMyQDevice(options, configuration.constants.PUT)

        if (data && data.code === configuration.constants.apiV5.errorCodes.NotFound) reject(data)
        if (data && data.ReturnCode === configuration.constants.apiV4.errorCodes.ErrorProcessingRequest) reject(data)

        resolve(data)
    })
}

const detectDoorStateChange = async (desiredState, deviceId) => {
    return new Promise(async (resolve, reject) => {
        const apiVersion5 = configuration.defaultApiVersion === 5
        let stop = false
        const timeStamp = new Date()
        const thirtySeconds = 1 * 30 * 1000

        if (apiVersion5 && desiredState != configuration.constants.apiV5.closed) desiredState = configuration.constants.apiV5.open

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

const checkAndSetApiVersion = async () => {
    const apiV4 = await apiV4Check()
    const apiV5 = await apiV5Check()
    if (apiV4 && apiV5) configuration.defaultApiVersion = 4
    if (apiV4 && !apiV5) configuration.defaultApiVersion = 4
    if (!apiV4 && !apiv5) throw new Error(configuration.constants.apiVersionError)
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
