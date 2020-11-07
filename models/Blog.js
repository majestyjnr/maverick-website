const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    blogTitle:{
        type: String,
        required: true
    },
    blogImage:{
        type: String,
        required: true
    },
    blogText: {
        type: String,
        required: true
    },
    blogTags:{ 
        type: Array,
        required: true
    },
    postedBy:{
        type: String,
        required: true
    },
    timePosted:{
        type: String,
        required: true
    }
})

const Blog = mongoose.model('blog', BlogSchema);
module.exports = Blog;
