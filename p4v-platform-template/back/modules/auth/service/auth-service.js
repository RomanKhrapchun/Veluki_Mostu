const authRepository = require('../repository/auth-repository')
const { redisClientConfig } = require('../../../utils/constants')
const { userAuthenticatedErrorMessage, userAccountNotActivatedErrorMessage, blockedIPNotification } = require("../../../utils/messages")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const sessionStore = require('../../../utils/sessionStore')
const userServise = require('../../user/service/user-service')
const userRepository = require('../../user/repository/user-repository')

class AuthService {

    async login(request) {
        const { username, password } = request.body
        const checkIp = await authRepository.findIp(request.ip)
        if (checkIp.length) {
            throw new Error(blockedIPNotification)
        }
        const secChUa = request.headers['sec-ch-ua'] || 'Not provided'
        const userAgent = request.headers['user-agent'] || 'Not provided'
        const hostname = request.hostname || 'Not provided'

        const userData = await authRepository.findOneUserByName(username)
        
        if (userData.length === 0) {
            await authRepository.insertInfoUser(null, request.ip, hostname, userAgent, secChUa, `Спроба увійти під логіном ${username}`, 'unknown')
            throw new Error(userAuthenticatedErrorMessage)
        }

        if (!userData[0].enabled) {
            throw new Error(userAuthenticatedErrorMessage)
        }

        if (!userData[0].is_active) {
            throw new Error(userAccountNotActivatedErrorMessage)
        }

        const isPasswordEquals = await bcrypt.compare(password, userData[0]['password'])
        if (!isPasswordEquals) {
            await authRepository.insertInfoUser(userData[0].users_id, request.ip, hostname, userAgent, secChUa, `Введено неправильний пароль`, 'error')
            throw new Error(userAuthenticatedErrorMessage)
        }
        await authRepository.insertInfoUser(userData[0].users_id, request.ip, hostname, userAgent, secChUa, `Користувач увійшов в систему`, 'success')
        const sessionId = crypto.randomBytes(16).toString('hex');
        await sessionStore.setSession(sessionId, userData[0].users_id, redisClientConfig.ttl);
  
        if (userData[0]?.['permission']) {
            const notEmptyAccessId = []

            for (const key in userData[0]['permission']) {
                if (userData[0]['permission'][key]?.length > 0) { notEmptyAccessId.push(key) }
            }
            
            const menuData = await userServise.generateMenu()
            menuData.forEach(element => {
                if (element?.children?.length > 0) {
                    element.children = element.children?.filter(obj => {
                        if (notEmptyAccessId.includes(obj?.module_id)) {
                            obj.access = userData[0]['permission'][obj.module_id]
                            return true;
                        }
                    })
                }
            })

            const filterMenu = menuData.filter(el => el?.children?.length > 0)
            return { sessionId, filterMenu, data: userData[0] }
        }
        else {
            return { sessionId, filterMenu: null, data: userData[0] }
        }
    }

    async checkAuth(request, reply) {
        const userData = request.user
        if (userData[0]['permission']) {
            const notEmptyAccessId = []

            for (const key in userData[0]['permission']) {
                if (userData[0]['permission'][key]?.length > 0) { notEmptyAccessId.push(key) }
            }

            const menuData = await userRepository.generateMenu()
            menuData.forEach(element => {
                if (element?.children?.length > 0) {
                    element.children = element.children.filter(obj => {
                        if (notEmptyAccessId.includes(obj?.module_id)) {
                            obj.access = userData[0]['permission'][obj.module_id]
                            return true;
                        }
                    })
                }
            })

            const filterMenu = menuData.filter(el => el?.children?.length > 0)

            return reply.send({
                'fullName': `${userData[0]['last_name']} ${userData[0]['first_name']}`,
                'access_group': filterMenu,
            })
        }
        else {
            return reply.send({
                'fullName': `${userData[0]['last_name']} ${userData[0]['first_name']}`,
                'access_group': null,
            })
        }
    }

}

module.exports = new AuthService();