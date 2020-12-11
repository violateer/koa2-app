import Koa from 'koa';
import Router from 'koa-router';
import mongoose from 'mongoose';
import serverIp from './config/serverIp';
import users from './routes/api/v1/users';

// 连接数据库
mongoose
    .connect(serverIp, { 'useNewUrlParser': true, 'useUnifiedTopology': true })
    .then(() => {
        console.log('MongoDb Connected');
    })
    .catch(err => {
        console.log(err);
    });

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 5000;

// 配置路由地址
router.use('/api/v1/users', users);

// 配置路由
app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
    console.log(`server listening on ${port}`);
});
