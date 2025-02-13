
// const app = require('express')();
// const http=require('http').Server(app);

// const mongoose=require('mongoose')

// mongoose.connect('mongodb+srv://garvitsharma1994:GKCruzYI3f5nZ30R@cluster1.d6rta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1')

// const User=require('./models/User')

// async function insert()
// {
//     await User.create({
//         name:"garvit",
//         email:"garvit@mail.com"
//     })
// }

// insert();

// http.listen(3000,function(){
//     console.log("server is running");
    
// })

import app from './app';

const PORT = process.env.PORT || 5001;
// const port1 = 'http://192.168.1.32:5173/' ;

// app.listen(port1, () => {
//     console.log(`Server running on port ${port1}`);
// }); 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 