# Forward 🚀

**Forward** is a modern task management and agenda application designed to maximize your daily productivity. It combines a traditional to-do list with a structured agenda and a backlog board (timeless) to capture all your ideas.

![Focus View](docs/images/focus_view.png)

## 🌟 Key Features

### 1. Daily Focus (My Day) 🎯
The main view helps you manage your current day with two clear sections:
- **Agenda (With Time)**: Visualize your commitments and tasks with specific schedules on a vertical timeline.
- **Tasks of the Day (To-Do)**: A flexible list for tasks that must be done today but without a fixed schedule.

### 2. Monthly Planning (Calendar) 📅
- A complete calendar view to organize your month.
- Visualize daily workload with indicators for pending tasks (dots) and completed tasks (squares).
- Fluid navigation between months and quick access to the detail of any day.

![Calendar View](docs/images/calendar_view.png)

### 3. Timeless Management (Backlog & Ideas) ♾️
A dedicated space for everything without a specific date:
- **Customizable Columns**: Create categories like "Ideas", "Work", "Personal Projects", etc.
- **Flexible Workflow**: Move tasks from the backlog to your daily agenda when you are ready to execute them.
- **Archive**: Keep your board clean by archiving completed columns or tasks without losing history.

![Timeless View](docs/images/timeless_view.png)

### 4. Powerful Task Creation ✨
An intuitive modal to capture tasks in full detail:
- **Checklists**: Divide large tasks into manageable sub-items.
- **Categorization**: Assign colors and categories for visual organization.
- **Dates and Times**: Schedule tasks for a specific day or leave them in the backlog.

![Create Task](docs/images/task_creation_modal.png)

## 🛠️ Technologies

This project is built with a modern and efficient stack:

- **Frontend**: [Vue.js 3](https://vuejs.org/) (Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/) - For ultra-fast development.
- **Styles**: [Tailwind CSS](https://tailwindcss.com/) - Key responsive and customizable design.
- **State**: [Pinia](https://pinia.vuejs.org/) - Reactive state management.
- **Backend / Persistence**: [Firebase](https://firebase.google.com/) (Firestore) - Real-time data storage.

## 🚀 Installation and Execution

Follow these steps to run the project locally:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository>
    cd forward
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Ensure you have your Firebase project configured. Create a `.env` file in the root if necessary (consult `.env.example`).

4.  **Start development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the port indicated in the console).

## 🚧 Project Status

Currently, the **Frontend** is complete with all logical and user interface functionalities.
- ✅ Complete task management (CRUD).
- ✅ Day, Calendar, and Backlog views.
- ✅ Data persistence with Firebase.

**Pending:**
- 🔄 Dedicated backend for push notification system (Mobile/Desktop).

---
*Made with ❤️ to organize your life.*
