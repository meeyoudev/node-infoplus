
const Koa = require('koa');
const bodyParser = require('koa-body');
const infoplus = require('.');
const KoaInfoPlus = require('./koa-infoplus');

const service = new infoplus.InfoPlusService(
    {
        appId: '',
        appSecret: '',
        workflow: '',
    }
);

service.setDefaultHandler(async (event, data) => {
    console.log(event);
    return infoplus.InfoPlusReponse.fool().getMap();
});

service.subscribe('STEP_RENDERING', async (event, data) => {
    return {
        cancel: false,
        break: false,
        prompt: '',
        detail: '',
        codes: [
        ]
    };
});

const app = new Koa();

// Set middlewares
app.use(
    bodyParser({
        multipart: true,
        formLimit: '10mb',
        jsonLimit: '10mb'
    })
);

app.use(KoaInfoPlus(service));

app.listen('8080');
