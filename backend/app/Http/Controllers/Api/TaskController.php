<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        Task::whereDate('deadline', '<', now()->toDateString())
            ->where('status', '!=', 'Completed')
            ->where('status', '!=', 'Overdue')
            ->update(['status' => 'Overdue']);

        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $query = Task::with([
            'assignedUser:id,name,email',
            'creator:id,name,email',
            'requirements.submissions'
        ]);

        if ($user->role === 'user') {
            $query->where('assigned_to', $user->id);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->latest()->paginate($perPage);

        return TaskResource::collection($tasks);
    }

    public function store(StoreTaskRequest $request)
    {
        $validated = $request->validated();

        $validated['created_by'] = $request->user()->id;
        $validated['status'] = 'Pending';

        $task = Task::create($validated);

        $task->load([
            'assignedUser:id,name,email',
            'creator:id,name,email',
            'requirements'
        ]);

        return response()->json([
            'message' => 'Task created successfully.',
            'task' => new TaskResource($task)
        ], 201);
    }

    public function show(Request $request, Task $task)
    {
        $user = $request->user();

        if (
            $user->role === 'user' &&
            $task->assigned_to !== $user->id
        ) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $task->load([
            'assignedUser:id,name,email',
            'creator:id,name,email',
            'requirements.submissions.submitter:id,name,email'
        ]);

        return response()->json([
            'task' => new TaskResource($task)
        ]);
    }

    public function update(
        UpdateTaskRequest $request,
        Task $task
    ) {
        $validated = $request->validated();

        $task->update($validated);

        $task->load([
            'assignedUser:id,name,email',
            'creator:id,name,email',
            'requirements'
        ]);

        return response()->json([
            'message' => 'Task updated successfully.',
            'task' => new TaskResource($task)
        ]);
    }

    public function destroy(Request $request, Task $task)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admins can delete tasks.'
            ], 403);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.'
        ]);
    }
}