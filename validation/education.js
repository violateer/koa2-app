import Validator from 'validator';
import isEmpty from './isEmpty';
import tools from '../config/tools';

const validateExperienceInput = data => {
    const errs = {};
    
    data = tools.initData(data, { school: true, degree: true, from: true, fieldofstudy: true });
    
    if (Validator.isEmpty(data.school)) {
        errs.school = 'school不能为空';
    }
    
    if (Validator.isEmpty(data.degree)) {
        errs.degree = 'degree不能为空';
    }
    
    if (Validator.isEmpty(data.fieldofstudy)) {
        errs.fieldofstudy = 'fieldofstudy不能为空';
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