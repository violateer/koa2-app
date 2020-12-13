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
        const errs = {};
        /** @type {Object[]} findResult */
        let findResult;
        switch (Model) {
            case Profile:
                findResult = await Model.find(filterOptions).populate('user', ['name', 'avatar']);
                break;
            default:
                break;
        }
        if (findResult.length === 0) {
            errs.profile = '未找到该用户信息';
            ctx.status = 404;
            ctx.body = {
                data: 'error',
                meta: {
                    error: errs,
                    status: 404
                }
            };
        } else {
            ctx.status = 200;
            ctx.body = {
                data: findResult[0],
                meta: {
                    msg: '查询成功',
                    status: 200
                }
            };
        }
    }
};

export default tools;