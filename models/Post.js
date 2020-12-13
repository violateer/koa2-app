import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

// 实例化数据模板
const PostSchema = new Schema({
    // Profile表和User表依据user关联
    user: {
        type: String,
        ref: 'users',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            username: {
                type: String,
                required: true
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model('post', PostSchema);
export default Post;