<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Recalculate overdue tasks whenever the dashboard is opened.
        // Completed tasks are never changed to Overdue.
        Task::whereDate('deadline', '<', now()->toDateString())
            ->where('status', '!=', 'Completed')
            ->where('status', '!=', 'Overdue')
            ->update(['status' => 'Overdue']);

        $user = $request->user();

        $query = Task::query();

        if ($user->role !== 'admin') {
            $query->where('assigned_to', $user->id);
        }

        return response()->json([
            'total_tasks' => (clone $query)->count(),
            'pending_tasks' => (clone $query)->where('status', 'Pending')->count(),
            'in_progress_tasks' => (clone $query)->where('status', 'In Progress')->count(),
            'completed_tasks' => (clone $query)->where('status', 'Completed')->count(),
            'overdue_tasks' => (clone $query)->where('status', 'Overdue')->count(),
        ]);
    }
}
