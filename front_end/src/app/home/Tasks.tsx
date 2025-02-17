import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/modal";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../src/components/ui/select";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import {
  Box,
  Button,
  createListCollection,
  Flex,
  Heading,
  Input,
  Text,
  Textarea,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

const taskSchema = z.object({
  taskid: z.number().min(1, "Task ID is required"),
  taskname: z.string().min(1, "Task name is required"),
  startdate: z.string().min(1, "Start date is required"),
  enddate: z.string().min(1, "End date is required"),
  description: z.string().min(1, "Description is required"),
  teamname: z.string().min(1, "Team selection is required"),
  priority: z.string().min(1, "Priority selection is required"),
});

type TaskFormData = z.infer<typeof taskSchema>;

const Tasks = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingMode, setEditingMode] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<boolean>(true);
  const [detailsVisibility, setDetailsVisibility] = useState(true);
  const [teamVisibility, setTeamVisibility] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<"priority" | "enddate" | null>(null);

  const { open, onOpen, onClose } = useDisclosure();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: "",
    },
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
          alert("You are not authorized to update this status");
          return;
        }
        throw new Error(data.error || "Failed to update status");
      }

      fetchTasks(); // Refresh the task list
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err || "Error updating status");
    }
  };

  const enableEditing = (task: Task) => {
    setEditingMode(true);
    setEditingTaskId(task.taskid);
    reset({
      taskid: task.taskid,
      taskname: task.taskname,
      startdate: task.startdate.substring(0, 10),
      enddate: task.enddate.substring(0, 10),
      description: task.description,
      priority: task.priority,
      teamname: task.teamname,
    });
    setVisibility(false);
    setDetailsVisibility(false);
  };

  const handleSave = async (data: TaskFormData) => {
    try {
      // Find the task being edited
      const taskToUpdate = tasks.find((task) => task.taskid === editingTaskId);
  
      if (!taskToUpdate) {
        throw new Error("Task not found");
      }
  
      const updatedTaskData = {
        taskid: editingTaskId, // Use editingTaskId directly
        taskname: data.taskname,
        startdate: data.startdate,
        enddate: data.enddate,
        description: data.description,
        priority: data.priority,
        teamname: data.teamname,
        teamid: taskToUpdate.teamid, // Use teamid from the task being edited
      };
  
      console.log("Updated Task Data:", updatedTaskData);
  
      const response = await fetch(`http://localhost:5000/api/tasks/update/${editingTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTaskData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task");
      }
      setDetailsVisibility(true);
      setEditingMode(false);
      setEditingTaskId(null);
      setVisibility(true);
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:");
    }
  };

  const handleDelete = async (taskid: number) => {
    try {
      console.log(taskid);
      const response = await fetch(`http://localhost:5000/api/tasks/delete/${taskid}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        fetchTasks(); // Refresh the task list
      } else {
        console.error("Error deleting task.");
      }
    } catch (err) {
      console.error("Error deleting task.");
    }
  };

  const priorityCollection = useMemo(() => createListCollection({
    items: [
      { label: "Important", value: "Important" },
      { label: "To Do", value: "ToDo" },
      { label: "Normal", value: "Normal" },
    ],
  }), []);

  const groupedTasks = tasks.reduce((acc, task) => {
    acc[task.teamname] = acc[task.teamname] || [];
    acc[task.teamname].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    onOpen();
  };

  const TaskDetailModal = ({ task }: { task: Task }) => (
    <Modal isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent ml={"25%"} mt={"15%"} width="50%">
        <ModalHeader></ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack bg={"white"} color={"black"} rounded={"2xl"}>
            <Text>
              <strong>Task Name:</strong>
            </Text>
            <Text> {task.taskname}</Text>
            <Text>
              <strong>Start Date:</strong>{" "}
            </Text>
            <Text>{task.startdate}</Text>
            <Text>
              <strong>End Date:</strong>
            </Text>
            <Text>{task.enddate}</Text>
            <Text>
              <strong>Description:</strong>{" "}
            </Text>
            <Text>{task.description}</Text>
            <Text>
              <strong>Priority:</strong>
            </Text>
            <Text> {task.priority}</Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return (
    <Box p={5} color={"black"}>
      <Heading as="h1" size="xl" mb={5}>
        Teams
      </Heading>

      <VStack align="stretch">
        {teamVisibility ? (
          Object.keys(groupedTasks).map((teamName) => (
            <Box
              w={"5xl"}
              key={teamName}
              p={3}
              bg="gray.100"
              borderRadius="md"
              _hover={{ bg: "gray.200" }}
              cursor="pointer"
              onClick={() => {
                setSelectedTeam(teamName);
                setTeamVisibility(false);
              }}
            >
              <Heading as="h2" size="lg">
                {teamName}
              </Heading>
            </Box>
          ))
        ) : (
          <Box
            w={"5xl"}
            p={3}
            key={selectedTeam}
            bg="gray.100"
            borderRadius="md"
            _hover={{ bg: "gray.200" }}
            cursor="pointer"
            onClick={() => {
              setTeamVisibility(true);
            }}
          >
            <Heading as="h2" size="lg">
              {selectedTeam}
            </Heading>
          </Box>
        )}
      </VStack>

      {teamVisibility === false && selectedTeam && (
        <Box mt={6}>
          <Heading as="h2" size="lg" mb={5}>
            {selectedTeam} - Tasks
          </Heading>
          <Flex gap={2} mb={4}>
            <Button
              onClick={() => setFilterType((current) => (current === "priority" ? null : "priority"))}
              bg={filterType === "priority" ? "green.500" : "gray.100"}
            >
              Sort by Priority
            </Button>
            <Button
              onClick={() => setFilterType((current) => (current === "enddate" ? null : "enddate"))}
              bg={filterType === "enddate" ? "green.500" : "gray.100"}
            >
              Sort by End Date
            </Button>
          </Flex>
          <Flex wrap="wrap" gap={4}>
            {groupedTasks[selectedTeam]
              .slice()
              .sort((a, b) => {
                if (filterType === "priority") {
                  const priorityOrder: Record<"Important" | "ToDo" | "Normal", number> = {
                    Important: 0,
                    ToDo: 1,
                    Normal: 2,
                  };

                  return (
                    (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) -
                    (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3)
                  );
                }

                if (filterType === "enddate") {
                  return new Date(a.enddate).getTime() - new Date(b.enddate).getTime();
                }
                return 0;
              })
              .map((task) => (
                <Box
                  key={task.taskid}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={editingTaskId !== task.taskid ? () => handleTaskClick(task) : undefined}
                >
                  <VStack align="start">
                    {editingTaskId === task.taskid ? (
                      <form   
                      onSubmit={handleSubmit(handleSave)}
                      onClick={(e) => e.stopPropagation()}>
                        <VStack justify={"center"} w={"full"}>
                          {/* Task Name Field */}
                          <FormControl isInvalid={!!errors.taskname} w={"inherit"}>
                            <FormLabel fontWeight="medium">Task Name</FormLabel>
                            <Controller
                              name="taskname"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="Task Name"
                                  bg={"gray.100"}
                                />
                              )}
                            />
                          </FormControl>

                          {/* Start Date Field */}
                          <FormControl isInvalid={!!errors.startdate} w={"inherit"}>
                            <FormLabel color="gray.700" fontWeight="medium">Start Date</FormLabel>
                            <Controller
                              name="startdate"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="date"
                                  bg={"gray.100"}
                                />
                              )}
                            />
                          </FormControl>

                          {/* End Date Field */}
                          <FormControl isInvalid={!!errors.enddate} w={"inherit"}>
                            <FormLabel color="gray.700" fontWeight="medium">End Date</FormLabel>
                            <Controller
                              name="enddate"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="date"
                                  bg={"gray.100"}
                                />
                              )}
                            />
                          </FormControl>

                          {/* Description Field */}
                          <FormControl isInvalid={!!errors.description} w={"inherit"}>
                            <FormLabel color="gray.700" fontWeight="medium">Description</FormLabel>
                            <Controller
                              name="description"
                              control={control}
                              render={({ field }) => (
                                <Textarea
                                  {...field}
                                  placeholder="Description"
                                  rows={4}
                                  bg={"gray.100"}
                                />
                              )}
                            />
                          </FormControl>

                          {/* Priority Selection */}
                          <FormControl isInvalid={!!errors.priority} w={"inherit"}>
                            <FormLabel color="gray.700" fontWeight="medium">Priority</FormLabel>
                            <Controller
                              name="priority"
                              control={control}
                              render={({ field }) => (
                                <SelectRoot
                                  {...field}
                                  value={field.value ? [field.value] : []}
                                  onValueChange={({ value }) => field.onChange(value[0])}
                                  collection={priorityCollection}
                                  bg={"gray.100"}
                                >
                                  <SelectTrigger>
                                    <SelectValueText placeholder="Select priority" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {priorityCollection.items.map((priority) => (
                                      <SelectItem key={priority.value} item={priority}>
                                        {priority.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </SelectRoot>
                              )}
                            />
                          </FormControl>

                          <Button
                            type="submit"
                            colorScheme="yellow"
                            width="full"
                            mt={4}
                            color={"white"}
                            bg={"yellow.600"}
                          >
                            Save
                          </Button>
                        </VStack>
                      </form>
                    ) : (
                      // View mode
                      <>
                        <Text>
                          <strong>Task Name:</strong> {task.taskname}
                        </Text>
                        <Text>
                          <strong>Team Leader:</strong> {task.creatoremail}
                        </Text>
                        <Text>
                          <strong>Start Date:</strong> {task.startdate.substring(0, 10)}
                        </Text>
                        <Text>
                          <strong>End Date:</strong> {task.enddate.substring(0, 10)}{" "}
                          {isExpired(task.enddate) && (
                            <Text as="span" color="red.500">
                              Expired
                            </Text>
                          )}
                        </Text>
                        <Text>
                          <strong>Priority:</strong> {task.priority}
                        </Text>
                        {task.admin === "true" && (
                          <><Button
                              mt={"10%"}
                              w={"full"}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent task click event from firing
                                enableEditing(task);
                                setDetailsVisibility(false);
                              } }
                              bg="green.500"
                            >
                              Edit
                            </Button><Button
                              w={"full"}
                              bg="red.500"
                              color="white"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent task click event from firing
                                handleDelete(task.taskid);
                              } }
                            >
                                Delete
                              </Button></>
                        )}
                        <Button
                          w={"full"}
                          bg={task.user_status === "Done" ? "green.500" : "gray.200"}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent task click event from firing
                            handleUpdateStatus(task.taskid);
                          }}
                        >
                          {task.user_status === "Done" ? "Undone" : "Done"}
                        </Button>

                      </>
                    )}
                  </VStack>
                </Box>
              ))}
          </Flex>
        </Box>
      )}
      {selectedTask && detailsVisibility && <TaskDetailModal task={selectedTask} />}
    </Box>
  );
};

export default Tasks;