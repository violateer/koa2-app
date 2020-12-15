import Router from 'koa-router';
import passport from 'koa-passport';
import tools from '../../../config/tools';
// 引入模板实例
import Profile from '../../../models/Profile';
import User from '../../../models/User';
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
 * @desc 查询个人信息接口地址
 * @access 接口是私有的
 */
router.get('/', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id } = ctx.state.user;
    // 跨表查询
    /** @type {Object[]} profile */
    const profile = await Profile.find({ user: id }).populate('user', ['username', 'avatar']);
    if (profile.length > 0) {
        tools.setCtxData(ctx, 200, { data: profile, msg: '查询成功' });
    } else {
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '该用户没有任何相关信息' });
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
        tools.setCtxData(ctx, 400, { data: 'validate error', msg: '格式验证错误', errs });
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
        tools.setCtxData(ctx, 200, { data: profileUpdate, msg: '更新成功' });
    } else {
        // 添加
        await new Profile(profileFields).save().then(profile => {
            tools.setCtxData(ctx, 200, { data: profile, msg: '添加成功' });
        });
    }
});

/**
 * @route Get api/v1/profile/handle?handle=test
 * @desc 通过handle获取个人信息接口地址
 * @access 接口是公开的
 */
// router.get('/handle', async ctx => {
//     const { handle } = ctx.query;
//     await tools.judgeFindResultAndReturn(Profile, ctx, { handle });
// });

/**
 * @route Get api/v1/profile/user?profile_id=5fd4ad7df91a1616dc9d9798
 * @desc 通过profile_id获取个人信息接口地址
 * @access 接口是公开的
 */
router.get('/user', async ctx => {
    const { profile_id } = ctx.query;
    await tools.judgeFindResultAndReturn(Profile, ctx, { _id: profile_id });
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
    const { title, current, company, location, description, from, to, expId } = ctx.request.body;
    const { errs, isValid } = validateExperienceInput(ctx.request.body);
    // 验证
    if (!isValid) {
        tools.setCtxData(ctx, 400, { data: 'validate error', msg: '格式验证错误', errs });
        return;
    }
    
    const experience = [];
    const profile = await Profile.find({ user: id });
    const existExpId = profile[0].experience.map(existExperience => existExperience.expId);
    
    // 判断已存在经历
    if (existExpId.indexOf(expId) !== -1) {
        tools.setCtxData(ctx, 400, { data: 'exist error', msg: '不能重复创建同一id的工作经历' });
        return;
    }
    
    if (profile.length > 0) {
        const newExp = {
            title, current, company, location, description, from, to, expId
        };
        
        experience.unshift(newExp);
        const profileUpdate = await Profile.updateOne(
            { user: id },
            { $push: { experience } },
            { sort: '1' }
        );
        
        if (profileUpdate.ok === 1) {
            const newProfile = await Profile.find({ user: id }).populate('user', ['username', 'avatar']);
            tools.setCtxData(ctx, 200, { data: newProfile, msg: '更新成功' });
        } else {
            tools.setCtxData(ctx, 500, { data: 'server error', msg: '服务器错误' });
        }
    } else {
        errs.profile = '没有该用户的信息';
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '没有该用户的信息', errs });
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
        tools.setCtxData(ctx, 400, { data: 'validate error', msg: '格式验证错误', errs });
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
            tools.setCtxData(ctx, 200, { data: newProfile, msg: '更新成功' });
        }
    } else {
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '没有该用户的信息' });
    }
});

/**
 * @route DELETE api/v1/profile/experience?exp_id=asdasd
 * @desc 删除工作经验接口地址
 * @access 接口是私有的
 */
router.delete('/experience', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id } = ctx.state.user;
    // 拿到id
    const { exp_id } = ctx.query;
    
    // 查询
    const profile = await Profile.find({ user: id });
    if (profile[0].experience.length > 0) {
        // 找元素下标
        const removeIndex = profile[0].experience.map(item => item.id).indexOf(exp_id);
        // 删除
        profile[0].experience.splice(removeIndex, 1);
        // 更新数据库
        const profileUpdate = await Profile.findOneAndUpdate(
            { user: id },
            { $set: profile[0] },
            { new: true, useFindAndModify: false }
        );
        tools.setCtxData(ctx, 200, { data: profileUpdate, msg: '删除成功' });
    } else {
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '该用户没有填写工作经验' });
    }
});

/**
 * @route DELETE api/v1/profile/education?edu_id=asdasd
 * @desc 删除工作经验接口地址
 * @access 接口是私有的
 */
router.delete('/education', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id } = ctx.state.user;
    // 拿到id
    const { edu_id } = ctx.query;
    
    // 查询
    const profile = await Profile.find({ user: id });
    if (profile[0].education.length > 0) {
        // 找元素下标
        const removeIndex = profile[0].education.map(item => item.id).indexOf(edu_id);
        // 删除
        profile[0].education.splice(removeIndex, 1);
        // 更新数据库
        const profileUpdate = await Profile.findOneAndUpdate(
            { user: id },
            { $set: profile[0] },
            { new: true, useFindAndModify: false }
        );
        tools.setCtxData(ctx, 200, { data: profileUpdate, msg: '删除成功' });
    } else {
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '该用户没有填写教育经历' });
    }
});

/**
 * @route DELETE api/v1/profile
 * @desc 删除整个用户接口地址
 * @access 接口是私有的
 */
router.delete('/', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id } = ctx.state.user;
    const profile = await Profile.deleteOne({ user: id });
    if (profile.ok === 1) {
        const user = await User.deleteOne({ _id: id });
        if (user.ok === 1) {
            tools.setCtxData(ctx, 200, { data: 'delete success', msg: '删除成功' });
        } else {
            tools.setCtxData(ctx, 404, { data: 'search error', msg: '没有找到该用户' });
        }
    } else {
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '该用户没有任何信息' });
    }
});

export default router.routes();