import Router from 'koa-router';
import User from '../../../models/User';
import tools from '../../../config/tools';
import gravatar from 'gravatar';
import jwt from 'jsonwebtoken';
import { secretOrKey } from '../../../config/keys';
import passport from 'koa-passport';
// 验证模块
import validateRegisterInput from '../../../validation/register';
import validateLoginInput from '../../../validation/login';

const router = new Router();

/**
 * @route Get api/v1/users/test
 * @desc 测试接口地址
 * @access 接口是公开的
 */
router.get('/test', async ctx => {
    ctx.status = 200;
    ctx.body = {
        msg: 'user works...'
    };
});

/**
 * @route Post api/v1/users/register
 * @desc 注册接口地址
 * @access 接口是公开的
 */
router.post('/register', async ctx => {
    const { username, password, email } = ctx.request.body;
    // 验证
    const { errs, isValid } = validateRegisterInput(ctx.request.body);
    if (!isValid) {
        ctx.status = 400;
        ctx.body = {
            data: 'error',
            meta: {
                error: errs,
                status: 400
            }
        };
        return;
    }
    
    /** @type {string[]} findResultEmail */
    const findResultEmail = await User.find({ email });
    /** @type {string[]} findResultUsername */
    const findResultUsername = await User.find({ username });
    if (findResultEmail.length > 0) {
        ctx.status = 422;
        ctx.body = {
            data: 'error',
            meta: {
                error: {
                    email: '邮箱已被占用'
                },
                status: 422
            }
        };
    } else if (findResultUsername.length > 0) {
        ctx.status = 422;
        ctx.body = {
            data: 'error',
            meta: {
                error: {
                    email: '用户名已被占用'
                },
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
                                 msg: {
                                     error: '未知错误'
                                 },
                                 status: 500
                             }
                         };
                     });
    }
});

/**
 * @route POST api/v1/users/login
 * @desc 登录接口地址  返回token
 * @access 接口是公开的
 */
router.post('/login', async ctx => {
    const { username, password, email } = ctx.request.body;
    
    // 验证
    const { errs, isValid } = validateLoginInput(ctx.request.body);
    if (!isValid) {
        ctx.status = 400;
        ctx.body = {
            data: 'error',
            meta: {
                error: errs,
                status: 400
            }
        };
        return;
    }
    
    // 查询
    const searchQuery = tools.initSearchQuery(username, email);
    /** @type {Object[]} findResult */
    const findResult = await User.find(searchQuery);
    const user = findResult[0];
    if (findResult.length === 0) {
        ctx.status = 404;
        ctx.body = {
            data: 'error',
            meta: {
                msg: {
                    error: '未查询到用户'
                },
                status: 404
            }
        };
    } else {
        // 验证密码
        const result = tools.checkPassword(password, user.password);
        if (result) {
            // 验证通过
            const payLoad = {
                _id: user._id,
                name: user.username,
                avatar: user.avatar
            };
            const token = jwt.sign(payLoad, secretOrKey, { expiresIn: 3600 * 24 });
            
            ctx.status = 200;
            ctx.body = {
                data: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    token: 'Bearer ' + token
                },
                meta: {
                    msg: '登录成功',
                    status: 200
                }
            };
        } else {
            ctx.status = 403;
            ctx.body = {
                data: 'error',
                meta: {
                    msg: {
                        error: '密码错误'
                    },
                    status: 403
                }
            };
        }
    }
});

/**
 * @route Get api/v1/users/current
 * @desc 用户信息接口地址  返回用户信息
 * @access 接口是私密的
 */
router.get('/current', passport.authenticate('jwt', { session: false }), async ctx => {
    const { _id, username, email, avatar } = ctx.state.user;
    ctx.status = 200;
    ctx.body = {
        data: { _id, username, email, avatar },
        meta: {
            msg: '验证成功',
            status: 200
        }
    };
});

export default router.routes();