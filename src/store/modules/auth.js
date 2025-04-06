
const state = () => ({
    token: null,
    user: null,
    lastLogin: null
})

const getters = {
    isAuthenticated: state => !!state.token,
    userRole: state => state.user?.role || 'guest'
}

const mutations = {
}

const actions = {

}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
