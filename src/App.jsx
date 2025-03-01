import React, { useState, useEffect } from "react";
import {
  Clock,
  Play,
  Square,
  PlusCircle,
  FileText,
  BarChart2,
  Users,
  Briefcase,
  AlignLeft,
  Trash2,
  Edit,
  X,
  DollarSign,
} from "lucide-react";

const FreelanceTimeTracker = () => {
  // Main state for the application
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentView, setCurrentView] = useState("timesheet");
  const [newClientName, setNewClientName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");
  const [newEntryProject, setNewEntryProject] = useState("");
  const [newEntryDescription, setNewEntryDescription] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Billing settings
  const [billingMonth, setBillingMonth] = useState(new Date().getMonth());
  const [billingYear, setBillingYear] = useState(new Date().getFullYear());
  const [standardRate, setStandardRate] = useState(150);
  const [discountedRate, setDiscountedRate] = useState(125);
  const [weeklyThreshold, setWeeklyThreshold] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedClients = localStorage.getItem("timeTracker_clients");
    const savedProjects = localStorage.getItem("timeTracker_projects");
    const savedTimeEntries = localStorage.getItem("timeTracker_entries");

    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedTimeEntries) setTimeEntries(JSON.parse(savedTimeEntries));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("timeTracker_clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("timeTracker_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("timeTracker_entries", JSON.stringify(timeEntries));
  }, [timeEntries]);

  // Timer logic
  useEffect(() => {
    let interval = null;

    if (activeTimer) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [activeTimer]);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  // Format time as decimal hours (e.g., 1.5 hours)
  const formatDecimalHours = (seconds) => {
    const hours = seconds / 3600;
    return hours.toFixed(2);
  };

  // Start timer
  const startTimer = (projectId) => {
    // Stop any active timer first
    if (activeTimer) {
      stopTimer();
    }

    setActiveTimer(projectId);
    setElapsedTime(0);
    setNewEntryProject(projectId);
  };

  // Stop timer and create time entry
  const stopTimer = () => {
    if (activeTimer && elapsedTime > 0) {
      const newEntry = {
        id: Date.now(),
        projectId: newEntryProject || activeTimer,
        description: newEntryDescription,
        date: selectedDate,
        duration: elapsedTime,
        createdAt: new Date().toISOString(),
      };

      setTimeEntries([...timeEntries, newEntry]);
      setNewEntryDescription("");
    }

    setActiveTimer(null);
    setElapsedTime(0);
  };

  // Add new client
  const addClient = () => {
    if (newClientName.trim()) {
      const newClient = {
        id: Date.now(),
        name: newClientName,
      };

      setClients([...clients, newClient]);
      setNewClientName("");
    }
  };

  // Add new project
  const addProject = () => {
    if (newProjectName.trim() && newProjectClient) {
      const newProject = {
        id: Date.now(),
        name: newProjectName,
        clientId: newProjectClient,
      };

      setProjects([...projects, newProject]);
      setNewProjectName("");
      setNewProjectClient("");
    }
  };

  // Create or find miscellaneous project for a client
  const ensureMiscProject = (clientId) => {
    // Check if client already has a misc project
    const existingMiscProject = projects.find(
      (p) =>
        p.clientId === clientId &&
        (p.name.toLowerCase().includes("misc") ||
          p.name.toLowerCase().includes("miscellaneous")),
    );

    if (existingMiscProject) {
      return existingMiscProject.id;
    }

    // If not, create a new misc project
    const newMiscProject = {
      id: Date.now(),
      name: "Miscellaneous",
      clientId: clientId,
    };

    setProjects((prev) => [...prev, newMiscProject]);
    return newMiscProject.id;
  };

  // Add new time entry manually
  const addTimeEntry = () => {
    if (newEntryProject && newEntryDescription && elapsedTime > 0) {
      const newEntry = {
        id: Date.now(),
        projectId: newEntryProject,
        description: newEntryDescription,
        date: selectedDate,
        duration: elapsedTime,
        createdAt: new Date().toISOString(),
      };

      setTimeEntries([...timeEntries, newEntry]);
      setNewEntryProject("");
      setNewEntryDescription("");
      setElapsedTime(0);
    }
  };

  // Delete time entry
  const deleteTimeEntry = (id) => {
    setTimeEntries(timeEntries.filter((entry) => entry.id !== id));
  };

  // Edit time entry
  const saveEditedEntry = () => {
    if (editingEntry) {
      setTimeEntries(
        timeEntries.map((entry) =>
          entry.id === editingEntry.id ? editingEntry : entry,
        ),
      );
      setEditingEntry(null);
    }
  };

  // Get client name by ID
  const getClientName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      const client = clients.find((c) => c.id === project.clientId);
      return client ? client.name : "Unknown Client";
    }
    return "Unknown Client";
  };

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Filter entries by date for timesheet view
  const getEntriesForDate = (date) => {
    return timeEntries.filter((entry) => entry.date === date);
  };

  // Calculate total time for a specific date
  const getTotalTimeForDate = (date) => {
    const entries = getEntriesForDate(date);
    return entries.reduce((total, entry) => total + entry.duration, 0);
  };

  // Get entries for report view based on date range
  const getEntriesForReport = () => {
    return timeEntries.filter(
      (entry) => entry.date >= dateRange.start && entry.date <= dateRange.end,
    );
  };

  // Calculate total time by client for reports
  const getTimeByClient = () => {
    const reportEntries = getEntriesForReport();
    const clientTotals = {};

    reportEntries.forEach((entry) => {
      const project = projects.find((p) => p.id === entry.projectId);
      if (project) {
        const clientId = project.clientId;
        clientTotals[clientId] = (clientTotals[clientId] || 0) + entry.duration;
      }
    });

    return Object.entries(clientTotals)
      .map(([clientId, duration]) => {
        const client = clients.find((c) => c.id === parseInt(clientId));
        return {
          clientId: parseInt(clientId),
          clientName: client ? client.name : "Unknown Client",
          duration,
          hours: formatDecimalHours(duration),
        };
      })
      .sort((a, b) => b.duration - a.duration);
  };

  // Calculate total time by project for reports
  const getTimeByProject = () => {
    const reportEntries = getEntriesForReport();
    const projectTotals = {};

    reportEntries.forEach((entry) => {
      const projectId = entry.projectId;
      projectTotals[projectId] =
        (projectTotals[projectId] || 0) + entry.duration;
    });

    return Object.entries(projectTotals)
      .map(([projectId, duration]) => {
        const project = projects.find((p) => p.id === parseInt(projectId));
        const clientName = project
          ? getClientName(project.id)
          : "Unknown Client";
        return {
          projectId: parseInt(projectId),
          projectName: project ? project.name : "Unknown Project",
          clientName,
          duration,
          hours: formatDecimalHours(duration),
        };
      })
      .sort((a, b) => b.duration - a.duration);
  };

  // Get the start of the week for a given date
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Group time entries by week and client for billing calculations
  const getEntriesByWeekAndClient = () => {
    // Get all entries for the selected billing month
    const firstDay = new Date(billingYear, billingMonth, 1);
    const lastDay = new Date(billingYear, billingMonth + 1, 0);

    const firstDayStr = firstDay.toISOString().split("T")[0];
    const lastDayStr = lastDay.toISOString().split("T")[0];

    const monthEntries = timeEntries.filter(
      (entry) => entry.date >= firstDayStr && entry.date <= lastDayStr,
    );

    // Group by client and week
    const weeklyClientHours = {};

    monthEntries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      const weekStart = getWeekStart(entryDate).toISOString().split("T")[0];
      const project = projects.find((p) => p.id === entry.projectId);

      if (project) {
        const clientId = project.clientId;
        const key = `${clientId}-${weekStart}`;

        if (!weeklyClientHours[key]) {
          weeklyClientHours[key] = {
            clientId,
            weekStart,
            totalSeconds: 0,
            entries: [],
          };
        }

        weeklyClientHours[key].totalSeconds += entry.duration;
        weeklyClientHours[key].entries.push(entry);
      }
    });

    return Object.values(weeklyClientHours);
  };

  // Calculate billing for each client based on tiered pricing
  const calculateBilling = () => {
    const weeklyData = getEntriesByWeekAndClient();
    const clientBilling = {};

    // Initialize client billing objects
    clients.forEach((client) => {
      clientBilling[client.id] = {
        clientId: client.id,
        clientName: client.name,
        totalHours: 0,
        standardHours: 0,
        discountedHours: 0,
        totalAmount: 0,
        weeks: [],
      };
    });

    // Process each week's data
    weeklyData.forEach((weekData) => {
      const { clientId, weekStart, totalSeconds } = weekData;
      const totalHours = totalSeconds / 3600;

      // Skip if no client found
      if (!clientBilling[clientId]) return;

      // Calculate standard and discounted hours
      const standardHours = Math.min(weeklyThreshold, totalHours);
      const discountedHours = Math.max(0, totalHours - weeklyThreshold);

      // Calculate amount for this week
      const weekAmount =
        standardHours * standardRate + discountedHours * discountedRate;

      // Update client billing totals
      clientBilling[clientId].totalHours += totalHours;
      clientBilling[clientId].standardHours += standardHours;
      clientBilling[clientId].discountedHours += discountedHours;
      clientBilling[clientId].totalAmount += weekAmount;

      // Add week details
      clientBilling[clientId].weeks.push({
        weekStart,
        totalHours,
        standardHours,
        discountedHours,
        weekAmount,
      });
    });

    // Convert to array and sort by total amount
    return Object.values(clientBilling)
      .filter((client) => client.totalHours > 0)
      .sort((a, b) => b.totalAmount - a.totalAmount);
  };

  // Open modal
  const openModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get month name
  const getMonthName = (monthIndex) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  };

  // Format date range for weekly display
  const formatWeekRange = (weekStart) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  // Render the current view
  const renderView = () => {
    switch (currentView) {
      case "timesheet":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Timesheet</h2>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border p-2 rounded"
                />
                <button
                  onClick={() => openModal("newEntry")}
                  className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  New Entry
                </button>
              </div>
            </div>

            {activeTimer && (
              <div className="bg-blue-100 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{getProjectName(activeTimer)}</p>
                    <p className="text-sm text-gray-600">
                      {getClientName(activeTimer)}
                    </p>
                    <input
                      type="text"
                      placeholder="What are you working on?"
                      value={newEntryDescription}
                      onChange={(e) => setNewEntryDescription(e.target.value)}
                      className="border p-2 mt-2 w-full rounded"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-mono">
                      {formatTime(elapsedTime)}
                    </span>
                    <button
                      onClick={stopTimer}
                      className="bg-red-500 text-white p-2 rounded"
                    >
                      <Square size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="grid grid-cols-12 bg-gray-100 p-3 rounded-t-lg font-bold">
                <div className="col-span-4">Project/Task</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2 text-right">Duration</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {getEntriesForDate(selectedDate).length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No time entries for this date
                </div>
              ) : (
                getEntriesForDate(selectedDate).map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-12 p-3 border-t"
                  >
                    <div className="col-span-4">
                      <p className="font-semibold">
                        {getProjectName(entry.projectId)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getClientName(entry.projectId)}
                      </p>
                    </div>
                    <div className="col-span-4">{entry.description}</div>
                    <div className="col-span-2 text-right font-mono">
                      {formatTime(entry.duration)}
                    </div>
                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => {
                          setEditingEntry(entry);
                          openModal("editEntry");
                        }}
                        className="text-blue-500 p-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteTimeEntry(entry.id)}
                        className="text-red-500 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              <div className="grid grid-cols-12 p-3 border-t bg-gray-50">
                <div className="col-span-8 font-bold">Total</div>
                <div className="col-span-2 text-right font-mono font-bold">
                  {formatTime(getTotalTimeForDate(selectedDate))}
                </div>
                <div className="col-span-2"></div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-bold mb-2">Quick Start</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border p-3 rounded flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => startTimer(project.id)}
                  >
                    <div>
                      <p className="font-semibold">{project.name}</p>
                      <p className="text-sm text-gray-600">
                        {getClientName(project.id)}
                      </p>
                    </div>
                    <button className="text-green-500">
                      <Play size={20} />
                    </button>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="border p-3 rounded text-gray-500 text-center">
                    Add your first project to start tracking time
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold mb-2">Quick Add Time Slots</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {clients.map((client) => {
                  // Find or determine a miscellaneous project ID for this client
                  let miscProjectId = null;
                  const clientProjects = projects.filter(
                    (p) => p.clientId === client.id,
                  );

                  // Look for an existing "Miscellaneous" project
                  const miscProject = clientProjects.find(
                    (p) =>
                      p.name.toLowerCase().includes("misc") ||
                      p.name.toLowerCase().includes("miscellaneous"),
                  );

                  // If a misc project exists, use it, otherwise use the first project or null
                  miscProjectId = miscProject
                    ? miscProject.id
                    : clientProjects.length > 0
                      ? clientProjects[0].id
                      : null;

                  return (
                    <div
                      key={client.id}
                      className="border p-3 rounded hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold">{client.name}</p>
                        <div className="text-sm text-gray-600">
                          {miscProjectId
                            ? getProjectName(miscProjectId)
                            : "No projects"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded flex-1 text-sm"
                          onClick={() => {
                            let projectId = miscProjectId;
                            // If no project exists, create a misc project automatically
                            if (!projectId) {
                              projectId = ensureMiscProject(client.id);
                            }

                            // Add a 30-minute entry
                            const newEntry = {
                              id: Date.now(),
                              projectId: projectId,
                              description: "Quick task",
                              date: selectedDate,
                              duration: 30 * 60, // 30 minutes in seconds
                              createdAt: new Date().toISOString(),
                            };
                            setTimeEntries([...timeEntries, newEntry]);
                          }}
                        >
                          + 30 min
                        </button>
                        <button
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded flex-1 text-sm"
                          onClick={() => {
                            let projectId = miscProjectId;
                            // If no project exists, create a misc project automatically
                            if (!projectId) {
                              projectId = ensureMiscProject(client.id);
                            }

                            // Add a 1-hour entry
                            const newEntry = {
                              id: Date.now(),
                              projectId: projectId,
                              description: "Quick task",
                              date: selectedDate,
                              duration: 60 * 60, // 60 minutes in seconds
                              createdAt: new Date().toISOString(),
                            };
                            setTimeEntries([...timeEntries, newEntry]);
                          }}
                        >
                          + 1 hour
                        </button>
                      </div>
                    </div>
                  );
                })}
                {clients.length === 0 && (
                  <div className="border p-3 rounded text-gray-500 text-center">
                    Add your first client to use quick time slots
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "reports":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Reports</h2>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <span className="self-center">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="border p-2 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold mb-3">Time by Client</h3>
                {getTimeByClient().length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No data for the selected period
                  </div>
                ) : (
                  <div>
                    {getTimeByClient().map((client) => (
                      <div key={client.clientId} className="mb-2">
                        <div className="flex justify-between">
                          <span>{client.clientName}</span>
                          <span className="font-mono">{client.hours} hrs</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (client.duration / (3600 * 8)) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold mb-3">Time by Project</h3>
                {getTimeByProject().length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No data for the selected period
                  </div>
                ) : (
                  <div>
                    {getTimeByProject().map((project) => (
                      <div key={project.projectId} className="mb-2">
                        <div className="flex justify-between">
                          <div>
                            <span>{project.projectName}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({project.clientName})
                            </span>
                          </div>
                          <span className="font-mono">{project.hours} hrs</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (project.duration / (3600 * 8)) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
                <h3 className="font-bold mb-3">Detailed Time Entries</h3>
                {getEntriesForReport().length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No entries for the selected period
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left">Date</th>
                          <th className="p-2 text-left">Client</th>
                          <th className="p-2 text-left">Project</th>
                          <th className="p-2 text-left">Description</th>
                          <th className="p-2 text-right">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getEntriesForReport()
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((entry) => (
                            <tr key={entry.id} className="border-t">
                              <td className="p-2">
                                {new Date(entry.date).toLocaleDateString()}
                              </td>
                              <td className="p-2">
                                {getClientName(entry.projectId)}
                              </td>
                              <td className="p-2">
                                {getProjectName(entry.projectId)}
                              </td>
                              <td className="p-2">{entry.description}</td>
                              <td className="p-2 text-right font-mono">
                                {formatDecimalHours(entry.duration)}
                              </td>
                            </tr>
                          ))}
                        <tr className="border-t bg-gray-50 font-bold">
                          <td className="p-2" colSpan="4">
                            Total
                          </td>
                          <td className="p-2 text-right font-mono">
                            {formatDecimalHours(
                              getEntriesForReport().reduce(
                                (total, entry) => total + entry.duration,
                                0,
                              ),
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "clients":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Clients</h2>
              <button
                onClick={() => openModal("newClient")}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <PlusCircle size={16} />
                New Client
              </button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="grid grid-cols-6 bg-gray-100 p-3 rounded-t-lg font-bold">
                <div className="col-span-3">Client Name</div>
                <div className="col-span-2">Projects</div>
                <div className="col-span-1">Actions</div>
              </div>

              {clients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No clients added yet
                </div>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    className="grid grid-cols-6 p-3 border-t"
                  >
                    <div className="col-span-3 font-semibold">
                      {client.name}
                    </div>
                    <div className="col-span-2">
                      {projects.filter((p) => p.clientId === client.id).length}{" "}
                      projects
                    </div>
                    <div className="col-span-1">
                      <button onClick={() => {}} className="text-blue-500 p-1">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Projects</h2>
              <button
                onClick={() => openModal("newProject")}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <PlusCircle size={16} />
                New Project
              </button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="grid grid-cols-6 bg-gray-100 p-3 rounded-t-lg font-bold">
                <div className="col-span-2">Project Name</div>
                <div className="col-span-2">Client</div>
                <div className="col-span-1">Total Hours</div>
                <div className="col-span-1">Actions</div>
              </div>

              {projects.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No projects added yet
                </div>
              ) : (
                projects.map((project) => {
                  const projectEntries = timeEntries.filter(
                    (e) => e.projectId === project.id,
                  );
                  const totalHours = formatDecimalHours(
                    projectEntries.reduce(
                      (total, entry) => total + entry.duration,
                      0,
                    ),
                  );

                  return (
                    <div
                      key={project.id}
                      className="grid grid-cols-6 p-3 border-t"
                    >
                      <div className="col-span-2 font-semibold">
                        {project.name}
                      </div>
                      <div className="col-span-2">
                        {getClientName(project.id)}
                      </div>
                      <div className="col-span-1 font-mono">{totalHours}</div>
                      <div className="col-span-1">
                        <button
                          onClick={() => {}}
                          className="text-blue-500 p-1"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => startTimer(project.id)}
                          className="text-green-500 p-1"
                        >
                          <Play size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case "billing":
        const billingData = calculateBilling();
        const monthName = getMonthName(billingMonth);
        const totalBillingAmount = billingData.reduce(
          (total, client) => total + client.totalAmount,
          0,
        );

        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Billing</h2>
              <div className="flex gap-2 items-center">
                <select
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(parseInt(e.target.value))}
                  className="border p-2 rounded"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {getMonthName(i)}
                    </option>
                  ))}
                </select>
                <select
                  value={billingYear}
                  onChange={(e) => setBillingYear(parseInt(e.target.value))}
                  className="border p-2 rounded"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Billing Settings</h3>
                <div className="text-sm text-gray-500">
                  <span>Tiered Pricing Model</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Standard Rate ($/hr)
                  </label>
                  <div className="flex">
                    <span className="bg-gray-100 border border-r-0 rounded-l px-3 py-2">
                      $
                    </span>
                    <input
                      type="number"
                      value={standardRate}
                      onChange={(e) =>
                        setStandardRate(parseFloat(e.target.value))
                      }
                      className="border rounded-r p-2 w-full"
                      min="0"
                      step="5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Discounted Rate ($/hr)
                  </label>
                  <div className="flex">
                    <span className="bg-gray-100 border border-r-0 rounded-l px-3 py-2">
                      $
                    </span>
                    <input
                      type="number"
                      value={discountedRate}
                      onChange={(e) =>
                        setDiscountedRate(parseFloat(e.target.value))
                      }
                      className="border rounded-r p-2 w-full"
                      min="0"
                      step="5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Weekly Threshold (hours)
                  </label>
                  <input
                    type="number"
                    value={weeklyThreshold}
                    onChange={(e) =>
                      setWeeklyThreshold(parseFloat(e.target.value))
                    }
                    className="border rounded p-2 w-full"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                <p>
                  <strong>Your Billing Model:</strong> ${standardRate}/hr for
                  first {weeklyThreshold} hours per week, then ${discountedRate}
                  /hr after that
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b">
                <h3 className="text-lg font-bold">
                  Monthly Summary: {monthName} {billingYear}
                </h3>
                <p className="text-xl mt-2 font-bold text-green-600">
                  {formatCurrency(totalBillingAmount)}
                </p>
              </div>

              {billingData.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No billable hours for this month
                </div>
              ) : (
                billingData.map((client) => (
                  <div key={client.clientId} className="p-4 border-b">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-semibold">
                        {client.clientName}
                      </h4>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(client.totalAmount)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Total Hours</p>
                        <p className="font-mono">
                          {client.totalHours.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Billing Breakdown
                        </p>
                        <p className="text-sm">
                          {client.standardHours.toFixed(2)} hrs @ $
                          {standardRate}/hr
                          {client.discountedHours > 0 && (
                            <span>
                              {" "}
                              + {client.discountedHours.toFixed(2)} hrs @ $
                              {discountedRate}/hr
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">
                        Weekly Breakdown
                      </p>
                      <div className="bg-gray-50 rounded">
                        {client.weeks.map((week, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-12 p-2 text-sm border-b last:border-b-0"
                          >
                            <div className="col-span-4 font-medium">
                              {formatWeekRange(week.weekStart)}
                            </div>
                            <div className="col-span-3 font-mono">
                              {week.totalHours.toFixed(2)} hrs
                            </div>
                            <div className="col-span-3">
                              {week.standardHours.toFixed(2)} @ ${standardRate}
                              {week.discountedHours > 0 && (
                                <div>
                                  {week.discountedHours.toFixed(2)} @ $
                                  {discountedRate}
                                </div>
                              )}
                            </div>
                            <div className="col-span-2 text-right font-bold">
                              {formatCurrency(week.weekAmount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <button className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2">
                <DollarSign size={16} />
                Export Invoice
              </button>
            </div>
          </div>
        );

      default:
        return <div>Invalid view</div>;
    }
  };

  // Render modal content
  const renderModalContent = () => {
    switch (modalContent) {
      case "newClient":
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Add New Client</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Client Name</label>
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="border p-2 w-full rounded"
                placeholder="Enter client name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addClient();
                  setShowModal(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={!newClientName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        );

      case "newProject":
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Add New Project</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="border p-2 w-full rounded"
                placeholder="Enter project name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Client</label>
              <select
                value={newProjectClient}
                onChange={(e) => setNewProjectClient(parseInt(e.target.value))}
                className="border p-2 w-full rounded"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addProject();
                  setShowModal(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={!newProjectName.trim() || !newProjectClient}
              >
                Save
              </button>
            </div>
          </div>
        );

      case "newEntry":
        return (
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Add Time Entry</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Project</label>
              <select
                value={newEntryProject}
                onChange={(e) => setNewEntryProject(parseInt(e.target.value))}
                className="border p-2 w-full rounded"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({getClientName(project.id)})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={newEntryDescription}
                onChange={(e) => setNewEntryDescription(e.target.value)}
                className="border p-2 w-full rounded"
                placeholder="What did you work on?"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Duration (HH:MM:SS)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Hours"
                  className="border p-2 w-full rounded"
                  onChange={(e) => {
                    const hours = parseInt(e.target.value) || 0;
                    const minutes = Math.floor((elapsedTime % 3600) / 60);
                    const seconds = elapsedTime % 60;
                    setElapsedTime(hours * 3600 + minutes * 60 + seconds);
                  }}
                  value={Math.floor(elapsedTime / 3600)}
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Minutes"
                  className="border p-2 w-full rounded"
                  onChange={(e) => {
                    const hours = Math.floor(elapsedTime / 3600);
                    const minutes = parseInt(e.target.value) || 0;
                    const seconds = elapsedTime % 60;
                    setElapsedTime(hours * 3600 + minutes * 60 + seconds);
                  }}
                  value={Math.floor((elapsedTime % 3600) / 60)}
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="Seconds"
                  className="border p-2 w-full rounded"
                  onChange={(e) => {
                    const hours = Math.floor(elapsedTime / 3600);
                    const minutes = Math.floor((elapsedTime % 3600) / 60);
                    const seconds = parseInt(e.target.value) || 0;
                    setElapsedTime(hours * 3600 + minutes * 60 + seconds);
                  }}
                  value={elapsedTime % 60}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addTimeEntry();
                  setShowModal(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={
                  !newEntryProject || !newEntryDescription || elapsedTime <= 0
                }
              >
                Save
              </button>
            </div>
          </div>
        );

      case "editEntry":
        return (
          editingEntry && (
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4">Edit Time Entry</h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={editingEntry.date}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, date: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Project</label>
                <select
                  value={editingEntry.projectId}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      projectId: parseInt(e.target.value),
                    })
                  }
                  className="border p-2 w-full rounded"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({getClientName(project.id)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={editingEntry.description}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      description: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Duration (HH:MM:SS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Hours"
                    className="border p-2 w-full rounded"
                    value={Math.floor(editingEntry.duration / 3600)}
                    onChange={(e) => {
                      const hours = parseInt(e.target.value) || 0;
                      const minutes = Math.floor(
                        (editingEntry.duration % 3600) / 60,
                      );
                      const seconds = editingEntry.duration % 60;
                      setEditingEntry({
                        ...editingEntry,
                        duration: hours * 3600 + minutes * 60 + seconds,
                      });
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Minutes"
                    className="border p-2 w-full rounded"
                    value={Math.floor((editingEntry.duration % 3600) / 60)}
                    onChange={(e) => {
                      const hours = Math.floor(editingEntry.duration / 3600);
                      const minutes = parseInt(e.target.value) || 0;
                      const seconds = editingEntry.duration % 60;
                      setEditingEntry({
                        ...editingEntry,
                        duration: hours * 3600 + minutes * 60 + seconds,
                      });
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Seconds"
                    className="border p-2 w-full rounded"
                    value={editingEntry.duration % 60}
                    onChange={(e) => {
                      const hours = Math.floor(editingEntry.duration / 3600);
                      const minutes = Math.floor(
                        (editingEntry.duration % 3600) / 60,
                      );
                      const seconds = parseInt(e.target.value) || 0;
                      setEditingEntry({
                        ...editingEntry,
                        duration: hours * 3600 + minutes * 60 + seconds,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setShowModal(false);
                  }}
                  className="border px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveEditedEntry();
                    setShowModal(false);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          )
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-orange-500 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Freelance Time Tracker</h1>
          <div className="flex gap-2 items-center">
            <Clock size={20} />
            {activeTimer && (
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 text-white py-2">
        <div className="container mx-auto flex">
          <button
            onClick={() => setCurrentView("timesheet")}
            className={`px-4 py-2 ${currentView === "timesheet" ? "bg-gray-700" : ""}`}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Timesheet</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView("reports")}
            className={`px-4 py-2 ${currentView === "reports" ? "bg-gray-700" : ""}`}
          >
            <div className="flex items-center gap-2">
              <BarChart2 size={16} />
              <span>Reports</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView("billing")}
            className={`px-4 py-2 ${currentView === "billing" ? "bg-gray-700" : ""}`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>Billing</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView("clients")}
            className={`px-4 py-2 ${currentView === "clients" ? "bg-gray-700" : ""}`}
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>Clients</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView("projects")}
            className={`px-4 py-2 ${currentView === "projects" ? "bg-gray-700" : ""}`}
          >
            <div className="flex items-center gap-2">
              <Briefcase size={16} />
              <span>Projects</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto py-6">{renderView()}</main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <div></div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingEntry(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelanceTimeTracker;
