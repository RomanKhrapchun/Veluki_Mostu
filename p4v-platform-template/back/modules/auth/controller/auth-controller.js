const authService = require("../service/auth-service")
const Logger = require("../../../utils/logger")
const { cookieSettings } = require("../../../utils/constants")
const { logOutMessage } = require('../../../utils/messages')
const sessionStore = require("../../../utils/sessionStore")

class AuthController {

    async login(request, reply) {
        try {
            const result = await authService.login(request)
            reply.cookie('session', result.sessionId, {
                maxAge: cookieSettings.maxAge,
                httpOnly: cookieSettings.httpOnly,
                sameSite: cookieSettings.sameSite,
                secure: cookieSettings.secure,
                path: "/"
            });
            return reply.send({
                'fullName': `${result.data['last_name']} ${result.data['first_name']}`,
                'access_group': result.filterMenu,
            })

        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async logout(request, reply) {
        try {
            await sessionStore.deleteSession(request.cookies['session'])
            reply.clearCookie("session");
            return reply.send(logOutMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async checkAuth(request, reply) {
        try {
            return await authService.checkAuth(request, reply)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

}

module.exports = new AuthController()

