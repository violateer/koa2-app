import Validator from 'validator';
import isEmpty from './isEmpty';

const validateRegisterInput = data => {
    const errs = {};
    
    if (!Validator.isLength(data.username, { min: 2, max: 24 })) {
        errs.name = '名字的长度应为2~24位';
    }
    
    return {
        errs,
        isValid: isEmpty(errs)
    };
};

export default validateRegisterInput;