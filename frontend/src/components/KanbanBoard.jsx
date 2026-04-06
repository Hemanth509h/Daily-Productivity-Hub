import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Plus, Calendar, Tag, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';

const COLUMNS = [
  { id: 'pending', title: 'To Do', icon: <Circle className="w-4 h-4 text-slate-400" /> },
  { id: 'in_progress', title: 'In Progress', icon: <Clock className="w-4 h-4 text-blue-500" /> },
  { id: 'completed', title: 'Completed', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> }
];

const PriorityBadge = ({ priority }) => {
  const styles = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-emerald-100 text-emerald-700 border-emerald-200"
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${styles[priority] || styles.medium}`}>
      {priority?.toUpperCase()}
    </span>
  );
};

const TaskCard = ({ task, index }) => (
  <Draggable draggableId={String(task.id)} index={index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`kanban-task group ${snapshot.isDragging ? 'shadow-xl rotate-2 ring-2 ring-primary/20' : ''}`}
      >
        <div className="flex justify-between items-start mb-2">
          <PriorityBadge priority={task.priority} />
          <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        
        <h4 className="text-sm font-semibold text-slate-800 mb-1 line-clamp-2">{task.title}</h4>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
        
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100">
          {task.deadlineDate && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.deadlineDate).toLocaleDateString()}</span>
            </div>
          )}
          {task.subtasks?.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
            </div>
          )}
        </div>
      </div>
    )}
  </Draggable>
);

const KanbanBoard = ({ tasks = [], onTaskMove }) => {
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    onTaskMove(draggableId, destination.droppableId);
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6 h-full min-h-[calc(100vh-200px)]">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col w-80 shrink-0">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 text-sm">{column.title}</span>
                <span className="bg-slate-200/50 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
              <button className="p-1 hover:bg-slate-200/50 rounded-md transition-colors text-slate-400">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`kanban-column flex-1 transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-slate-100/80 outline-2 outline-dashed outline-slate-300' : ''
                  }`}
                >
                  <AnimatePresence mode="popLayout">
                    {getTasksByStatus(column.id).map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
