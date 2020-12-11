import Koa from 'koa';
import Router from 'koa-router';
import mongoose from 'mongoose';

// 连接数据库
mongoose
    .connect('mongodb://47.101.61.134:27017', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDb Connected');
    })
    .catch(err => {
        console.log(err);
    });

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
