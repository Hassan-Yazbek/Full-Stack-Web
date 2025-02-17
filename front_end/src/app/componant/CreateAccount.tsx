import React, { useState } from "react";
import { FormControl,FormLabel } from "@chakra-ui/form-control";
import { 
  Box, 
  Button, 
  Center, 
  Flex, 
  Heading, 
  Input, 
  Text,
  VStack,
} from "@chakra-ui/react";
import Login from "./Login"; // Ensure Login is also using Chakra UI

const CreateAccount = ({ setSection }: { setSection: (section: 'Login' | 'CreateAccount') => void }) => {
  const [formData, setFormData] = useState({
    name: "",
    last: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let { name, last, email, password, confirmPassword } = formData;

    // Basic validation
    if (!name || !last || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    const containsSpecialChar = /[&@#$]/.test(password);
    const containsNumber = /\d/.test(password);
    const isLongEnough = password.length >= 8;

    if (!containsSpecialChar || !containsNumber || !isLongEnough) {
      setError(
        "Password must include &, #, $, or @, contain at least one number, and be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const searchResponse = await fetch(
        `http://localhost:5000/api/accounts/${email}`,
        {
          method: "GET",
        }
      );

      if (searchResponse.status === 404) {
        // Email does not exist, proceed
      } else if (searchResponse.ok) {
        setError("Email is already registered.");
        setIsLoading(false);
        return;
      } else {
        throw new Error("Failed to check email existence.");
      }

      // Create the account
      const createResponse = await fetch(
        "http://localhost:5000/api/accounts/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, last, email, password }),
        }
      );

      const data = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(data.message || "Failed to create account.");
      }

      console.log("Account created successfully:", data.account);
      setSection('Login'); // Switch to 'Login' section after account creation
    } catch (err: any) {
      console.error("Error during account creation:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center w="full">
      <Box 
        as="form" 
        onSubmit={handleSubmit}
        bg="white"
        p={6}
        rounded="lg"
        shadow="lg"
        color={"black"}
        w="1/5"
      >
        <VStack w={"full"}>
          <Heading size="xl" textAlign="center" color="yellow.600">
            Create Account
          </Heading>

          {error && <Text color="red.500">{error}</Text>}

          <FormControl w={"inherit"}>
            <FormLabel>First Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              bg={"gray.100"}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl w={"inherit"}>
            <FormLabel>Last Name</FormLabel>
            <Input
              type="text"
              name="last"
              bg={"gray.100"}
              value={formData.last}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl w={"inherit"}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              bg={"gray.100"}
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl w={"inherit"}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              bg={"gray.100"}
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl w={"inherit"}>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              bg={"gray.100"}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </FormControl>

          <Button
            mt={"5%"}
            color={"white"}
            type="submit"
            bg="yellow.600"
            width="full"
            loadingText="Creating..."
          >
            Create Account
          </Button>

          <Button
            mt={"5%"}
            color={"white"}
            width="full"
            bg="yellow.600"
            onClick={() => setSection('Login')}
          >
            Already have an account? Login
          </Button>
        </VStack>
      </Box>
    </Center>
  );
};

export default CreateAccount;