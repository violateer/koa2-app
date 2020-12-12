import Router from 'koa-router';
import passport from 'koa-passport';
// 引入模板实例
import Profile from '../../../models/Profile';
// 引入验证
import validateProfileInput from '../../../validation/profile';

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
    const { id } = ctx.state.user;
    // 跨表查询
    /** @type {Object[]} profile */
    const profile = await Profile.find({ user: id }).populate('user', ['username', 'avatar']);
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

/**
 * @route POST api/v1/profile/test
 * @desc 添加和编辑个人信息接口地址
 * @access 接口是私密的
 */
router.post('/', passport.authenticate('jwt', { session: false }), async ctx => {
    const body = ctx.request.body;
    const { id } = ctx.state.user;
    const { errs, isValid } = validateProfileInput(body);
    // 验证
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
    
    // 生成信息
    const profileFields = {};
    profileFields.user = id;
    if (body.handle) profileFields.handle = body.handle;
    if (body.company) profileFields.company = body.company;
    if (body.website) profileFields.website = body.website;
    if (body.location) profileFields.location = body.location;
    if (body.status) profileFields.status = body.status;
    if (body.bio) profileFields.bio = body.bio;
    if (body.githubusername) profileFields.githubusername = body.githubusername;
    
    // skills 数据转换 "html,css,js,vue"
    if (typeof body.skills !== 'undefined') {
        profileFields.skills = body.skills.split(',');
    }
    
    profileFields.social = {};
    if (body.wechat) profileFields.social.wechat = body.wechat;
    if (body.QQ) profileFields.social.QQ = body.QQ;
    if (body.twitter) profileFields.social.twitter = body.twitter;
    if (body.facebook) profileFields.social.facebook = body.facebook;
    
    // 查询数据库
    /** @type {Object[]} profile */
    const profile = await Profile.find({ user: id });
    if (profile.length > 0) {
        // 更新
        const profileUpdate = await Profile.findOneAndUpdate(
            { user: id },
            { $set: profileFields },
            { new: true, useFindAndModify: false }
        );
        ctx.status = 200;
        ctx.body = {
            data: profileUpdate,
            meta: {
                msg: '更新成功',
                status: 200
            }
        };
    } else {
        // 添加
        await new Profile(profileFields).save().then(profile => {
            ctx.status = 200;
            ctx.body = {
                data: profile,
                meta: {
                    msg: '添加成功',
                    status: 200
                }
            };
        });
    }
});

export default router.routes();