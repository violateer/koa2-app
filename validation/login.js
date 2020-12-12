import Validator from 'validator';
import isEmpty from './isEmpty';

const validateLoginInput = data => {
    const errs = {};
    
    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    
    if (Validator.isEmpty(data.username)) {
        errs.username = '名字不能为空';
    }
    
    if (Validator.isEmpty(data.email)) {
        errs.email = '邮箱不能为空';
    }
    
    if (!Validator.isEmail(data.email)) {
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