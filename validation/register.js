import Validator from 'validator';
import tools from '../config/tools';
import isEmpty from '../validation/isEmpty';

const validateRegisterInput = data => {
    const errs = {};
    data = tools.initData(data, { username: true, email: true, password: true, passwordConfirmation: true });
    
    if (Validator.isEmpty(data.username)) {
        errs.username = '名字不能为空';
    } else if (!Validator.isLength(data.username, { min: 2, max: 24 })) {
        errs.username = '名字的长度应为2~24位';
    }
    
    if (Validator.isEmpty(data.email)) {
        errs.email = '邮箱不能为空';
    } else if (!Validator.isEmail(data.email)) {
        errs.email = '邮箱格式不合法';
    }
    
    if (Validator.isEmpty(data.password)) {
        errs.password = '密码不能为空';
    } else if (!Validator.isLength(data.password, { min: 6, max: 15 })) {
        errs.password = '密码的长度应为6~15位';
    }
    
    if (Validator.isEmpty(data.passwordConfirmation)) {
        errs.passwordConfirmation = '确认密码不能为空';
    } else if (!Validator.equals(data.password, data.passwordConfirmation)) {
        errs.passwordConfirmation = '两次密码不一致';
    }
    
    return {
        errs,
        isValid: isEmpty(errs)
    };
};

export default validateRegisterInput;