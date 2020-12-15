import bcrypt from 'bcryptjs';
import isEmpty from '../validation/isEmpty';
// import User from '../models/User';
import Profile from '../models/Profile';

const tools = {
    // 加密
    enbcrypt (password) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    },
    
    // 验证密码
    checkPassword (password, hash) {
        return bcrypt.compareSync(password, hash);
    },
    
    // 初始化空数据
    initData (data, requireOptions) {
        const optKeys = Object.keys(requireOptions);
        const requiredDatas = optKeys.filter(optKey => requireOptions[optKey]);
        requiredDatas.map((requiredData) => {
            data[requiredData] = isEmpty(data[requiredData]) ? '' : data[requiredData];
        });
        return data;
    },
    
    // 生成查询用户的字段
    initSearchQuery (username, email) {
        const searchQuery = {};
        if (username) searchQuery.username = username;
        if (email) searchQuery.email = email;
        return searchQuery;
    },
    
    // 初始化添加和编辑个人信息数据
    initProfileDatas (body, id) {
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
        
        return profileFields;
    },
    
    // 判断查询结果并返回数据，暂时只支持Profile查询
    async judgeFindResultAndReturn (Model, ctx, filterOptions) {
        const errMessage = filterOptions ? '未找到该用户信息' : '没有任何用户信息';
        /** @type {Object[]} findResult */
        let findResult;
        switch (Model) {
            case Profile:
                findResult = await Model.find(filterOptions).populate('user', ['username', 'avatar']);
                break;
            default:
                break;
        }
        if (findResult.length === 0) {
            this.setCtxData(ctx, 404, { data: 'search error', msg: errMessage });
        } else {
            this.setCtxData(ctx, 200, { data: findResult, msg: '查询成功' });
        }
    },
    
    // 设置返回数据
    // query: {data, msg[, errs]}
    setCtxData (ctx, status, query) {
        const { data, msg, errs } = query;
        const errFlag = status >= 200 && status < 300 ? false : true;
        const msgFlag = errFlag ? 'error' : 'msg';
        const dataMsg = errs ? errs : data;
        ctx.status = status;
        ctx.body = {
            data: dataMsg,
            meta: {
                [msgFlag]: msg,
                status
            }
        };
    }
};

export default tools;