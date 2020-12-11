import Router from 'koa-router';
import User from '../../../modules/User';
import tools from '../../../config/tools';
import gravatar from 'gravatar';

const router = new Router();

/**
 * @route Get api/v1/users/test
 * @desc 测试接口地址
 * @assec 接口是公开的
 */
router.get('/test', async ctx => {
    ctx.status = 200;
    ctx.body = {
        msg: 'test works...'
    };
});

/**
 * @route Post api/v1/users/register
 * @desc 注册接口地址
 * @assec 接口是公开的
 */
router.post('/register', async ctx => {
    const { username, password, email } = ctx.request.body;
    /** @type {string[]} findResult */
    const findResult = await User.find({ email });
    if (findResult.length > 0) {
        ctx.status = 422;
        ctx.body = {
            data: 'error',
            meta: {
                msg: '邮箱已被占用',
                status: 422
            }
        };
    } else {
        const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });
        const newUser = new User({
            username,
            password: tools.enbcrypt(password),
            email,
            avatar
        });
        
        // 存储到数据库
        await newUser.save()
                     .then(user => {
                         ctx.status = 200;
                         ctx.body = {
                             data: user,
                             meta: {
                                 msg: '注册成功',
                                 status: 200
                             }
                         };
                     })
                     .catch(() => {
                         ctx.status = 500;
                         ctx.body = {
                             data: 'error',
                             meta: {
                                 msg: '未知错误',
                                 status: 500
                             }
                         };
                     });
    }
});

/**
 * @route POST api/v1/users/login
 * @desc 登录接口地址  返回token
 * @assec 接口是公开的
 */
router.post('/login', async ctx => {
    const { username, password, email } = ctx.request.body;
    // 查询
    /** @type {Object[]} findResult */
    const findResult = await User.find({ email });
    const user = findResult[0];
    if (findResult.length === 0) {
        ctx.status = 404;
        ctx.body = {
            meta: {
                data: 'error',
                msg: '用户不存在',
                status: 404
            }
        };
    } else {
        // 验证密码
        const result = tools.checkPassword(password, user.password);
        if (result) {
            ctx.status = 200;
            ctx.body = { success: true };
        } else {
            ctx.status = 403;
            ctx.body = {
                data: 'error',
                meta: {
                    msg: '密码错误',
                    status: 403
                }
            };
        }
    }
});

export default router.routes();