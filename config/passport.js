import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { secretOrKey } from '../config/keys';
import mongoose from 'mongoose';

const User = mongoose.model('users');
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey
};

export default passport => {
    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        const user = await User.findById(jwt_payload._id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }));
};
