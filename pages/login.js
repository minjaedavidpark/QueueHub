const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Name validations
  if (!firstName.trim() || !lastName.trim()) {
    setError('First name and last name are required');
    return;
  }

  // Name format validation - only letters allowed
  const nameRegex = /^[A-Za-z]+$/;
  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    setError('Names should only contain letters');
    return;
  }

  // Password validation for non-admin users
  if (!isAdmin) {
    // Check if password is exactly 10 digits
    const studentIdRegex = /^\d{10}$/;
    if (!studentIdRegex.test(password)) {
      setError('Student number must be exactly 10 digits');
      return;
    }
  }

  try {
    // ... existing login logic ...
  } catch (error) {
    setError(error.message);
  }
};

return (
  <form onSubmit={handleSubmit}>
    <div>
      <label htmlFor="firstName">First Name:</label>
      <input
        type="text"
        id="firstName"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
        placeholder="Enter your first name"
      />
    </div>
    <div>
      <label htmlFor="lastName">Last Name:</label>
      <input
        type="text"
        id="lastName"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
        placeholder="Enter your last name"
      />
    </div>
    <div>
      <label htmlFor="password">
        {isAdmin ? "Password:" : "Student Number (10 digits):"}
      </label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder={isAdmin ? "Enter password" : "Enter 10-digit student number"}
      />
    </div>
    {error && <div className="error-message">{error}</div>}
    <button type="submit">Login</button>
  </form>
); 