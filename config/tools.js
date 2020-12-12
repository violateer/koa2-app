import bcrypt from 'bcryptjs';
import isEmpty from '../validation/isEmpty';

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
    }
};

export default tools;