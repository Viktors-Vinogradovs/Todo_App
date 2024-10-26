import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import './App.css';

function App() {
    const [tasks, setTasks] = useState([]);
    const [tasksByDate, setTasksByDate] = useState({});
    const [inputValue, setInputValue] = useState('');
    const [date, setDate] = useState(new Date());

    const handleInputChange = (event) => setInputValue(event.target.value);

    const addTask = () => {
        if (inputValue.trim()) {
            setTasks([...tasks, inputValue]);
            setInputValue('');
        }
    };

    const onDragStart = (event, task, source) => {
        event.dataTransfer.setData('task', task);
        event.dataTransfer.setData('source', source);
        if (source === 'calendar') {
            event.dataTransfer.setData('date', event.target.dataset.date);
        }
    };

    const onDrop = (event, date) => {
        const task = event.dataTransfer.getData('task');
        const source = event.dataTransfer.getData('source');

        if (source === 'todo') {
            setTasks(tasks.filter((t) => t !== task));
        } else if (source === 'calendar') {
            const oldDate = event.dataTransfer.getData('date');
            setTasksByDate((prev) => {
                const updatedTasksByDate = {
                    ...prev,
                    [oldDate]: prev[oldDate]?.filter((t) => t !== task) || [],
                };
                if (!updatedTasksByDate[oldDate].length) delete updatedTasksByDate[oldDate];
                return updatedTasksByDate;
            });
        }

        setTasksByDate((prev) => ({
            ...prev,
            [date]: [...(prev[date] || []), task],
        }));
    };

    const onDropBackToTodo = (event) => {
        const task = event.dataTransfer.getData('task');
        const date = event.dataTransfer.getData('date');

        setTasks([...tasks, task]);
        setTasksByDate((prev) => {
            const updatedTasksByDate = {
                ...prev,
                [date]: prev[date]?.filter((t) => t !== task) || [],
            };
            if (!updatedTasksByDate[date].length) delete updatedTasksByDate[date];
            return updatedTasksByDate;
        });
    };

    const deleteTask = (task) => setTasks(tasks.filter((t) => t !== task));

    const renderTasksForDate = (date) => {
        const dateKey = date.toDateString();
        return tasksByDate[dateKey]?.map((task, index) => (
            <div
                key={index}
                className="task-item"
                draggable
                onDragStart={(event) => onDragStart(event, task, 'calendar')}
                onDragOver={(event) => event.preventDefault()}
                data-date={dateKey}
            >
                {task}
            </div>
        ));
    };

    return (
        <div className="app">
            <div
                className="todo-container"
                onDrop={onDropBackToTodo}
                onDragOver={(event) => event.preventDefault()}
            >
                <h1>To-Do List</h1>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Add a new task"
                />
                <button onClick={addTask}>Add</button>

                <ul>
                    {tasks.map((task, index) => (
                        <li
                            key={index}
                            draggable
                            onDragStart={(event) => onDragStart(event, task, 'todo')}
                            className="task-item"
                        >
                            {task}
                            <button onClick={() => deleteTask(task)} className="delete-btn">
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="calendar-container">
                <Calendar
                    onChange={setDate}
                    value={date}
                    tileContent={({ date }) => (
                        <div
                            onDrop={(event) => onDrop(event, date.toDateString())}
                            onDragOver={(event) => event.preventDefault()}
                            className="date-drop-zone"
                        >
                            {renderTasksForDate(date)}
                        </div>
                    )}
                />
            </div>
        </div>
    );
}

export default App;