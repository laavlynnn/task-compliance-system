<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\RequirementSubmission;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $totalTasks = Task::count();

            $completedTasks = Task::where('status', 'Completed')->count();

            $pendingTasks = Task::whereIn('status', [
                'Pending',
                'In Progress'
            ])->count();

            return response()->json([
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'pending_tasks' => $pendingTasks,
            ]);
        }

        $totalTasks = Task::where('assigned_to', $user->id)->count();

        $completedTasks = Task::where('assigned_to', $user->id)
            ->where('status', 'Completed')
            ->count();

        $pendingTasks = Task::where('assigned_to', $user->id)
            ->whereIn('status', [
                'Pending',
                'In Progress'
            ])
            ->count();

        return response()->json([
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'pending_tasks' => $pendingTasks,
        ]);
    }
}