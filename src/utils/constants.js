const HTTP_STATUS = {
  200: {
    status: "200",
    message: "Success",
  },
  400: {
    status: "400",
    message: "Bad Request",
  },
  401: {
    status: "401",
    message: "Unauthorized, Try logging in again",
  },
  403: {
    status: "403",
    message: "Forbidden",
  },
  404: {
    status: "404",
    message: "Not Found",
  },
  500: {
    status: "500",
    message: "Internal Server Error",
  },
};

const USER_TYPES = {
  ADMINISTRATOR: 1 << 0,
  SUPPORT_TEAM: 1 << 1,
  FACULTY_COORDINATOR: 1 << 2,
  STUDENT_COORDINATOR: 1 << 3,
};

const ROUND_STATUS = {
  SCHEDULED: 1,
  ONGOING: 2,
  COMPLETED: 3,
};

const COMMANDS = [
  { emoji: "🍕", name: "pizza" },
  { emoji: "🍺", name: "beer" },
  { emoji: "💩", name: "poo" },
  { emoji: "✅", name: "tick" },
  { emoji: "👍", name: "thumbs" },
  { emoji: "👋", name: "bye" },
  { emoji: "👂", name: "listen" },
];

module.exports = {
  HTTP_STATUS,
  USER_TYPES,
  ROUND_STATUS,
  COMMANDS,
};
