import { CreateTaskDto } from './dto/create-task.dto';
import { EntityRepository, Repository } from "typeorm";
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';
import { Logger, InternalServerErrorException } from '@nestjs/common';


@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('taskRepository')
  async getTasks({status, search}: GetTasksFilterDto, user: User): Promise<Task[]> {
    const query = this.createQueryBuilder('task');

    query.where('task.userId = :userId', {userId: user.id });
    
    if (status) {
      query.andWhere('task.status = :status', {status});
    }

    if (search) {
      query.andWhere('task.title LIKE :search OR task.description LIKE :search', {search: `%${search}%` });

    }
    try {
      return await query.getMany();
    } catch (error) {

      this.logger.error(`Failed to get tasks for user "${user.username}", DTO : ${JSON.stringify({status, search})}`, error.stack);
      throw new InternalServerErrorException();
    }
  }


  async createTask({ title, description } : CreateTaskDto, user: User): Promise<Task> {
    const task: Task = new Task();

    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;
    try {
      await task.save();
    } catch (error) {
      this.logger.error(`Failed to create tasks for user "${user.username}", DTO : ${JSON.stringify({ title, description })}`, error.stack);
      throw new InternalServerErrorException();
    }


    delete task.user;

    return task;
  }
}