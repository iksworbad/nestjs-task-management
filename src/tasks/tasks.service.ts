import { CreateTaskDto } from './dto/create-task.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import * as uuid from 'uuid/v1';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks() {
    return this.tasks;
  }

  getTasksWithFilters({status, search}: GetTasksFilterDto): Task[] {
    let tasks = this.getAllTasks();

    if(status) {
      tasks = tasks.filter(task => task.status === status);
    }
    if(search) {
      tasks = tasks.filter((task: Task) => 
        task.title.includes(search) || 
        task.description.includes(search)
      );
    }
    return tasks;
  }

  getTaskById(id: string): Task {
    const found = this.tasks.find(task => task.id === id);

    if(!found) {
      throw new NotFoundException(`Task with ID: '${id}' not found`);
    }

    return found;

  }

  createTask({ title, description }: CreateTaskDto) {
    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN
    }
    this.tasks.push(task);
    return task;
  }

  updateTaskStatus(id: string, status: TaskStatus): Task {
    const task = this.getTaskById(id)
    task.status = status;
    return task
  }

  deleteTask(id: string): void {
    const found = this.getTaskById(id);

    this.tasks = this.tasks.filter(task => task.id !== found.id);
  }

}

