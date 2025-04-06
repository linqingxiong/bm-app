import * as types from '@/store/types'
import {getSettings, updateSetting} from '@/api/setting'

const state = () => ({
    settingsList: [], // 新增设置列表状态
    theme: 'light',
    error: null,
})

const mutations = {
    // 设置列表更新方法
    [types.APP_SET_SETTINGS](state, settings) {
        state.settingsList = settings
    },
    // 设置项操作
    async [types.APP_ADD_SETTING](state, newSetting) {
        const index = state.settingsList.findIndex(s => s.settingKey === newSetting.settingKey)
        if (index >= 0) {
            // 更新已存在的设置项
            state.settingsList.splice(index, 1, newSetting)
        } else {
            // 添加新设置项
            state.settingsList.push(newSetting)
        }
    },
}

const actions = {
    async loadSettings({ commit }) {
        try {
            const { data } = await getSettings()
            commit(types.APP_SET_SETTINGS, data)
            return data // 返回加载的数据
        } catch (error) {
            console.error('加载设置失败:', error)
            throw error
        }
    },
    async saveSettings({ commit }, settings) {
        commit(types.APP_SET_SETTINGS, settings)
    },
    // 单个设置项操作
    async updateSetting({ commit, state }, setting) {
        try {
            // 先更新本地状态
            commit(types.APP_ADD_SETTING, setting)
            // 同步到后端API
            await updateSetting(setting)

            return state.settingsList.find(s => s.settingKey === setting.settingKey)
        } catch (error) {
            // 回滚本地修改
            const original = state.settingsList.find(s => s.settingKey === setting.settingKey)
            commit(types.APP_ADD_SETTING, original || {settingKey: setting.settingKey})
            throw error
        }
    },
}

const getters = {
    getSettingByKey: (state) => (key) => {
        return state.settingsList.find(s => s.settingKey === key)
    },
    getSettingsList: (state) => {
        return [...state.settingsList]; // 返回新数组避免直接修改源数据
    }
    // 原有getter...
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
