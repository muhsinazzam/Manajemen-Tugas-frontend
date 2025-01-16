'use client'
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

function TaskApp() {
  const [tasks, setTasks] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskDeadline, setEditTaskDeadline] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const people = [
    {
      id: 1,
      name: 'Tampilkan semua'
      
    },
    {
      id: 2,
      name: 'Tugas Selesai'
    },
    {
      id: 3,
      name: 'Tugas Belum Selesai'
    },
  ]
  const [selected, setSelected] = useState(people[0]);
  const filterTasks = useCallback(() => {
    let filtered = tasks;
  
    if (selected.name === 'Tugas Selesai') {
      filtered = tasks.filter(task => task.status === 'Selesai');
    } else if (selected.name === 'Tugas Belum Selesai') {
      filtered = tasks.filter(task => task.status !== 'Selesai');
    }
  
    setFilteredTasks(filtered);
  }, [tasks, selected]);
  
  useEffect(() => {
    filterTasks();
  }, [tasks, selected, filterTasks]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const checkDeadlines = useCallback(() => {
    const now = new Date();
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.status === 'Selesai') return task; // Skip tasks marked as completed
        const deadline = new Date(task.deadline);
        const timeDifference = deadline - now;

        if (timeDifference <= 0) {
          return { ...task, status: 'Deadline Habis' };
        } else if (timeDifference > 0 && timeDifference <= 60000) { // Less than 1 minute
          return { ...task, status: `${Math.ceil(timeDifference / 1000)} detik tersisa` };
        } else {
          return { ...task, status: formatDistanceToNow(deadline, { addSuffix: true }) };
        }
      })
    );
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(checkDeadlines, 1000); // Check deadlines every second for live updates
    return () => clearInterval(interval);
  }, [checkDeadlines]);

  const addTask = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/tasks', { subject: subjectName, name: taskName, deadline: taskDeadline });
      setTasks([...tasks, response.data]);
      setSubjectName('');
      setTaskName('');
      setTaskDeadline('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/tasks/${id}`, { subject: editSubjectName, name: editTaskName, deadline: editTaskDeadline });
      setTasks(tasks.map(task => (task.id === id ? response.data : task)));
      setEditTaskId(null);
      setEditSubjectName('');
      setEditTaskName('');
      setEditTaskDeadline('');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const completeTask = async (id) => {
    try {
      setTasks(tasks.map(task => (task.id === id ? { ...task, status: 'Selesai' } : task)));
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-r from-blue-50 to-gray-100 min-h-screen">
      <header className="bg-blue-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kelompok 1</h1>
        <span>📅 Tanggal sekarang: {new Date().toLocaleDateString()}</span>
      </header>

      <h2 className="text-4xl font-extrabold text-center text-gray-800 my-8 drop-shadow-lg">Management Tugas Kuliah</h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          <input
            type="text"
            placeholder="Nama Mata Kuliah"
            className="border px-4 py-2 rounded-md focus:ring focus:ring-blue-300"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nama Tugas"
            className="border px-4 py-2 rounded-md focus:ring focus:ring-blue-300"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <input
            type="datetime-local"
            className="border px-4 py-2 rounded-md focus:ring focus:ring-blue-300"
            value={taskDeadline}
            onChange={(e) => setTaskDeadline(e.target.value)}
          />
          <Listbox value={selected} onChange={(value) => setSelected(value)}>
  <div className="relative mt-2">
    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-4 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm">
      <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
        <span className="block truncate">{selected.name}</span>
      </span>
    </ListboxButton>

    <ListboxOptions
      className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none"
    >
      {people.map((person) => (
        <ListboxOption
          key={person.id}
          value={person}
          className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
        >
          <div className="flex items-center">
            <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
              {person.name}
            </span>
          </div>

          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white"></span>
        </ListboxOption>
      ))}
    </ListboxOptions>
  </div>
</Listbox>

        </div>
        <button
          onClick={addTask}
          className="bg-gradient-to-r from-green-400 to-green-600 text-white px-5 py-2 rounded-lg shadow-md hover:from-green-500 hover:to-green-700"
        >
          + Tambah Tugas
        </button>
      </div>

      <table className="table-auto w-full bg-white rounded-lg shadow-xl">
        <thead>
          <tr className="bg-blue-200">
            <th className="px-6 py-3 text-left text-gray-700 font-semibold">Nama Mata Kuliah</th>
            <th className="px-6 py-3 text-left text-gray-700 font-semibold">Judul Tugas</th>
            <th className="px-6 py-3 text-left text-gray-700 font-semibold">Deadline</th>
            <th className="px-6 py-3 text-left text-gray-700 font-semibold">Waktu Tersisa</th>
            <th className="px-6 py-3 text-left text-gray-700 font-semibold">Tindakan</th>
          </tr>
        </thead>
        <tbody>
  {filteredTasks.map((task) => (
    <tr key={task.id} className="hover:bg-blue-50 transition-colors">
      {editTaskId === task.id ? (
        <>
          <td className="border px-6 py-3 text-gray-800">
            <input
              type="text"
              className="border px-4 py-2 rounded-md focus:ring focus:ring-blue-300"
              value={editSubjectName}
              onChange={(e) => setEditSubjectName(e.target.value)}
            />
          </td>
          <td className="border px-6 py-3 text-gray-800">
            <input
              type="text"
              className="border px-4 py-2 rounded-md focus:ring focus:ring-blue-300"
              value={editTaskName}
              onChange={(e) => setEditTaskName(e.target.value)}
            />
          </td>
          <td className="border px-6 py-3 text-gray-800">
            <input
              type="datetime-local"
              className="border px-4 py-2 rounded-md focus:ring focus:ring-blue-300"
              value={editTaskDeadline}
              onChange={(e) => setEditTaskDeadline(e.target.value)}
            />
          </td>
          <td className="border px-6 py-3 text-gray-800">-</td>
          <td className="border px-6 py-3 flex space-x-4">
            <button
              onClick={() => updateTask(task.id)}
              className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setEditTaskId(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </td>
        </>
      ) : (
        <>
          <td className="border px-6 py-3 text-gray-800">{task.subject}</td>
          <td className="border px-6 py-3 text-gray-800">{task.name}</td>
          <td className="border px-6 py-3 text-gray-800">{task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd HH:mm') : ''}</td>
          <td className="border px-6 py-3 text-gray-800">
            {task.status || 'Tidak ada deadline'}
          </td>
          <td className="border px-6 py-3 flex space-x-4">
            <button
              onClick={() => completeTask(task.id)}
              className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
            >
              Selesai
            </button>
            <button
              onClick={() => {
                setEditTaskId(task.id);
                setEditSubjectName(task.subject);
                setEditTaskName(task.name);
                setEditTaskDeadline(task.deadline);
              }}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600"
            >
              Delete
            </button>
          </td>
        </>
      )}
    </tr>
  ))}
</tbody>

      </table>

      <footer className="bg-gray-800 text-white text-center py-4 mt-8">
        © 2025 Kelompok 1
      </footer>
    </div>
  );
}
export default TaskApp;
