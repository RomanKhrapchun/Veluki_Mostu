const authRepository = require("../modules/auth/repository/auth-repository");
const userServise = require('../modules/user/service/user-service')
const { authErrorMessage, permissionErrorMessage } = require("../utils/messages");
const sessionStore = require("../utils/sessionStore");

const AuthGuard = async (request, reply) => {
    const sessionId = request.cookies['session'];
    if (!sessionId) {
        return reply.status(401).send({ "error": true, message: authErrorMessage })
    }
    const userId = await sessionStore.getSession(sessionId);
    if (!userId) {
        return reply.status(401).send({ "error": true, message: authErrorMessage })
    }
    const checkIp = await authRepository.findIp(request.ip)
    if (checkIp.length) {
        return reply.status(401).send({ "error": true, message: authErrorMessage })
    }
    const user = await authRepository.getUserById(userId);
    if (!user.length) {
        return reply.status(401).send({ "error": true, message: authErrorMessage })
    }

    if (!user[0].enabled) {
        return reply.status(401).send({ "error": true, message: authErrorMessage })
    }
    request.user = user;
}

const RouterGuard = (param) => {

    return async (request, reply) => {
        const sessionId = request.cookies['session'];
        if (!sessionId) {
            return reply.status(401).send({ "error": true, message: authErrorMessage })
        }
        const userId = await sessionStore.getSession(sessionId);
        if (!userId) {
            return reply.status(401).send({ "error": true, message: authErrorMessage })
        }
        const checkIp = await authRepository.findIp(request.ip)
        if (checkIp.length) {
            return reply.status(401).send({ "error": true, message: authErrorMessage })
        }
        const userRoles = await authRepository.getUserById(userId)
        if (!userRoles.length) {
            return reply.status(401).send({ "error": true, message: authErrorMessage })
        }

        if (!userRoles[0].is_active) {
            return reply.status(401).send({ "error": true, message: authErrorMessage })
        }

        if (!userRoles[0].enabled) {
            return reply.status(401).send({ "error": true, message: authErrorMessage })
        }

        request.user = { 'username': userRoles[0]['username'], 'id': userRoles[0]['users_id'] }
        if (!param) {
            return
        }

        const menuData = await userServise.generateMenu()
        const userPermissions = userRoles[0].permission
        let haseRole = false;

        if (menuData.length  && (userPermissions && typeof userPermissions === 'object' && Object.keys(userPermissions).length)) {
            const allowedKeys = menuData.flatMap(item => item?.children?.length > 0 ? item.children.map(child => child.key) : []);

            const filteredPermissions = Object.keys(userPermissions)
                .filter(key => allowedKeys.includes(key))
                .reduce((acc, key) => {
                    acc[key] = userPermissions[key];
                    return acc;
                }, {});

            for (const key in filteredPermissions) {
                if (key === param.permissionLevel) {
                    const permission = filteredPermissions[`${key}`]
                    const result = Array.isArray(permission) && permission?.some(el => typeof el === 'string' && el.toUpperCase() === param.permissions?.toUpperCase())
                    if (result) haseRole = true
                    break;
                }
            }
        }

        if (!haseRole) {
            return reply.status(403).send({ "error": true, message: permissionErrorMessage })
        }
    }
}

module.exports = {
    AuthGuard,
    RouterGuard,
};