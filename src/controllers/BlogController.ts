import { Request, Response } from "express";
import { BlogService } from "../services/BlogService";
import { BlogStatus } from "../entities/Blog";

const blogService = new BlogService();

export class BlogController {
  async getAllBlogs(req: Request, res: Response): Promise<void> {
    const onlyPublished = req.query.published === 'true';
    const blogs = await blogService.getAllBlogs(onlyPublished);
    res.json(blogs);
  }

  async getBlogById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const blog = await blogService.getBlogById(id);
    if (blog) {
      res.json(blog);
    } else {
      res.status(404).send("Blog not found");
    }
  }

  async createBlog(req: Request, res: Response): Promise<void> {
    const { title, content } = req.body;
    const image = req.file ? req.file.path : undefined;
    const newBlog = await blogService.createBlog(title, content, image);
    res.status(201).json(newBlog);
  }

  async updateBlog(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const { title, content, status } = req.body;
    const image = req.file ? req.file.path : undefined;

    try {
      const updatedBlog = await blogService.updateBlog(id, title, content, image, status as BlogStatus);
      if (updatedBlog) {
        res.json(updatedBlog);
      } else {
        res.status(404).send("Blog not found");
      }
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  }

  async deleteBlog(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    await blogService.deleteBlog(id);
    res.status(204).send();
  }
}
