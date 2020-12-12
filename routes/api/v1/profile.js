import Router from 'koa-router';
import passport from 'koa-passport';

// 引入模板实例
import Profile from '../../../models/Profile';

const router = new Router();

/**
 * @route Get api/v1/profile/test
 * @desc 测试接口地址
 * @access 接口是公开的
 */
router.get('/test', async ctx => {
    ctx.status = 200;
    ctx.body = {
        msg: 'profile works...'
    };
});

/**
 * @route Get api/v1/profile
 * @desc 个人信息接口地址
 * @access 接口是私有的
 */
router.get('/', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id, username, email, avatar } = ctx.state.user;
    // 跨表查询
    /** @type {Object[]} profile */
    const profile = await Profile.find({ user: id }).populate('user', [username, avatar]);
    if (profile.length > 0) {
        ctx.status = 200;
        ctx.body = {
            data: profile,
            meta: {
                msg: '查询成功',
                status: 200
            }
        };
    } else {
        ctx.status = 404;
        ctx.body = {
            data: 'NOT FOUND',
            meta: {
                error: '该用户没有任何相关信息',
                status: 404
            }
        };
        return;
    }
});

export default router.routes();