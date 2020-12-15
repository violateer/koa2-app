import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

// 实例化数据模板
const ProfileSchema = new Schema({
    // Profile表和User表依据user关联
    user: {
        type: String,
        ref: 'users',
        required: true
    },
    handle: {
        type: String,
        required: true,
        max: 40
    },
    company: {
        type: String
    },
    website: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    bio: {
        type: String
    },
    githubusername: {
        type: String
    },
    experience: [
        {
            current: {
                type: Boolean
            },
            company: {
                type: String,
                default: true
            },
            title: {
                type: String,
                required: true
            },
            location: {
                type: String
            },
            description: {
                type: String
            },
            from: {
                type: String,
                required: true
            },
            to: {
                type: String
            },
            expId: {
                type: String || Number,
                required: true
            }
        }
    ],
    education: [
        {
            current: {
                type: Boolean,
                default: true
            },
            school: {
                type: String,
                required: true
            },
            degree: {
                type: String,
                required: true
            },
            fieldofstudy: {
                type: String,
                required: true
            },
            description: {
                type: String
            },
            from: {
                type: String,
                required: true
            },
            to: {
                type: String
            }
        }
    ],
    social: {
        wechat: {
            type: String
        },
        QQ: {
            type: String
        },
        twitter: {
            type: String
        },
        facebook: {
            type: String
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Profile = mongoose.model('profile', ProfileSchema);
export default Profile;