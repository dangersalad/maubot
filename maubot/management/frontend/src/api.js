// maubot - A plugin-based Matrix bot system.
// Copyright (C) 2018 Tulir Asokan
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export const BASE_PATH = "/_matrix/maubot/v1"

function getHeaders(contentType = "application/json") {
    return {
        "Content-Type": contentType,
        "Authorization": `Bearer ${localStorage.accessToken}`,
    }
}

async function defaultDelete(type, id) {
    const resp = await fetch(`${BASE_PATH}/${type}/${id}`, {
        headers: getHeaders(),
        method: "DELETE",
    })
    if (resp.status === 204) {
        return {
            "success": true,
        }
    }
    return await resp.json()
}

async function defaultPut(type, entry, id = undefined) {
    const resp = await fetch(`${BASE_PATH}/${type}/${id || entry.id}`, {
        headers: getHeaders(),
        body: JSON.stringify(entry),
        method: "PUT",
    })
    return await resp.json()
}

async function defaultGet(url) {
    const resp = await fetch(`${BASE_PATH}/${url}`, { headers: getHeaders() })
    return await resp.json()
}

export async function login(username, password) {
    const resp = await fetch(`${BASE_PATH}/auth/login`, {
        method: "POST",
        body: JSON.stringify({
            username,
            password,
        }),
    })
    return await resp.json()
}

export async function ping() {
    const response = await fetch(`${BASE_PATH}/auth/ping`, {
        method: "POST",
        headers: getHeaders(),
    })
    const json = await response.json()
    if (json.username) {
        return json.username
    } else if (json.errcode === "auth_token_missing" || json.errcode === "auth_token_invalid") {
        return null
    }
    throw json
}

export const getInstances = () => defaultGet("/instances")
export const getInstance = id => defaultGet(`/instance/${id}`)
export const putInstance = (instance, id) => defaultPut("instance", instance, id)
export const deleteInstance = id => defaultDelete("instance", id)

export const getPlugins = () => defaultGet("/plugins")
export const getPlugin = id => defaultGet(`/plugin/${id}`)
export const deletePlugin = id => defaultDelete("plugin", id)

export async function uploadPlugin(data, id) {
    let resp
    if (id) {
        resp = await fetch(`${BASE_PATH}/plugin/${id}`, {
            headers: getHeaders("application/zip"),
            body: data,
            method: "PUT",
        })
    } else {
        resp = await fetch(`${BASE_PATH}/plugins/upload`, {
            headers: getHeaders("application/zip"),
            body: data,
            method: "POST",
        })
    }
    return await resp.json()
}

export const getClients = () => defaultGet("/clients")
export const getClient = id => defaultGet(`/clients/${id}`)

export async function uploadAvatar(id, data, mime) {
    const resp = await fetch(`${BASE_PATH}/client/${id}/avatar`, {
        headers: getHeaders(mime),
        body: data,
        method: "POST",
    })
    return await resp.json()
}

export function getAvatarURL(id) {
    return `${BASE_PATH}/client/${id}/avatar?access_token=${localStorage.accessToken}`
}

export const putClient = client => defaultPut("client", client)
export const deleteClient = id => defaultDelete("client", id)

export default {
    BASE_PATH,
    login, ping,
    getInstances, getInstance, putInstance, deleteInstance,
    getPlugins, getPlugin, uploadPlugin, deletePlugin,
    getClients, getClient, uploadAvatar, getAvatarURL, putClient, deleteClient,
}
