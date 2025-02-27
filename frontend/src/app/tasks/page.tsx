"use client";

import { useState, useEffect } from "react";

interface TaskType {
  _id: string;
  title: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskType[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      const response = await fetch("http://localhost:50001/api/tasks");
      if (response.ok) {
        const data: TaskType[] = await response.json();
        setTasks(data);
      }
    }
    fetchTasks();
  }, []);

  return (
    <div> 
      <h1>Task List</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}