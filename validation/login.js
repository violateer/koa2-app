import Validator from 'validator';
import isEmpty from './isEmpty';
import tools from '../config/tools';

const validateLoginInput = data => {
    const errs = {};
    
    data = tools.initData(data, { username: true, email: true, password: true });
    
    if (!data.username) {
        if (Validator.isEmpty(data.email)) {
            errs.usernameOrEmail = '用户名和邮箱不能都为空';
        } else if (!Validator.isEmail(data.email)) {
            errs.email = '邮箱格式不合法';
        }
    }
    
    if (!data.email) {
        if (Validator.isEmpty(data.username)) {
            errs.usernameOrEmail = '用户名和邮箱不能都为空';
        }
    } else if (!Validator.isEmail(data.email)) {
        errs.email = '邮箱格式不合法';
    }
    
    if (Validator.isEmpty(data.password)) {
        errs.password = '密码不能为空';
    }
    
    return {
        errs,
        isValid: isEmpty(errs)
    };
};

export default validateLoginInput;