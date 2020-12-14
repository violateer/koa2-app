import Validator from 'validator';
import isEmpty from './isEmpty';
import tools from '../config/tools';

const validateExperienceInput = data => {
    const errs = {};
    
    data = tools.initData(data, { title: true, current: true, from: true });
    
    if (Validator.isEmpty(data.title)) {
        errs.title = 'title不能为空';
    }
    
    if (Validator.isEmpty(data.current)) {
        errs.current = 'current不能为空';
    }
    
    if (Validator.isEmpty(data.from)) {
        errs.from = 'from不能为空';
    }
    
    return {
        errs,
        isValid: isEmpty(errs)
    };
};

export default validateExperienceInput;