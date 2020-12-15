import Router from 'koa-router';
import passport from 'koa-passport';
import tools from '../../../config/tools';
// 引入模板实例
import Post from '../../../models/Post';
import Profile from '../../../models/Profile';
// 验证
import validatePostInput from '../../../validation/post';

const router = new Router();

/**
 * @route Get api/v1/posts/test
 * @desc 测试接口地址
 * @access 接口是公开的
 */
router.get('/test', async ctx => {
    ctx.status = 200;
    ctx.body = {
        msg: 'posts works...'
    };
});

/**
 * @route Post api/v1/posts
 * @desc 创建留言接口地址
 * @access 接口是私密的
 */
router.post('/', passport.authenticate('jwt', { session: false }), async ctx => {
    const { text, name, avatar, username } = ctx.request.body;
    const { id } = ctx.state.user;
    const newPost = new Post({
        text, name, avatar, user: id, username
    });
    
    // 验证
    const { errs, isValid } = validatePostInput(ctx.request.body);
    if (!isValid) {
        tools.setCtxData(ctx, 400, { data: 'validate error', msg: '格式验证错误', errs });
        return;
    }
    
    await newPost.save().then(post => {
        tools.setCtxData(ctx, 200, { data: post, msg: '发表成功' });
    }).catch(err => {
        tools.setCtxData(ctx, 500, { data: '服务器错误', msg: '发表成功', errs: err });
    });
});

/**
 * @route Get api/v1/posts/all
 * @desc 获取指定用户所有留言接口地址
 * @access 接口是公开的
 */
router.get('/all', async ctx => {
    await Post.find().sort({ date: -1 }).then(posts => {
        tools.setCtxData(ctx, 200, { data: posts, msg: '查询成功' });
    }).catch(err => {
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '未查询到结果', errs: err });
    });
});

/**
 * @route Get api/v1/posts?id=xxx
 * @desc 获取单个留言接口地址
 * @access 接口是公开的
 */
router.get('/', async ctx => {
    const { id } = ctx.query;
    await Post.findById(id).then(post => {
        tools.setCtxData(ctx, 200, { data: post, msg: '查询成功' });
    }).catch(err => {
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '未查询到结果', errs: err });
    });
});

/**
 * @route Delete api/v1/posts?id=xxx
 * @desc 删除单个留言接口地址
 * @access 接口是私有的
 */
router.delete('/', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id: queryId } = ctx.query;
    const { id: userId } = ctx.state.user;
    // 当前用户是否拥有个人信息
    const profile = await Profile.find({ user: userId });
    if (profile.length > 0) {
        // 查找此人的留言
        const post = await Post.findById(queryId);
        
        // 判断是否是当前用户
        if (post.user.toString() !== userId) {
            tools.setCtxData(ctx, 401, { data: 'NOT ALLOWED', msg: '用户非法操作' });
            return;
        }
        await Post.deleteOne({ _id: queryId }).then(() => {
            tools.setCtxData(ctx, 200, { data: 'delete success', msg: '删除成功' });
        });
    } else {
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '个人信息不存在' });
    }
});

/**
 * @route Post api/v1/posts/like?id=xxx
 * @desc 点赞接口地址
 * @access 接口是私密的
 */
router.post('/like', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id: queryId } = ctx.query;
    const { id: searchId } = ctx.state.user;
    
    // 查询用户信息
    const profile = await Profile.find({ user: searchId });
    if (profile.length > 0) {
        const post = await Post.findById(queryId);
        console.log(queryId);
        const isLike = post.likes.filter(like => like.user.toString() === searchId).length > 0;
        if (isLike) {
            tools.setCtxData(ctx, 400, { data: 'ALREADY LIKED', msg: '无法重复点赞' });
            return;
        }
        
        post.likes.unshift({ user: searchId });
        
        const postUpdate = await Post.findOneAndUpdate(
            { _id: queryId },
            { $set: post },
            { new: true, useFindAndModify: false });
        tools.setCtxData(ctx, 200, { data: postUpdate, msg: '点赞成功' });
    } else {
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '该用户没有个人信息' });
    }
});

/**
 * @route Post api/v1/posts/unlike?id=xxx
 * @desc 取消点赞接口地址
 * @access 接口是私密的
 */
router.post('/unlike', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id: queryId } = ctx.query;
    const { id: searchId } = ctx.state.user;
    
    // 查询用户信息
    const profile = await Profile.find({ user: searchId });
    if (profile.length > 0) {
        const post = await Post.findById(queryId);
        const isLike = post.likes.filter(like => like.user.toString() === searchId).length === 0;
        if (isLike) {
            tools.setCtxData(ctx, 400, { data: 'NEVER LIKED', msg: '该用户未点赞过' });
            return;
        }
        
        // 获取要删掉的userId
        const removeIndex = post.likes.map(item => item.user.toString()).indexOf(queryId);
        post.likes.splice(removeIndex, 1);
        
        const postUpdate = await Post.findOneAndUpdate(
            { _id: queryId },
            { $set: post },
            { new: true, useFindAndModify: false });
        tools.setCtxData(ctx, 200, { data: postUpdate, msg: '取消点赞成功' });
    } else {
        tools.setCtxData(ctx, 404, { data: 'search error', msg: '该用户没有个人信息' });
    }
});

/**
 * @route Post api/v1/posts/comment?id=xxx
 * @desc 评论接口地址
 * @access 接口是私密的
 */
router.post('/comment', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id: queryId } = ctx.query;
    const { text, name, avatar, user } = ctx.request.body;
    const post = await Post.findById(queryId);
    const newComment = { text, name, avatar, user };
    
    post.comments.unshift(newComment);
    const postUpdate = await Post.findOneAndUpdate(
        { _id: queryId },
        { $set: post },
        { new: true, useFindAndModify: false }
    );
    
    tools.setCtxData(ctx, 200, { data: postUpdate, msg: '评论成功' });
});

/**
 * @route Delete api/v1/posts/comment?id=xxx&comment_id=xxx
 * @desc 删除评论接口地址
 * @access 接口是私密的
 */
router.delete('/comment', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id: queryId, comment_id } = ctx.query;
    
    const post = await Post.findById(queryId);
    const isComment = post.comments.filter(comment => comment._id.toString() === comment_id).length !== 0;
    if (isComment) {
        // 找到该评论
        const removeIndex = post.comments.map(item => item._id.toString()).indexOf(comment_id);
        // 删除
        post.comments.splice(removeIndex, 1);
        const postUpdate = await Post.findOneAndUpdate(
            { _id: queryId },
            { $set: post },
            { new: true, useFindAndModify: false }
        );
        
        tools.setCtxData(ctx, 200, { data: postUpdate, msg: '删除成功' });
    } else {
        tools.setCtxData(ctx, 404, { data: 'COMMENT NOT FOUND', msg: '该评论不存在' });
    }
});

export default router.routes();