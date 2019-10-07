//where app starts
const express = require('express');

const postRouter = require('./post/postRouter')

const server= express()

server.use(express.json())

server.use('/api/posts',postRouter);

server.listen(4444, ()=> {
    console.log("Listening on port 4444")
})