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
    const findResult = await User.find({ email });
    if (findResult.length > 0) {
        ctx.status = 500;
        ctx.body = { email: '邮箱已被占用' };
    } else {
        const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });
        const newUser = new User({
            username,
            password: tools.enbcrypt(password),
            email,
            avatar
        });
        
        // 验证密码
        // await bcrypt.genSalt(10, (err, salt) => {
        //     bcrypt.hash(password, salt, (err, encryptPassword) => {
        //         bcrypt.compare(password, encryptPassword, (err, res) => {
        //             console.log(res);
        //         });
        //     });
        // });
        
        // 存储到数据库
        await newUser.save()
                     .then(user => {
                         ctx.status = 200;
                         ctx.body = user;
                     })
                     .catch(() => {
                         ctx.status = 500;
                         ctx.body = { err: '服务器发繁忙' };
                     });
    }
});

export default router.routes();