const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/requireLogin');
const POST = require('../models/post');


router.post("/createPost", requireLogin, (req, res) => {

    const { body, pic } = req.body;

    if (!pic || !body?.trim()) {
        return res.status(422).json({ error: "please add all the fields" });
    }

    const post = new POST({
        body: body.trim(),
        photo: pic,
        postedBy: req.user
    });

    post.save()
        .then((result) => {
            return res.json({
                message: "Post is created succesfully",
                post: result
            })

        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({
                error: "something went wrong"
            })
        })
})

router.get("/allposts", requireLogin, (req, res) => {
    POST.find()
        .populate("postedBy", "_id name Photo")
        .populate("comments.postedBy", "_id name Photo")
        .sort("-createdAt")
        .then(posts => res.json(posts))
        .catch(() => res.status(500).json({ error: "Unable to load posts" }))
})

router.get("/myposts", requireLogin, (req, res) => {
    POST.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name Photo")
        .sort("-createdAt")
        .then(myposts => res.json(myposts))
        .catch(() => res.status(500).json({ error: "Unable to load posts" }))
});

router.get("/myprofile", requireLogin, (req, res) => {
    res.json(req.user);
});

router.put("/like", requireLogin, async (req, res) => {
  try {
    if (!req.body.postId) {
      return res.status(422).json({ error: "postId is required" });
    }
    const result = await POST.findByIdAndUpdate(
      req.body.postId,
      {
        $addToSet: { likes: req.user._id }, 
      },
      { new: true }
    )
      .populate("postedBy", "_id name Photo")
      .populate("comments.postedBy", "_id name Photo");

    if (!result) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json(result);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

router.put("/unlike", requireLogin, async (req, res) => {
  try {
    if (!req.body.postId) {
      return res.status(422).json({ error: "postId is required" });
    }
    const result = await POST.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: { likes: req.user._id },
      },
      { new: true }
    )
      .populate("postedBy", "_id name Photo")
      .populate("comments.postedBy", "_id name Photo");

    if (!result) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json(result);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});


router.put("/comment", requireLogin, async (req, res) => {
  try {
    if (!req.body.postId || !req.body.text?.trim()) {
      return res.status(422).json({ error: "postId and comment text are required" });
    }
    const comment = {
      comment: req.body.text.trim(),
      postedBy: req.user._id,
    };

    const result = await POST.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { comments: comment },
      },
      { new: true }
    )
      .populate("postedBy", "_id name Photo")
      .populate("comments.postedBy", "_id name Photo");

    if (!result) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json(result);
  } catch (error) {
    return res.status(422).json({ error: error.message });
  }
});


router.delete("/deletepost/:postId", requireLogin, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await POST.findOne({ _id: postId }).populate(
      "postedBy",
      "_id"
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "You are not allowed to delete this post" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.log("Delete post error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});





module.exports = router;










