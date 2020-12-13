import Router from 'koa-router';
import passport from 'koa-passport';
import tools from '../../../config/tools';
// 引入模板实例
import Profile from '../../../models/Profile';
// 引入验证
import validateProfileInput from '../../../validation/profile';
import validateExperienceInput from '../../../validation/experience';
import validateEducationInput from '../../../validation/education';

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
    }
});

/**
 * @route POST api/v1/profile/
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
    const profileFields = tools.initProfileDatas(body, id);
    
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

/**
 * @route Get api/v1/profile/handle?handle=test
 * @desc 通过handle获取个人信息接口地址
 * @access 接口是公开的
 */
router.get('/handle', async ctx => {
    const { handle } = ctx.query;
    await tools.judgeFindResultAndReturn(Profile, ctx, { handle });
});

/**
 * @route Get api/v1/profile/user?user_id=5fd4ad7df91a1616dc9d9798
 * @desc 通过user_id获取个人信息接口地址
 * @access 接口是公开的
 */
router.get('/user', async ctx => {
    const { user_id } = ctx.query;
    await tools.judgeFindResultAndReturn(Profile, ctx, { _id: user_id });
});

/**
 * @route Get api/v1/profile/all
 * @desc 获取所有人信息接口地址
 * @access 接口是公开的
 */
router.get('/all', async ctx => {
    await tools.judgeFindResultAndReturn(Profile, ctx, {});
});

/**
 * @route Post api/v1/profile/experience
 * @desc 添加工作经验接口地址
 * @access 接口是私有的
 */
router.post('/experience', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id } = ctx.state.user;
    const { title, current, company, location, description, from, to } = ctx.request.body;
    const { errs, isValid } = validateExperienceInput(ctx.request.body);
    
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
    
    const experience = [];
    const profile = await Profile.find({ user: id });
    if (profile.length > 0) {
        const newExp = {
            title, current, company, location, description, from, to
        };
        
        experience.unshift(newExp);
        const profileUpdate = await Profile.updateOne(
            { user: id },
            { $push: { experience } },
            { sort: '1' }
        );
        
        if (profileUpdate.ok === 1) {
            const newProfile = await Profile.find({ user: id }).populate('user', ['name', 'avatar']);
            
            ctx.status = 200;
            ctx.body = {
                data: newProfile,
                meta: {
                    msg: '更新成功',
                    status: 200
                }
            };
        }
    } else {
        errs.profile = '没有该用户的信息';
        ctx.status = 404;
        ctx.body = {
            data: 'error',
            meta: {
                error: errs,
                status: 404
            }
        };
    }
});

/**
 * @route Post api/v1/profile/education
 * @desc 添加教育经历接口地址
 * @access 接口是私有的
 */
router.post('/education', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id } = ctx.state.user;
    const { school, current, degree, fieldofstudy, description, from, to } = ctx.request.body;
    const { errs, isValid } = validateEducationInput(ctx.request.body);
    
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
    
    const education = [];
    const profile = await Profile.find({ user: id });
    if (profile.length > 0) {
        const newEdu = { school, current, degree, fieldofstudy, description, from, to };
        
        education.unshift(newEdu);
        const profileUpdate = await Profile.updateOne(
            { user: id },
            { $push: { education } },
            { sort: '1' }
        );
        
        if (profileUpdate.ok === 1) {
            const newProfile = await Profile.find({ user: id }).populate('user', ['name', 'avatar']);
            
            ctx.status = 200;
            ctx.body = {
                data: newProfile,
                meta: {
                    msg: '更新成功',
                    status: 200
                }
            };
        }
    } else {
        errs.profile = '没有该用户的信息';
        ctx.status = 404;
        ctx.body = {
            data: 'error',
            meta: {
                error: errs,
                status: 404
            }
        };
    }
});

export default router.routes();