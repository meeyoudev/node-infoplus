
const events = require('events');

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

    constructor({ appId, appSecret, workflow }) {

        this.getThis = () => this;
        this.appId = appId;
        this.appSecret = appSecret;
        this.workflow = workflow;
        this.eventHandler = {};
        this.defaultHandler = async (event, data) => ({});

    }

    getAccessToken() {

    }

    startInstance() {
        // TODO
    }

    doAction() {
        // TODO
    }

    async onRequest(payload) {

        const { version, event, data } = payload;
        const body = JSON.parse(data);
        const handler = this.eventHandler[event] || this.defaultHandler;

        return await handler(event, data);

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
