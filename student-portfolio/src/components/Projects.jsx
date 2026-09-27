import { useCallback, useEffect, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from '../api';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [notice, setNotice] = useState(null);

  const loadTasks = useCallback(async (showNotice = false) => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await getTasks();
      setTasks(data);
      if (showNotice) setNotice({ type: 'success', message: 'Task list refreshed.' });
    } catch (error) {
      setLoadError(error.message);
      if (showNotice) setNotice({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getTasks()
      .then((data) => {
        if (active) setTasks(data);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function handleCreate(event) {
    event.preventDefault();
    const taskInput = { title: title.trim(), description: description.trim() };
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticTask = {
      ...taskInput,
      _id: optimisticId,
      completed: false,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setCreating(true);
    setNotice(null);
    setTasks((currentTasks) => [optimisticTask, ...currentTasks]);

    try {
      const savedTask = await createTask(taskInput);
      setTasks((currentTasks) => currentTasks.map((task) => (
        task._id === optimisticId ? savedTask : task
      )));
      setTitle('');
      setDescription('');
      setNotice({ type: 'success', message: 'Task created.' });
    } catch (error) {
      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== optimisticId));
      setNotice({ type: 'error', message: error.message });
    } finally {
      setCreating(false);
    }
  }

  async function saveTask(taskId, updates, successMessage) {
    setSavingId(taskId);
    try {
      const updatedTask = await updateTask(taskId, updates);
      setTasks((currentTasks) => currentTasks.map((task) => (
        task._id === taskId ? updatedTask : task
      )));
      setEditingId(null);
      setNotice({ type: 'success', message: successMessage });
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    } finally {
      setSavingId(null);
    }
  }

  function beginEdit(task) {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  }

  async function handleEdit(event, taskId) {
    event.preventDefault();
    await saveTask(taskId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
    }, 'Task updated.');
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;

    setDeletingId(task._id);
    try {
      await deleteTask(task._id);
      setTasks((currentTasks) => currentTasks.filter((item) => item._id !== task._id));
      setNotice({ type: 'success', message: 'Task deleted.' });
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    } finally {
      setDeletingId(null);
    }
  }

  const busy = savingId !== null || deletingId !== null;
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <section className="page-section task-page">
      <header className="task-heading">
        <div>
          <p className="eyebrow">Practical 6 / Full-stack workspace</p>
          <h2>Task manager</h2>
          <p className="section-intro">Your tasks are saved to MongoDB through the Express API.</p>
        </div>
        <div className="task-count" aria-label={`${completedCount} of ${tasks.length} tasks complete`}>
          <strong>{String(completedCount).padStart(2, '0')}</strong>
          <span>of {String(tasks.length).padStart(2, '0')} complete</span>
        </div>
      </header>

      <form className="task-form" onSubmit={handleCreate}>
        <div className="task-form-heading">
          <div>
            <span className="task-kicker">New item</span>
            <h3>Add a task</h3>
          </div>
          <span className={`api-status${loadError ? ' disconnected' : ''}`}>
            <span /> {loading ? 'Checking API…' : loadError ? 'API unavailable' : 'API connected'}
          </span>
        </div>
        <label htmlFor="new-task-title">Title</label>
        <input
          id="new-task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to get done?"
          maxLength={120}
          required
          disabled={creating || loading}
        />
        <label htmlFor="new-task-description">Description <span>(optional)</span></label>
        <textarea
          id="new-task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add a little context"
          rows="2"
          maxLength={500}
          disabled={creating || loading}
        />
        <div className="task-form-actions">
          <span>New tasks appear immediately while they save.</span>
          <button className="task-primary-button" type="submit" disabled={creating || loading || !title.trim()}>
            {creating ? 'Saving task…' : 'Add task'}
          </button>
        </div>
      </form>

      <div className="task-list-heading">
        <div>
          <span className="task-kicker">MongoDB collection</span>
          <h3>Your tasks <span>{tasks.length}</span></h3>
        </div>
        <button type="button" className="task-text-button" onClick={() => loadTasks(true)} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh list'}
        </button>
      </div>

      {loadError && (
        <div className="task-load-error" role="alert">
          <span>{loadError}</span>
          <button type="button" className="task-text-button" onClick={() => loadTasks(true)} disabled={loading}>
            Try again
          </button>
        </div>
      )}

      {loading && tasks.length === 0 ? (
        <div className="task-status" role="status"><span className="spinner" />Loading tasks from the API…</div>
      ) : tasks.length === 0 && !loadError ? (
        <div className="task-empty"><span>01</span><p>No tasks yet. Add one above to get started.</p></div>
      ) : (
        <div className="task-list" aria-busy={loading}>
          {tasks.map((task) => (
            <article className={`task-row${task.completed ? ' is-complete' : ''}`} key={task._id}>
              {editingId === task._id ? (
                <form className="task-edit-form" onSubmit={(event) => handleEdit(event, task._id)}>
                  <label className="sr-only" htmlFor={`edit-title-${task._id}`}>Task title</label>
                  <input
                    id={`edit-title-${task._id}`}
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    required
                    maxLength={120}
                  />
                  <label className="sr-only" htmlFor={`edit-description-${task._id}`}>Task description</label>
                  <textarea
                    id={`edit-description-${task._id}`}
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    rows="2"
                    maxLength={500}
                  />
                  <div className="task-row-actions">
                    <button className="task-primary-button compact" type="submit" disabled={savingId === task._id || !editTitle.trim()}>
                      {savingId === task._id ? 'Saving…' : 'Save'}
                    </button>
                    <button className="task-text-button" type="button" onClick={() => setEditingId(null)} disabled={savingId === task._id}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <label className="task-check-wrap" htmlFor={`complete-${task._id}`}>
                    <input
                      id={`complete-${task._id}`}
                      type="checkbox"
                      checked={Boolean(task.completed)}
                      onChange={() => saveTask(task._id, { completed: !task.completed }, task.completed ? 'Task marked active.' : 'Task completed.')}
                      disabled={busy || task.pending}
                    />
                    <span className="task-check" aria-hidden="true" />
                  </label>
                  <div className="task-copy">
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                    <span className="task-date">
                      {task.pending ? 'Saving to database…' : `Added ${new Date(task.createdAt).toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="task-row-actions">
                    <button type="button" className="task-text-button" onClick={() => beginEdit(task)} disabled={busy || task.pending}>
                      Edit
                    </button>
                    <button type="button" className="task-text-button danger" onClick={() => handleDelete(task)} disabled={busy || task.pending}>
                      {deletingId === task._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}

      {notice && (
        <div className={`task-toast ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button>
        </div>
      )}
    </section>
  );
}
