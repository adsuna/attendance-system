# Attendance Tracker

Visit [https://adsuna.github.io/attendance-system/](https://adsuna.github.io/attendance-system/) to use the Attendance Tracker.

**Warning**: This application uses local storage to save data. This means that it will not work across different browsers or devices. However, the data will persist across browser and device restarts as long as it is not manually cleared.

## Features

- **Manage Subjects**: Add and delete subjects for tracking.
- **Set Schedule**: Create a weekly schedule with specific classes and times.
- **Track Attendance**: Mark attendance for each class as "Attended", "Missed", or "No Class".
- **Attendance Summary**: View attendance percentages for each subject.
- **Responsive Design**: Works well on both desktop and mobile devices.
- **Dark Mode**: Automatically switches between light and dark themes based on system preferences.

## Instructions for Use

1. **Manage Subjects**: Navigate to the "Manage Subjects" page to add subjects you want to track.
2. **Set Schedule**: Go to the "Set Schedule" page to create your weekly class schedule. You can add classes with specific times.
3. **Track Attendance**: Use the dashboard to mark attendance for the current day. You can select the status for each class.
4. **View Attendance Summary**: Check the attendance summary on the dashboard to see your attendance percentages for each subject.

## Technologies Used

- HTML
- CSS
- JavaScript
- Local Storage
- Google Fonts (JetBrains Mono)

## Running Locally

To run this application locally, you need to serve it using a local server. Simply opening the HTML files in your browser will not work due to local storage restrictions.

### Using Python

If you have Python installed, you can run a simple HTTP server with the following command:

For Python 3:
```bash
python -m http.server 8000
```

### Using Node.js

If you have Node.js installed, you can use the `http-server` package:

1. Install `http-server`:
   ```bash
   npm install -g http-server
   ```

2. Navigate to your project directory and run:
   ```bash
   http-server
   ```

### Accessing the Application

Once the server is running, open your web browser and go to `http://localhost:8000` (or the port specified by your server) to access the Attendance Tracker.


## License

This project is licensed under the GPL 3.0 License - see the [LICENSE](LICENSE) file for details.
