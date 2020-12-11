const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 5000;

// 路由
router.get('/', async ctx => {
    ctx.body = {
        msg: 'Hello Koa!'
    };
});

// 配置路由
app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
    console.log(`server listening on ${port}`);
});
