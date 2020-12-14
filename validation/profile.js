import Validator from 'validator';
import isEmpty from './isEmpty';
import tools from '../config/tools';

const validateProfileInput = data => {
    const errs = {};
    
    data = tools.initData(data, { handle: true, status: true, skills: true });
    
    if (Validator.isEmpty(data.handle)) {
        errs.handle = 'handle不能为空';
    } else if (!Validator.isLength(data.handle, { min: 2, max: 40 })) {
        errs.handle = 'handle的长度只能为2~40位';
    }
    
    if (Validator.isEmpty(data.status)) {
        errs.status = 'status不能为空';
    } else if (!Validator.isLength(data.status, { min: 2, max: 20 })) {
        errs.status = 'status的长度只能为2~20位';
    }
    
    if (Validator.isEmpty(data.skills)) {
        errs.skills = 'skills不能为空';
    }
    
    return {
        errs,
        isValid: isEmpty(errs)
    };
};

export default validateProfileInput;