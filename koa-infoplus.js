
const { InfoPlusReponse } = require('./service');

function create(service, opts = {}) {

    return async function (ctx, next) {

        const { header, method } = ctx.request;

        const fail = prompt => ctx.body = InfoPlusReponse.fail(prompt).getMap();

        if (method !== 'POST') {
            return;
        }

        if (!opts.noAuth) {

            const [authType, authData] = (header.authorization || 'none none').split((' '));
            if (authType !== 'Basic') {
                return fail(`Auth type is not supported [${authType}]`);
            }

            const decryptedData = Buffer.from(authData, 'base64').toString();

            const [code, domain, secret] = decryptedData.split(/:|@/);

            if (secret !== service.appSecret) {
                return fail('Bad secret');
            }
        }

        ctx.body = await service.onRequest(ctx.request.body);

    }

}

module.exports = create;
