import { AppDataSource } from "../data-source";
import { Blog } from "../entities/Blog";

export const blogRepository = AppDataSource.getRepository(Blog);
