import Router from 'koa-router';

const router = new Router();

/**
 * @route Get api/users/v1/test
 * @desc 测试接口地址
 * @assec 接口是公开的
 */
router.get('/test', async ctx => {
    ctx.status = 200;
    ctx.body = {
        msg: 'test works...'
    };
});

export default router.routes();