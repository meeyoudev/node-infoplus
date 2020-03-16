
const events = require('events');
const oauth = require('oauth');
const constants = require('./constants');
const axios = require('axios');

class InfoPlusReponse {

    constructor(opts) {
        this.getThis = () => this;
        const allowed_lists = ['break', 'cancel', 'prompt', 'detail', 'formData', 'codes', 'then'];
        allowed_lists.forEach(e => {
            this[e] = opts[e]
        });
        this.key_lists = allowed_lists;
    }

    static fail(prompt) {
        return new InfoPlusReponse({
            cancel: true,
            'break': true,
            prompt: prompt,
        })
    }

    static fool(prompt) {
        return new InfoPlusReponse({
        })
    }

    getMap() {
        const ret = {};
        this.key_lists.forEach(e => ret[e] = this[e]);
        return ret;
    }

}

class InfoPlusService {

    constructor({ appId, appSecret, workflow, end_point, domain, debug }) {

        this.getThis = () => this;
        this.appId = appId;
        this.appSecret = appSecret;
        this.workflow = workflow;
        this.eventHandler = {};
        this.defaultHandler = async (event, data) => ({});
        this.domain = domain;
        this.end_point = end_point;

        this.oauth2 = new oauth.OAuth2(
            `${this.workflow}@${this.domain}`,
            this.appSecret,
            this.end_point,
            '/oauth2/authorize',
            '/oauth2/token',
            null
        );

        this.http = axios.create({
            baseURL: `${this.end_point}${debug ? constants.API_PREFIX_DEBUG : constants.API_PREFIX}`,
            timeout: 5000,
            header: {
                'Content-Type': 'application/json'
            }
        })

    }

    getAccessToken(scope = constants.SCOPE_START_PROCESS) {
        return new Promise((resolve, reject) => {
            this.oauth2.getOAuthAccessToken(
                '', {
                    grant_type: 'client_credentials',
                    scope
                }, (e, access_token, refresh_token, results) => {
                    resolve({
                        e: e,
                        access_token: access_token,
                        refresh_token: refresh_token,
                        results: results
                    });
                }
            );
        });
    }

    async startInstance({
        userId,
        assignTo,
        secureURIExpire,
        code,
        entrance,
        businessId,
        data
    }) {
        // TODO

        const body = {
            userId,
            assignTo,
            secureURIExpire,
            code,
            entrance,
            businessId,
            data
        };
        const keys = Object.keys(body);
        keys.forEach(e => {
            if (body[e] === undefined) {
                delete body[e]
            }
        });
        const accessToken = await this.getAccessToken(constants.SCOPE_START_PROCESS);
        return await this.http.put(`/process`, undefined, {
            headers: {
                'Authorization': `Bearer ${accessToken.access_token}`
            },
            params: body
        });
    }

    async doAction({
        id,
        action = 'submit',
        rating,
        remark,
        stepCode,
        actionCode,
        nextSteps,
        nextUsers,
        splitPath,
        thing,
        priority
    }) {
        // TODO
        const body = {
            action,
            rating,
            remark,
            stepCode,
            actionCode,
            nextSteps,
            nextUsers,
            splitPath,
            thing,
            priority
        };
        const keys = Object.keys(body);
        keys.forEach(e => {
            if (body[e] === undefined) {
                delete body[e]
            }
        });
        const accessToken = await this.getAccessToken(constants.SCOPE_PROCESS_EDIT);
        return await this.http.post(`/process/${id}`, undefined, {
            headers: {
                'Authorization': `Bearer ${accessToken.access_token}`
            },
            params: body
        });
    }

    async onRequest(payload) {

        const { version, event, data } = payload;
        const body = JSON.parse(data);
        const handler = this.eventHandler[event] || this.defaultHandler;

        return await handler(event, body);

    }

    subscribe(event, handler) {
        this.eventHandler[event] = handler;
    }

    setDefaultHandler(handler) {
        this.defaultHandler = handler;
    }

}

module.exports = InfoPlusService;
module.exports.InfoPlusReponse = InfoPlusReponse;
