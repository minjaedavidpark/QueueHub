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
  <div className="login-container">
    <div className="login-card">
      <div className="login-header">
        <h1>{isAdmin ? "Admin Login" : "Student Login"}</h1>
        <p>Please enter your credentials to continue</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="Enter your first name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder="Enter your last name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            {isAdmin ? "Password" : "Student Number"}
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={isAdmin ? "Enter password" : "Enter 10-digit student number"}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  </div>
); 