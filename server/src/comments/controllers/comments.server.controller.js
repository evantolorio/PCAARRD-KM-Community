import Comment from '../models/comments.server.model';

const commentControls = { 
	list : (req, res) => {	// get all comments
		Comment.find((err, results) => {
	        if (err) { console.log(err); }

	        res.send({ comments: results });
	    });
	}, 
	listByReferredPost : (req, res) => {	// get comments of a post
		const referredPost = req.params.referredPost;

		Comment.find({referredPost}, (err, results) => {
	        if (err) { console.log(err); }

	        res.send({ comments: results });
	    });
	},
	listLengthByGroupBelonged : (req, res) => {	// get no. of comments in a group
		const groupBelonged = req.params.groupBelonged;

		Comment.find({groupBelonged}).count((err, count) => {
	        if (err) { return (err); }

	        res.send({ commentsLength: count });
	    });
	},
	listByUserComments : (req, res) => {	// get comments of a post and a user
		const referredPost = req.params.referredPost;
		const commentedBy = req.params.commentedBy;

		Comment.find({referredPost, 'commentedBy._id': commentedBy}, (err, results) => {
	        if (err) { 
	        	return (err); 
	        } else if (results === null) { 
	        	return res.status(404).send('Comments not found!'); 
	        }

	        res.send({ comments: results });
	    });
	},
	listLengthByOneUser : (req, res) => {	// get no. of comments of a user
		const commentedBy = req.params.commentedBy;

		Comment.find({'commentedBy._id': commentedBy}).count((err, count) => {
	        if (err) { 
	        	return (err); 
	        }

	        res.send({ commentsLength: count });
	    });
	},
	listOne : (req, res) => {	// get one comment
		const id = req.params.id;

		Comment.findById(id, (err, result) => {
			if (err) { 
				return (err);  
			} else if (result === null) { 
				return res.status(404).send('Comment not found!'); 
			}

			res.send({comment: result});
		});
	},
	post : (req, res) => {	// post one comment
		const comment = new Comment(req.body);
		comment.save((err) => {
			if (err) { console.log(err); }

			res.send('Comment saved.');
		});
	},
	updateReactions : (req, res) => {	// modify comment's reactions
		const id = req.params.id;

		Comment.findByIdAndUpdate(id, { reactions: req.body.reactions }, (err) => {
			if (err) { console.log(err); };

			res.send("Comment updated");
		});
	},
	removeOne : (req, res) => {	// delete a comment
		const id = req.params.id;

		Comment.findByIdAndRemove(id, (err, result) => {
			if (err) { 
				return (err); 
			} else if (result === null) { 
				return res.status(404).send('Comment not found!'); 
			}

			res.send("Comment deleted.");
		});
	},
	removeByReferredPost: (req, res) => {	// delete all comments of a post
		const referredPost = req.params.referredPost;

		Comment.remove({referredPost}, (err, result) => {
			if (err) { return (err); }

			res.send("Comments deleted.");
		});
	}
}

export default commentControls;