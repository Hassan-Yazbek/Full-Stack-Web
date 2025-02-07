//frontend/src/app/home/AddTask.tsx
import React, { useEffect, useState } from "react";

const AddTask = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamNames, setTeamNames] = useState<{ teamname: string }[]>([]);
  const [taskData, setTaskData] = useState({
    taskName: "",
    startDate: "",
    endDate: "",
    description: "",
    teamName: "",
    priority: "",
  });

  // Fetch team names when component mounts.
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tasks/team", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        console.log("Fetched teams:", data); // Debugging line
    
        if (Array.isArray(data)) {
          setTeamNames(data); // ✅ Set state only if data is an array
        } else {
          console.error("Unexpected API response format:", data);
          setTeamNames([]); // Ensure state remains an array
        }
      } catch (err) {
        console.error("Error in fetching teams:", err);
        setTeamNames([]); // Prevents errors on .map()
      }
    };
    fetchTeam();
  }, []);

  // Update the form data when an input changes.
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  // Submit the form and send the task data to the backend.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Optionally update local tasks state
      setTasks([...tasks, taskData]);
      
      // Send task data directly (not wrapped in an extra "taskData" property)
      const result = await fetch("http://localhost:5000/api/tasks/create", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (result.ok) {
        alert(`Task Added To ${taskData.teamName}`);
      } else {
        console.error("Failed to add task");
      }

      // Reset the form.
      setTaskData({
        taskName: "",
        startDate: "",
        endDate: "",
        description: "",
        teamName: "",
        priority: "",
      });
    } catch (err) {
      console.error("Error while adding task:", err);
    }
  };

  return (
    <div className="mr-20 mt-1 ml-80 p-6 bg-white rounded-lg shadow-lg w-96">
      <h1 className="text-yellow-600 text-2xl font-bold mb-4">Add Task</h1>
      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Task Name</label>
          <input
            type="text"
            name="taskName"
            value={taskData.taskName}
            onChange={handleChange}
            placeholder="Enter task name"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Date Of Start</label>
          <input
            type="date"
            name="startDate"
            value={taskData.startDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Date Of End</label>
          <input
            type="date"
            name="endDate"
            value={taskData.endDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1" htmlFor="teamName">
            Target
          </label>
          <select
            id="teamName"
            name="teamName"
            value={taskData.teamName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Select Task Type</option>
            {teamNames.map((team, index) => (
              <option key={index} value={team.teamname}>
                {team.teamname}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={taskData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          ></textarea>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Priority</label>
          <select
            id="priority"
            name="priority"
            value={taskData.priority}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Select Your Task Priority</option>
            <option value="Important">Important</option>
            <option value="ToDo">To Do</option>
            <option value="Normal">Normal</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-600 text-white font-bold py-2 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          Add Task
        </button>
      </form>
    </div>
  );
};

export default AddTask;
