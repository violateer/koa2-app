import Validator from 'validator';
import isEmpty from './isEmpty';

const validateRegisterInput = data => {
    const errs = {};
    
    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.passwordConfirmation = !isEmpty(data.passwordConfirmation) ? data.passwordConfirmation : '';
    
    if (Validator.isEmpty(data.username)) {
        errs.username = '名字不能为空';
    }
    
    if (!Validator.isLength(data.username, { min: 2, max: 24 })) {
        errs.username = '名字的长度应为2~24位';
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
    
    if (!Validator.isLength(data.password, { min: 6, max: 15 })) {
        errs.password = '密码的长度应为6~15位';
    }
    
    if (Validator.isEmpty(data.passwordConfirmation)) {
        errs.passwordConfirmation = '确认密码不能为空';
    }
    
    if (!Validator.equals(data.password, data.passwordConfirmation)) {
        errs.passwordConfirmation = '两次密码不一致';
    }
    
    return {
        errs,
        isValid: isEmpty(errs)
    };
};

export default validateRegisterInput;