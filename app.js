document.addEventListener("DOMContentLoaded", function () {
  // Function to handle form submission for setting goals
  function handleGoalFormSubmit(event) {
    event.preventDefault();
    const stepsGoal = parseInt(document.getElementById("steps-goal").value);
    const caloriesGoal = parseInt(document.getElementById("calories-goal").value);
    const activeMinutesGoal = parseInt(document.getElementById("active-minutes-goal").value);

    if (!isNaN(stepsGoal) && !isNaN(caloriesGoal) && !isNaN(activeMinutesGoal)) {
      localStorage.setItem("goals", JSON.stringify({ steps: stepsGoal, calories: caloriesGoal, activeMinutes: activeMinutesGoal }));
      alert("Goals set successfully.");
      displayStoredData();
    } else {
      alert("Please enter valid goals.");
    }
  }

  // Function to handle form submission for updating profile
  function handleProfileFormSubmit(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const age = parseInt(document.getElementById("age").value);

    if (username && !isNaN(age)) {
      localStorage.setItem("profile", JSON.stringify({ username: username, age: age }));
      alert("Profile updated successfully.");
      displayStoredData();
    } else {
      alert("Please enter a valid username and age.");
    }
  }

  // Function to handle form submission for logging activity
  function handleActivityFormSubmit(event) {
    event.preventDefault();
    const activityType = document.getElementById("activity-type").value;
    const duration = parseInt(document.getElementById("duration").value);
    const steps = parseInt(document.getElementById("steps").value);
    const dateValue = document.getElementById("date").value;
    const timeValue = document.getElementById("time").value;

    if (activityType && !isNaN(duration) && !isNaN(steps) && dateValue && timeValue) {
      const date = new Date(dateValue + 'T' + timeValue);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
      });

      const activityLog = JSON.parse(localStorage.getItem("activityLog")) || [];
      activityLog.push({ type: activityType, duration: duration, steps: steps, date: formattedDate, time: formattedTime });
      localStorage.setItem("activityLog", JSON.stringify(activityLog));
      alert("Activity logged successfully.");
      displayStoredData();
    } else {
      alert("Please enter valid activity data.");
    }
  }

  // Function to handle form submission for the weekly planner
  function handlePlannerFormSubmit(event) {
    event.preventDefault();
    const activityType = document.getElementById("planner-activity-type").value;
    const duration = parseInt(document.getElementById("planner-duration").value);
    const day = document.getElementById("planner-day").value;

    if (activityType && !isNaN(duration) && day) {
      const planner = JSON.parse(localStorage.getItem("planner")) || {};
      if (!planner[day]) {
        planner[day] = [];
      }
      planner[day].push({ type: activityType, duration: duration });
      localStorage.setItem("planner", JSON.stringify(planner));
      alert("Activity added to planner.");
      displayPlanner();
    } else {
      alert("Please enter valid planner data.");
    }
  }

  // Function to display the weekly planner
  function displayPlanner() {
    const planner = JSON.parse(localStorage.getItem("planner")) || {};
    const plannerScheduleElement = document.getElementById("planner-schedule");
    plannerScheduleElement.innerHTML = Object.keys(planner).map(day => `
      <div class="weekly-day">
        <h3>${capitalizeFirstLetter(day)}</h3>
        <ul>
          ${planner[day].map(activity => `<li>${activity.type} for ${activity.duration} minutes</li>`).join("")}
        </ul>
      </div>
    `).join("");
  }

  // Function to capitalize the first letter of a string
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Function to retrieve and display goals, profile, and activity data from local storage
  function displayStoredData() {
    const storedGoals = localStorage.getItem("goals");
    if (storedGoals) {
      const goals = JSON.parse(storedGoals);
      document.getElementById("steps-goal").value = goals.steps;
      document.getElementById("calories-goal").value = goals.calories;
      document.getElementById("active-minutes-goal").value = goals.activeMinutes;

      const actualData = calculateActualData();
      updateProgressBars(goals, actualData);
    }

    const storedProfile = localStorage.getItem("profile");
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      document.getElementById("username").value = profile.username;
      document.getElementById("age").value = profile.age;
    }

    const storedActivityLog = localStorage.getItem("activityLog");
    if (storedActivityLog) {
      const activityLog = JSON.parse(storedActivityLog);
      const activityLogElement = document.getElementById("activity-log");
      activityLogElement.innerHTML = activityLog.map(activity => 
        `<p>${activity.date} ${activity.time}: ${activity.type} for ${activity.duration} minutes, ${activity.steps.toLocaleString()} steps</p>`
      ).join("");

      // Update the dashboard with totals
      const dashboardTotals = calculateTotals(activityLog);
      updateDashboard(dashboardTotals);

      // Render the charts
      renderCharts(activityLog);
    }

    const dashboardData = {
      steps: 5000,
      caloriesBurned: 250,
      activeMinutes: 60,
    };

    const dashboardContent = document.getElementById("dashboard-content");
    dashboardContent.innerHTML = `
      <p><strong>Steps:</strong> ${dashboardData.steps.toLocaleString()}</p>
      <p><strong>Calories Burned:</strong> ${dashboardData.caloriesBurned}</p>
      <p><strong>Active Minutes:</strong> ${dashboardData.activeMinutes}</p>
    `;
    
    // Display the weekly planner
    displayPlanner();
  }

  // Function to update progress bars based on goals and actual data
  function updateProgressBars(goals, actualData) {
    const stepsProgress = (actualData.steps / goals.steps) * 100;
    const caloriesProgress = (actualData.calories / goals.calories) * 100;
    const activeMinutesProgress = (actualData.activeMinutes / goals.activeMinutes) * 100;

    document.getElementById("steps-progress").style.width = `${stepsProgress}%`;
    document.getElementById("calories-progress").style.width = `${caloriesProgress}%`;
    document.getElementById("active-minutes-progress").style.width = `${activeMinutesProgress}%`;
  }

  // Function to calculate actual data (for demonstration, use sample data)
  function calculateActualData() {
    const storedActivityLog = JSON.parse(localStorage.getItem("activityLog")) || [];
    return storedActivityLog.reduce((totals, activity) => {
      totals.steps += activity.steps;
      totals.calories += activity.duration * 10; // Example: 10 calories per minute
      totals.activeMinutes += activity.duration;
      return totals;
    }, { steps: 0, calories: 0, activeMinutes: 0 });
  }

  // Function to calculate totals for the dashboard
  function calculateTotals(activityLog) {
    return activityLog.reduce((totals, activity) => {
      totals.steps += activity.steps;
      totals.caloriesBurned += activity.duration * 10; // Example: 10 calories per minute
      totals.activeMinutes += activity.duration;
      return totals;
    }, { steps: 0, caloriesBurned: 0, activeMinutes: 0 });
  }

  // Function to update the dashboard
  function updateDashboard(totals) {
    const dashboardContent = document.getElementById("dashboard-content");
    dashboardContent.innerHTML = `
      <p><strong>Steps:</strong> ${totals.steps.toLocaleString()}</p>
      <p><strong>Calories Burned:</strong> ${totals.caloriesBurned}</p>
      <p><strong>Active Minutes:</strong> ${totals.activeMinutes}</p>
    `;
  }

  // Function to render charts
  function renderCharts(activityLog) {
    const dates = activityLog.map(log => log.date);
    const steps = activityLog.map(log => log.steps);
    const calories = activityLog.map(log => log.duration * 10); // Assuming 10 calories per minute
    const activeMinutes = activityLog.map(log => log.duration);

    const stepsChart = new Chart(document.getElementById('stepsChart'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Steps',
          data: steps,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });

    const caloriesChart = new Chart(document.getElementById('caloriesChart'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Calories Burned',
          data: calories,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });

    const activeMinutesChart = new Chart(document.getElementById('activeMinutesChart'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Active Minutes',
          data: activeMinutes,
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Add event listeners for form submissions
  document.getElementById("goal-form").addEventListener("submit", handleGoalFormSubmit);
  document.getElementById("profile-form").addEventListener("submit", handleProfileFormSubmit);
  document.getElementById("activity-form").addEventListener("submit", handleActivityFormSubmit);
  document.getElementById("planner-form").addEventListener("submit", handlePlannerFormSubmit);

  // Display stored goals, profile, and activity data
  displayStoredData();

  // Hamburger menu toggle
  const menuIcon = document.getElementById("menu-icon");
  const navList = document.getElementById("nav-list");

  menuIcon.addEventListener("click", function () {
    navList.classList.toggle("show");
  });

  // Dark Mode Toggle
  const darkModeIcon = document.getElementById("dark-mode-icon");
  const body = document.body;

  darkModeIcon.addEventListener("click", function () {
    if (body.classList.contains("dark-mode")) {
      body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
    } else {
      body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
    }
  });

  // Check for previously saved preference
  if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
  }
});
