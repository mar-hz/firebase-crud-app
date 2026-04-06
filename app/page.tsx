'use client'
import { useEffect, useState } from 'react'
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from './firebase/firebase.config';

type Item = {
  id: string;
  title: string;
  description: string;
  course: string;
  isCompleted: boolean;
};

export default function Home() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetchItems()
  }, [])
  
  const handleAdd = async () => {
    if (!title.trim()) return;
    await addDoc(collection(db, 'items'), { title, description, course, isCompleted });
    setTitle('');
    setDescription('');
    setCourse('');
    setIsCompleted(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    await deleteDoc(doc(db, 'items', id));
    fetchItems();
  };

  const handleEdit = async (id: string, currentName: string) => {
    const editValue = prompt('Enter the new name', currentName);
    if (!editValue?.trim()) return;
    await updateDoc(doc(db, 'items', id), { name: editValue });
    fetchItems();
  };

  const handleToggleComplete = async (id: string, currentValue: boolean) => {
    await updateDoc(doc(db, 'items', id), { isCompleted: !currentValue });
    fetchItems();
  };

  const fetchItems = async () => {
    const snapshot = await getDocs(collection(db, 'items'));
    setItems(snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        course: data.course || '',
        isCompleted: Boolean(data.isCompleted),
      };
    }));
  };

  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-3xl font-bold mb-6">Organizador de Tareas</h1>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          className="border-2 px-3 py-2 rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          className="border-2 px-3 py-2 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          className="border-2 px-3 py-2 rounded"
          placeholder="Course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
          Completed
        </label>

        <button
          className="border p-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleAdd}
        >
          Agregar
        </button>
      </div>

      <ul className="space-y-3 mt-8">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 rounded border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={item.isCompleted ? 'line-through text-gray-500 text-lg font-semibold' : 'text-lg font-semibold'}>
                {item.title}
              </p>
              <p className="text-sm text-gray-700">{item.course}</p>
              <p className="text-gray-400">{item.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => handleToggleComplete(item.id, item.isCompleted)}
                />
                Completed
              </label>
              <button
                className="border px-3 py-1 rounded bg-indigo-600 text-white"
                onClick={() => handleEdit(item.id, item.title)}
              >
                Edit
              </button>
              <button
                className="border px-3 py-1 rounded bg-red-500 text-white"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}