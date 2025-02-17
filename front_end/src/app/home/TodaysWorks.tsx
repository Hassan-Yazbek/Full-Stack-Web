import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Tag,
  Text,
  Card,
  CardBody,
  Flex,
  Spinner,
  Alert,
  CardRoot,
  TagRoot,
} from "@chakra-ui/react";

interface Task {
  taskid: number;
  taskname: string;
  startdate: string;
  enddate: string;
  description: string;
  priority: string;
  teamname: string;
}

const TodaysWork: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/today/todays", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await res.json();
        setTasks(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert.Root status="info" title="This is the alert title">
      <Alert.Indicator />
      <Alert.Title>{error}</Alert.Title>
      </Alert.Root>
    );
  }

  return (
    <Box p={6} maxW="5xl" mx="auto">
      <Heading as="h1" size="xl" textAlign="center" mb={6}>
        Today's Tasks
      </Heading>
      {tasks.length === 0 ? (
        <Text textAlign="center" color="gray.500">
          No tasks for today!
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }}>
          {tasks.map((task) => (
            <CardRoot
              key={task.taskid}
              bg={"white"}
              boxShadow="md"
              transition="all 0.2s"
            >
              <CardBody>
                <Heading fontSize="xl" mb={2}>
                  {task.taskname}
                </Heading>
                <Text color="gray.600">
                  <strong>Team:</strong> {task.teamname}
                </Text>
                <Text color="gray.600">
                  <strong>Start:</strong> {task.startdate.slice(0, 10)}
                </Text>
                <Text color="gray.600">
                  <strong>End:</strong> {task.enddate.slice(0, 10)}
                </Text>
                <Flex mt={4} align="center" justify="space-between">
                  <TagRoot
                    size="md"
                    colorScheme={
                      task.priority === "Important"
                        ? "red"
                        : task.priority === "ToDo"
                        ? "yellow"
                        : "green"
                    }
                  >
                    {task.priority}
                  </TagRoot>
                </Flex>
              </CardBody>
            </CardRoot>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default TodaysWork;