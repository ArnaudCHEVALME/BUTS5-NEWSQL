const cleanCache = require('../middlewares/cleanCache');
const requireLogin = require('../middlewares/requireLogin');
const mongoose = require("mongoose");
const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _id: req.params.id,
      _user: req.user.id
    })
    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    try {
      const blogs = await Blog.find({ _user: req.user.id }).cache({
        key: req.user.id
      });
      res.send(blogs);
    } catch (err) {
      console.error(err);
    }
  });

  app.post('/api/blogs', [requireLogin, cleanCache], async (req, res) => {
    const { title, content } = req.body;
    console.log("POST");

    try {
      const blog = new Blog({
        title,
        content,
        _user: req.user.id
      });

      await blog.save()

      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });

  app.delete('/api/blogs/:id', [requireLogin, cleanCache], async (req, res) => {
    try {
      const blog = Blog.findOneAndDelete({
        _id: req.params.id,
        _user: req.user.id
      });
      const blogs = await Blog.find({ _user: req.user.id })
      res.send(blogs);
    } catch (err) {
      res.status(500).send({ error: 'Failed to delete blog' });
    }
  });
};


async (blogId) => {

}