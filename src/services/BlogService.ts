import { blogRepository } from "../repositories/BlogRepository";
import { Blog, BlogStatus } from "../entities/Blog";

export class BlogService {
  async getAllBlogs(onlyPublished: boolean = false): Promise<Blog[]> {
    if (onlyPublished) {
      return blogRepository.find({ where: { status: BlogStatus.PUBLISHED } });
    }
    return blogRepository.find();
  }

  async getBlogById(id: number): Promise<Blog | null> {
    return blogRepository.findOne({ where: { id } });
  }

  async createBlog(title: string, content: string, image?: string): Promise<Blog> {
    const newBlog = new Blog();
    newBlog.title = title;
    newBlog.content = content;
    if (image) {
      newBlog.image = image;
    }
    return blogRepository.save(newBlog);
  }

  async updateBlog(
    id: number,
    title?: string,
    content?: string,
    image?: string,
    status?: BlogStatus
  ): Promise<Blog | null> {
    const blog = await blogRepository.findOneBy({ id });
    if (!blog) {
      return null;
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (image) blog.image = image;
    if (status) blog.status = status;

    return blogRepository.save(blog);
  }

  async deleteBlog(id: number): Promise<void> {
    await blogRepository.delete(id);
  }
}
