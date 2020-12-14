import Validator from 'validator';
import isEmpty from './isEmpty';
import tools from '../config/tools';

const validatePostInput = data => {
    const errs = {};
    
    data = tools.initData(data, { text: true, username: true });
    
    if (Validator.isEmpty(data.text)) {
        errs.text = 'text不能为空';
    } else if (!Validator.isLength(data.text, { min: 10, max: 300 })) {
        errs.text = 'text的长度只能为10~300位';
    }
    
    if (Validator.isEmpty(data.username)) {
        errs.username = 'username不能为空';
    } else if (!Validator.isLength(data.text, { min: 4, max: 20 })) {
        errs.username = 'username的长度只能为4~20位';
    }
    
    return {
        errs,
        isValid: isEmpty(errs)
    };
};

export default validatePostInput;