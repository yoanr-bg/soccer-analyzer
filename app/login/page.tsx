"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) router.push("/");
  }, [router]);

  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Handle registration
  const handleRegister = () => {
    if (!name || !password) {
      alert("Name and password are required.");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");

    // Check for duplicate username
    const userExists = storedUsers.some((u: any) => u.name === name);
    if (userExists) {
      alert("This username is already taken.");
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      password,
      image: image || null,
    };

    storedUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(storedUsers));
    localStorage.setItem("user", JSON.stringify(newUser)); // Current logged-in user
    router.push("/");
  };

  // Handle login
  const handleLogin = () => {
    if (!name || !password) {
      alert("Please enter both name and password.");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const matchedUser = storedUsers.find(
      (u: any) => u.name === name && u.password === password
    );

    if (matchedUser) {
      localStorage.setItem("user", JSON.stringify(matchedUser));
      router.push("/");
    } else {
      alert("Login failed: Incorrect name or password.");
    }
  };

  // Unified form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) handleRegister();
    else handleLogin();
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 font-sans">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96 flex flex-col gap-5 border border-gray-700"
      >
        <h1 className="text-white text-3xl font-extrabold text-center mb-2 tracking-wider">
          {isRegistering ? "Create Account" : "Player Login"}
        </h1>

        {/* Profile Picture Upload */}
        {isRegistering && (
          <div className="flex flex-col items-center gap-3">
            {image ? (
              <img
                src={image}
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-teal-500 shadow-lg"
                alt="Profile Preview"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto border-4 border-gray-600 flex items-center justify-center text-gray-400 text-sm">
                No Image
              </div>
            )}

            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <label
              htmlFor="profile-upload"
              className="bg-gray-700 hover:bg-gray-600 transition text-teal-400 py-2 px-4 rounded-lg text-center cursor-pointer font-semibold border border-teal-500/50"
            >
              Upload Profile Picture (Optional)
            </label>
          </div>
        )}

        {/* Name Input */}
        <input
          type="text"
          placeholder="Enter Name"
          className="p-3 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-500 border border-gray-700"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Enter Password"
          className="p-3 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-500 border border-gray-700"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />

        {/* Primary Action Button */}
        <button
          type="submit"
          className={`py-3 px-4 rounded-lg mt-3 font-extrabold text-lg uppercase tracking-wider transition-all duration-200 shadow-md ${
            isRegistering
              ? "bg-gradient-to-r from-teal-500 to-green-500 text-gray-900 hover:from-teal-600 hover:to-green-600"
              : "bg-teal-500 text-gray-900 hover:bg-teal-400"
          }`}
        >
          {isRegistering ? "Create Account" : "Log In"}
        </button>

        {/* Secondary Switch Button */}
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-teal-400 hover:text-white text-sm mt-2 transition-colors font-medium"
        >
          {isRegistering
            ? "Already have an account? Log In"
            : "New player? Create an Account"}
        </button>
      </form>
    </div>
  );
}
