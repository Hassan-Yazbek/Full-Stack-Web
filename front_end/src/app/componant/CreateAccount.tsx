import React, { useState } from "react";
import Login from "./Login"; // Import your Login component

const CreateAccount = () => {
  const [section, setSection] = useState<'Login' | 'CreateAccount'>('CreateAccount');
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
    <div className="flex justify-center items-center min-h-fit bg-gray-100 text-black">
      {section === 'CreateAccount' ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4"
        >
          <h1 className="text-2xl font-bold text-center mb-4 text-yellow-600">
            Create Account
          </h1>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your first name"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              name="last"
              value={formData.last}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>
      ) : (
        <Login /> // Render the Login component if section is 'Login'
      )}
    </div>
  );
};

export default CreateAccount;
