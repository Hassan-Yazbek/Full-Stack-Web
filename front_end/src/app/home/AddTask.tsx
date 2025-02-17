import React, { useEffect, useState } from "react";
import { FormControl } from '@chakra-ui/form-control';
import { FormLabel } from '@chakra-ui/form-control';
import { toaster } from "../src/components/ui/toaster"
import { createListCollection } from "@chakra-ui/react"
import { useMemo } from "react"
import { useAsync } from "react-use"
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../src/components/ui/select"
import {
  Box,
  Button,
  Heading,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const taskSchema = z.object({
  taskName: z.string().min(1, "Task name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().min(1, "Description is required"),
  teamName: z.string().min(1, "Team selection is required"), // Single string, not an array
  priority: z.string().min(1, "Priority selection is required"),
});

type TaskFormData = z.infer<typeof taskSchema>;

const AddTask = () => {
  const [teamNames, setTeamNames] = useState<{ teamname: string }[]>([]);

  const { handleSubmit, control, formState: { errors }, reset } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskName: "",
      startDate: "",
      endDate: "",
      description: "",
      teamName: "", // Initialize with an empty string
      priority: "", // Initialize with an empty string
    },
  });

  // Fetch team names
  useAsync(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks/team", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setTeamNames(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error in fetching teams:", err);
      setTeamNames([]);
    }
  }, []);

  // Create collections for select components
  const teamCollection = useMemo(() => createListCollection({
    items: teamNames,
    itemToString: (item) => item.teamname,
    itemToValue: (item) => item.teamname,
  }), [teamNames]);

  const priorityCollection = useMemo(() => createListCollection({
    items: [
      { label: "Important", value: "Important" },
      { label: "To Do", value: "ToDo" },
      { label: "Normal", value: "Normal" },
    ],
  }), []);

  // Submit handler
  const onSubmit = async (data: TaskFormData) => {
    try {
      const result = await fetch("http://localhost:5000/api/tasks/create", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (result.ok) {
        toaster.create({
          title: "Task Added",
          description: `Task added to ${data.teamName}`,
          duration: 3000,
        });
        reset();
      }
    } catch (err) {
      toaster.create({
        title: "Error",
        description: "Failed to add task",
        duration: 3000,
      });
      console.error("Error while adding task:", err);
    }
  };

  return (
    <Box
      mr={20}
      mt={1}
      ml={80}
      p={6}
      bg="white"
      color={"black"}
      borderRadius="lg"
      boxShadow="lg"
      w="96"
    >
      <Heading color="yellow.600" fontSize="2xl" fontWeight="bold" mb={4}>
        Add Task
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack justify={"center"} w={"full"}>
          {/* Task Name Field */}
          <FormControl isInvalid={!!errors.taskName} w={"inherit"}>
            <FormLabel fontWeight="medium">Task Name</FormLabel>
            <Controller
              name="taskName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter task name"
                  bg={"gray.100"}
                />
              )}
            />
          </FormControl>

          {/* Start Date Field */}
          <FormControl isInvalid={!!errors.startDate} w={"inherit"}>
            <FormLabel color="gray.700" fontWeight="medium">Start Date</FormLabel>
            <Controller
              name="startDate"
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
          <FormControl isInvalid={!!errors.endDate} w={"inherit"}>
            <FormLabel color="gray.700" fontWeight="medium">End Date</FormLabel>
            <Controller
              name="endDate"
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

          {/* Team Selection */}
          <FormControl isInvalid={!!errors.teamName} w={"inherit"}>
            <FormLabel color="gray.700" fontWeight="medium">Team</FormLabel>
            <Controller
              name="teamName"
              control={control}
              render={({ field }) => (
                <SelectRoot
                  {...field}
                  value={field.value ? [field.value] : []} // Convert single string to array
                  onValueChange={({ value }) => field.onChange(value[0])} // Convert array back to single string
                  collection={teamCollection}
                  bg={"gray.100"}
                >
                  <SelectTrigger>
                    <SelectValueText placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamCollection.items.map((team) => (
                      <SelectItem key={team.teamname} item={team}>
                        {team.teamname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
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
                  placeholder="Enter task description"
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
                  value={field.value ? [field.value] : []} // Convert single string to array
                  onValueChange={({ value }) => field.onChange(value[0])} // Convert array back to single string
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
            Add Task
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default AddTask;