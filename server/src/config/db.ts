// import mongoose from 'mongoose';

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI || '', {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log('MongoDB connected...');
//     } catch (error) {
//         console.error('Database connection error:', error);
//         process.exit(1);
//     }
// };

// export default connectDB;

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB connected...');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

export default connectDB;

