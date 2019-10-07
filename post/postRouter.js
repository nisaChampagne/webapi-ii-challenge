const express = require('express');
const db = require('../data/db')

const router = express.Router();
///route is kind of middleware but more like :endware:
///using router. whatever  is kind of like requestmapping  so you have the base of what
//you will need then in the path  you can put '/:id' 
router.get('/', (req, res) => {
   db.find()
      .then(posts => res.status(200).json(posts))
      .catch(err => {
         console.log(err)
         res.status(500).json({err: "post couldnt be retrieved"})
      })
});

////////////////////////////////////////////////////////////////////////////
router.post('/', (req, res) => {
   const { title, contents } = req.body;
   if (!title || !contents) {
     return res.status(400).json({error: "Need title and contents"});
      ///returning the above is helping it end the response  after error met
   }
   db.insert({title, contents})
   .then(({id}) => {
     getPost(id, res);
   })
   .catch(err => {
     console.log(err);
     res.status(500).json({error: "Error inserting post"});
   });
});

function getPost(id, res) {
   return db.findById(id)
     .then(([post]) => {
       console.log(post);
       if (post) {
         res.status(200).json(post);
       } else {
         res.status(404).json({error: "Post with id does not exist"});
       }
     })
     .catch(err => {
       console.log(err);
       res.status(500).json({error: "Error getting post", id: id});
     });
 }
////////////////////////////////////////////////////////////////////////////

router.get('/:id', (req, res)=> {
   const { id } = req.params;
   db.findById(id)
   .then(([aSinglePost]) => {
      console.log(aSinglePost);
         if(aSinglePost){
            res.status(200).json(aSinglePost)
         } else {
            res.status(404).json({ error: "Post with this id does not exist"})
         }
      })
})

router.put('/:id', (req, res) =>{
   const { id } = req.params
   const { title, contents } = req.body;
   if (!title && !contents) {
     return res.status(400).json({error: "Need title and contents to change"});
      ///returning the above is helping it end the response  after error met
   }
   db.update(id, {title, contents})
   .then(updated => {
      if(updated){
      getPost(id, res);
      } else {
         res.status(404).json({ error: "Oops, post with id does not exist"})
      }
   })
   .catch(err => {
     console.log(err);
     res.status(500).json({error: "Error updating post"});
   });
})

router.delete('/:id', (req, res)=> {
   const { id } = req.params

   db.remove(id)
   .then(removed => {
      if(removed){
      res.status(204).json("Successfully removed")
      } else{
         res.status(404).json(`Post with id of ${id} doesn't exist`)
      }
   })
   .catch(err => {
      console.log(err, "deleted")
      res.status(500).json({ error: "Error deleting post"})
   })
})
///////////////////////////////////////////////////////////////////////////////////

router.get('/:post_id/comments', (req, res) => {
   const { post_id } = req.params;
   db.findById(post_id)
     .then(([post]) => {
       if (post) {
         db.findPostComments(post_id)
           .then(comments => {
             res.status(200).json(comments);
           });
       } else {
         res.status(404).json({error: "Post with id does not exist"});
       }
     })
     .catch(err => {
       console.log("get comments", err);
       res.status(500).json({error: "Error getting post comments"});
     });
 });

 //////////////////////////////////////////////////////////////////////////////////

 router.post('/:post_id/comments', (req, res) => {
   const { post_id } = req.params;
   const { text } = req.body;
 
   if (text === "" || typeof text !== "string") {
     return res.status(400).json({error: "Comment requires text"});
   }
 
   db.insertComment({ text, post_id })
     .then(({id: comment_id}) => {
       db.findCommentById(comment_id)
         .then(([comment]) => {
           if (comment) {
             res.status(200).json(comment);
           } else {
             res.status(404).json({error: "Comment with id not found"});
           }
         })
         .catch(err => {
           console.log("post comment get", err);
           res.status(500).json({error: "Error getting comment"});
         });
     })
     .catch(err => {
       console.log("post comment", err);
       res.status(500).json({error: "Error adding comment"});
     });
 });
 
module.exports = router;