import bcrypt from 'bcryptjs';

const tools = {
    // 加密
    enbcrypt (password) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        return hash;
    },
    
    // 验证密码
    checkPassword (password, hash) {
        return bcrypt.compareSync(password, hash);
    }
};

export default tools;