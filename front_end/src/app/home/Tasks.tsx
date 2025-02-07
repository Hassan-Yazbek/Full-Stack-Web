import React, { useState, useEffect } from "react";

interface Task {
  taskid: number;
  taskname: string;
  startdate: string;
  enddate: string;
  description: string;
  priority: string;
  teamname: string;
  creatoremail: string;
  teamid: number;
  admin: string;
  user_status?: string;
}
const Tasks = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingMode,setEditingMode]=useState<boolean>(false);
  const [visibility,setVisibility]=useState<boolean>(true);
  const [filterType, setFilterType] = useState<"priority" | "enddate" | null>(null);
  const [taskData, setTaskData] = useState({
    taskid: "",
    taskname: "",
    startdate: "",
    enddate: "",
    description: "",
    priority: "",
    teamname: "",
    creatoremail: "",
    teamid: "",
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks/tasks", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok) {
        setTasks(Array.isArray(data) ? data : []);
      } else {
        console.error("Error fetching tasks:", data);
      }
    } catch (err) {
      console.error("Error fetching tasks.");
    }
  };

  const isExpired = (endDate: string) => {
    const currentDate = new Date();
    const taskEndDate = new Date(endDate);
    return taskEndDate < currentDate;
  };

  const handleUpdateStatus = async (taskid: number) => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks/update-status", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskid }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          console.error("Action forbidden:", data.error);
          // Add user feedback here
          alert("You are not authorized to update this status");
          return;
        }
        throw new Error(data.error || "Failed to update status");
      }
  
      fetchTasks();
    } catch (err) {
      console.error("Error updating status:", err);
      // Add user feedback here
      alert(err || "Error updating status");
    }
  };

  const enableEditing = (task: Task) => {
    setEditingMode(true);
    setEditingTaskId(task.taskid);
    setTaskData({
      taskid: task.taskid.toString(),
      taskname: task.taskname,
      startdate: task.startdate.substring(0, 10),
      enddate: task.enddate.substring(0, 10),
      description: task.description,
      priority: task.priority,
      teamname: task.teamname,
      creatoremail: task.creatoremail,
      teamid: task.teamid.toString(),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSave = async () => {
    try {
      setVisibility(true);
      const response = await fetch(`http://localhost:5000/api/tasks/update/${taskData.taskid}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        setEditingMode(false);
        setEditingTaskId(null);
        fetchTasks();
      } else {
        console.error("Error updating task.");
      }
    } catch (err) {
      console.error("Error updating task.");
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    acc[task.teamname] = acc[task.teamname] || [];
    acc[task.teamname].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const TaskDetailModal = ({ task }: { task: Task }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4 break-words">{task.taskname}</h2>
        <strong>Start Date:</strong>
        <p className="whitespace-pre-line break-words">{task.startdate}</p>
        <strong>End Date:</strong>
        <p className="whitespace-pre-line break-words">{task.enddate}</p>
        <strong>Description:</strong>
        <p className="whitespace-pre-line break-words">{task.description}</p>
        <strong>Priority:</strong>
        <p className="whitespace-pre-line break-words">{task.priority}</p>
  
        <button
          onClick={() => setSelectedTask(null)}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
  

  return (
    <div className="tasks-container ">
      <h1 className="text-2xl font-bold ml-5">Teams</h1>

      <div className="mt-4">
        {Object.keys(groupedTasks).map((teamName) => (
          <div
            key={teamName}
            className="border p-3 my-2 bg-gray-100 cursor-pointer hover:bg-gray-200"
            onClick={() => setSelectedTeam(selectedTeam === teamName ? null : teamName)}
          >
            <h2 className="text-lg font-semibold w-screen ml-5">{teamName}</h2>
          </div>
        ))}
      </div>

      {selectedTeam && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold ml-5">{selectedTeam} - Tasks</h2>
          <div className="flex gap-2 my-4  ml-5">
            <button
              onClick={() => setFilterType(current => current === 'priority' ? null : 'priority')}
              className={`px-4 py-2 ${filterType === 'priority' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Sort by Priority
            </button>
            <button
              onClick={() => setFilterType(current => current === 'enddate' ? null : 'enddate')}
              className={`px-4 py-2 ${filterType === 'enddate' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Sort by End Date
            </button>
          </div>
          <ul className="flex flex-wrap">
            {groupedTasks[selectedTeam]
              .slice()
              .sort((a, b) => {
                if (filterType === 'priority') {
                  const priorityOrder: Record<'Important' | 'ToDo' | 'Normal', number> = {
                    Important: 0,
                    ToDo: 1,
                    Normal: 2,
                  };
                
                  return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) - 
                         (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3);
                }
                
                if (filterType === 'enddate') {
                  return new Date(a.enddate).getTime() - new Date(b.enddate).getTime();
                }
                return 0;
              })
              .map((task) => (
                <li 
                key={task.taskid} 
                className="flex-shrink-0 w-full md:w-96 p-4 cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >{
                  <div className=" text-black border-2 h-fit w-64 p-3">
                    <strong>Task Name:</strong>
                    {editingTaskId === task.taskid ? (
                      <input type="text" name="taskname" value={taskData.taskname} onChange={handleChange} className="border p-1 w-full" />
                    ) : (
                      <p>{task.taskname}</p>
                    )}

                    <strong>Team Leader:</strong> <p>{task.creatoremail}</p>

                    <strong>Start Date:</strong>
                    {editingTaskId === task.taskid ? (
                      <input type="date" name="startdate" value={taskData.startdate} onChange={handleChange} className="border p-1 w-full" />
                    ) : (
                      <p>{task.startdate.substring(0, 10)}</p>
                    )}

                    <strong>End Date:</strong>
                    {editingTaskId === task.taskid ? (
                      <input type="date" name="enddate" value={taskData.enddate} onChange={handleChange} className="border p-1 w-full" />
                    ) : (
                      <p>
                        {task.enddate.substring(0, 10)}
                        {isExpired(task.enddate) && <span className="text-red-500 ml-2">Expired</span>}
                      </p>
                    )}

                    {/* <strong>Description:</strong>
                    {editingTaskId === task.taskid ? (
                    <textarea
                      name="description"
                      value={taskData.description}
                      onChange={handleChange}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                      className="border p-1 w-full overflow-hidden resize-none"
                    />

                     ) : (
                    <p 
                    className="overflow-y-auto max-h-24 break-words"
                    >
                    {task.description}
                    </p>
                     )} */}

                    <strong>Priority:</strong>
                    {editingTaskId === task.taskid ? (
                      <select name="priority" value={taskData.priority} onChange={handleChange} className="border p-1 w-full">
                        <option value="Important">Important</option>
                        <option value="ToDo">To Do</option>
                        <option value="Normal">Normal</option>
                      </select>
                    ) : (
                      <p>{task.priority}</p>
                    )}

                    {task.admin === "true" && editingTaskId === task.taskid && (
                      <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 mt-2">Save</button>
                    )}
                      {visibility && (
                        <button
                          onClick={() => handleUpdateStatus(task.taskid)}
                          className={`px-4 py-2 mt-2 ${
                            task.user_status === "Done"
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-black"
                          }`}
                        >
                          {task.user_status === "Done" ? "Undone" : "Done"}
                        </button>
                      )}

                    {task.admin === "true" && visibility===true && (
                      <button onClick={() => {enableEditing(task);setVisibility(false)}} className="bg-green-500 text-white px-4 py-2 ml-2">Edit</button>
                    )}
                  </div>
              }
              </li>
              ))}
          </ul>
        </div>
      )}
        {!editingMode && selectedTask && <TaskDetailModal task={selectedTask} />}
    </div>
  );
};

export default Tasks;
