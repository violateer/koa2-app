import Router from 'koa-router';
import passport from 'koa-passport';
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
    
    await newPost.save().then(post => {
        ctx.status = 200;
        ctx.body = {
            data: post,
            meta: {
                msg: '发表成功',
                status: 200
            }
        };
    }).catch(err => {
        ctx.status = 500;
        ctx.body = {
            data: 'error',
            meta: {
                error: err,
                status: 500
            }
        };
    });
});

/**
 * @route Get api/v1/posts/all
 * @desc 获取所有留言接口地址
 * @access 接口是公开的
 */
router.get('/all', async ctx => {
    await Post.find().sort({ date: -1 }).then(posts => {
        ctx.status = 200;
        ctx.body = {
            data: posts,
            meta: {
                msg: '查询成功',
                status: 200
            }
        };
    }).catch(err => {
        ctx.status = 404;
        ctx.body = {
            data: 'NOT FOUND',
            meta: {
                error: err,
                status: 404
            }
        };
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
        ctx.status = 200;
        ctx.body = {
            data: post,
            meta: {
                msg: '查询成功',
                status: 200
            }
        };
    }).catch(err => {
        ctx.status = 404;
        ctx.body = {
            data: 'NOT FOUND',
            meta: {
                error: err,
                status: 404
            }
        };
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
            ctx.status = 401;
            ctx.body = {
                data: 'NOT ALLOWED',
                meta: {
                    error: '用户非法操作',
                    status: 401
                }
            };
            return;
        }
        await Post.deleteOne({ _id: queryId }).then(() => {
            ctx.status = 200;
            ctx.body = {
                data: 'success',
                meta: {
                    msg: '删除成功',
                    status: 200
                }
            };
        });
    } else {
        ctx.status = 404;
        ctx.body = {
            data: 'NOT FOUND',
            meta: {
                error: '个人信息不存在',
                status: 404
            }
        };
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
            ctx.status = 400;
            ctx.body = {
                data: 'ALREADY LIKED',
                meta: {
                    error: '无法重复点赞',
                    status: 400
                }
            };
            return;
        }
        
        post.likes.unshift({ user: searchId });
        
        const postUpdate = await Post.findOneAndUpdate(
            { _id: queryId },
            { $set: post },
            { new: true, useFindAndModify: false });
        ctx.status = 200;
        ctx.body = {
            data: postUpdate,
            meta: {
                msg: '更新成功',
                status: 200
            }
        };
    } else {
        ctx.status = 404;
        ctx.body = {
            data: 'NOT FOUND',
            meta: {
                error: '该用户没有个人信息',
                status: 404
            }
        };
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
            ctx.status = 400;
            ctx.body = {
                data: 'NEVER LIKED',
                meta: {
                    error: '该用户未点赞过',
                    status: 400
                }
            };
            return;
        }
        
        // 获取要删掉的userId
        const removeIndex = post.likes.map(item => item.user.toString()).indexOf(queryId);
        post.likes.splice(removeIndex, 1);
        
        const postUpdate = await Post.findOneAndUpdate(
            { _id: queryId },
            { $set: post },
            { new: true, useFindAndModify: false });
        ctx.status = 200;
        ctx.body = {
            data: postUpdate,
            meta: {
                msg: '更新成功',
                status: 200
            }
        };
    } else {
        ctx.status = 404;
        ctx.body = {
            data: 'NOT FOUND',
            meta: {
                error: '该用户没有个人信息',
                status: 404
            }
        };
    }
});

/**
 * @route Post api/v1/posts/comment?id=xxx
 * @desc 评论接口地址
 * @access 接口是私密的
 */
router.post('/comment', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id: queryId } = ctx.query;
    const { id: searchId } = ctx.state.user;
    const { text, name, avatar, user } = ctx.request.body;
    const post = await Post.findById(queryId);
    const newComment = { text, name, avatar, user };
    
    post.comments.unshift(newComment);
    const postUpdate = await Post.findOneAndUpdate(
        { _id: queryId },
        { $set: post },
        { new: true, useFindAndModify: false }
    );
    
    ctx.status = 200;
    ctx.body = {
        data: postUpdate,
        meta: {
            msg: '更新成功',
            status: 200
        }
    };
});

/**
 * @route Delete api/v1/posts/comment?id=xxx&comment_id=xxx
 * @desc 删除评论接口地址
 * @access 接口是私密的
 */
router.delete('/comment', passport.authenticate('jwt', { session: false }), async ctx => {
    const { id: queryId, comment_id } = ctx.query;
    const { id: searchId } = ctx.state.user;
    
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
        
        ctx.status = 200;
        ctx.body = {
            data: '删除成功',
            meta: {
                msg: postUpdate,
                status: 200
            }
        };
    } else {
        ctx.status = 404;
        ctx.body = {
            data: 'COMMENT NOT FOUND',
            meta: {
                error: '该评论不存在',
                status: 404
            }
        };
    }
});

export default router.routes();