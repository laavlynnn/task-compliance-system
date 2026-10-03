<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRequirementRequest;
use App\Http\Requests\UpdateRequirementRequest;
use App\Http\Resources\RequirementResource;
use App\Models\Requirement;
use App\Models\Task;
use Illuminate\Http\Request;

class RequirementController extends Controller
{
    public function index(Request $request, Task $task)
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

        $requirements = $task->requirements()
            ->with('submissions.submitter:id,name,email')
            ->latest()
            ->get();

        return response()->json([
            'task' => $task->only([
                'id',
                'title',
                'description',
                'deadline',
                'status'
            ]),
            'requirements' => RequirementResource::collection($requirements)
        ]);
    }

    public function store(
        StoreRequirementRequest $request,
        Task $task
    ) {
        $validated = $request->validated();

        $validated['task_id'] = $task->id;

        $requirement = Requirement::create($validated);

        return response()->json([
            'message' => 'Requirement created successfully.',
            'requirement' => new RequirementResource($requirement)
        ], 201);
    }

    public function show(
        Request $request,
        Requirement $requirement
    ) {
        $user = $request->user();

        $requirement->load([
            'task',
            'submissions.submitter:id,name,email'
        ]);

        if (
            $user->role === 'user' &&
            $requirement->task->assigned_to !== $user->id
        ) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        return response()->json([
            'requirement' => new RequirementResource($requirement)
        ]);
    }

    public function update(
        UpdateRequirementRequest $request,
        Requirement $requirement
    ) {
        $validated = $request->validated();

        $requirement->update($validated);

        $requirement->load([
            'task',
            'submissions.submitter:id,name,email'
        ]);

        return response()->json([
            'message' => 'Requirement updated successfully.',
            'requirement' => new RequirementResource($requirement)
        ]);
    }

    public function destroy(
        Request $request,
        Requirement $requirement
    ) {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only admins can delete requirements.'
            ], 403);
        }

        $requirement->delete();

        return response()->json([
            'message' => 'Requirement deleted successfully.'
        ]);
    }
}