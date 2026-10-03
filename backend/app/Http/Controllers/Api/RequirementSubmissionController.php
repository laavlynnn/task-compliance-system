<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRequirementSubmissionRequest;
use App\Http\Resources\RequirementSubmissionResource;
use App\Models\Requirement;
use App\Models\RequirementSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RequirementSubmissionController extends Controller
{
    public function show(
        Request $request,
        Requirement $requirement
    ) {
        $user = $request->user();

        $requirement->load('task');

        if (
            $user->role === 'user' &&
            $requirement->task->assigned_to !== $user->id
        ) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $submission = RequirementSubmission::where(
            'requirement_id',
            $requirement->id
        )
            ->where('submitted_by', $user->id)
            ->with('submitter:id,name,email')
            ->latest()
            ->first();

        if (!$submission) {
            return response()->json([
                'message' => 'No submission found.'
            ], 404);
        }

        return response()->json([
            'submission' => new RequirementSubmissionResource($submission)
        ]);
    }

    public function store(
        StoreRequirementSubmissionRequest $request,
        Requirement $requirement
    ) {
        $user = $request->user();

        $requirement->load('task');

        if (
            $user->role === 'user' &&
            $requirement->task->assigned_to !== $user->id
        ) {
            return response()->json([
                'message' => 'You are not assigned to this task.'
            ], 403);
        }

        $validated = $request->validated();

        if (
            empty($validated['submission_text']) &&
            !$request->hasFile('file')
        ) {
            return response()->json([
                'message' => 'Please provide submission text or a file.'
            ], 422);
        }

        $existing = RequirementSubmission::where(
            'requirement_id',
            $requirement->id
        )
            ->where('submitted_by', $user->id)
            ->latest()
            ->first();

        if ($existing && $existing->status === 'Verified') {
            return response()->json([
                'message' => 'This requirement has already been verified.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Resubmit Rejected Submission
        |--------------------------------------------------------------------------
        */

        if ($existing && $existing->status === 'Rejected') {

            $filePath = $existing->file_path;

            if ($request->hasFile('file')) {

                if (
                    $existing->file_path &&
                    Storage::disk('public')->exists(
                        $existing->file_path
                    )
                ) {
                    Storage::disk('public')->delete(
                        $existing->file_path
                    );
                }

                $filePath = $request->file('file')
                    ->store(
                        'requirement-submissions',
                        'public'
                    );
            }

            $existing->update([
                'submission_text' =>
                    $validated['submission_text'] ?? null,
                'file_path' => $filePath,
                'status' => 'Submitted',
                'submitted_at' => now(),
                'verified_at' => null,
            ]);

            $existing->load([
                'requirement',
                'submitter:id,name,email'
            ]);

            return response()->json([
                'message' =>
                    'Requirement resubmitted successfully.',
                'submission' =>
                    new RequirementSubmissionResource($existing)
            ], 200);
        }

        /*
        |--------------------------------------------------------------------------
        | New Submission
        |--------------------------------------------------------------------------
        */

        $filePath = null;

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')
                ->store(
                    'requirement-submissions',
                    'public'
                );
        }

        $submission = RequirementSubmission::create([
            'requirement_id' => $requirement->id,
            'submitted_by' => $user->id,
            'submission_text' =>
                $validated['submission_text'] ?? null,
            'file_path' => $filePath,
            'status' => 'Submitted',
            'submitted_at' => now(),
        ]);

        $submission->load([
            'requirement',
            'submitter:id,name,email'
        ]);

        return response()->json([
            'message' =>
                'Requirement submitted successfully.',
            'submission' =>
                new RequirementSubmissionResource($submission)
        ], 201);
    }

    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' =>
                    'Only admins can view all submissions.'
            ], 403);
        }

        $query = RequirementSubmission::with([
            'requirement.task',
            'submitter:id,name,email'
        ]);

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        if ($request->filled('search')) {

            $search = $request->search;

            $query->where(function ($q) use ($search) {

                $q->where(
                    'submission_text',
                    'like',
                    "%{$search}%"
                )

                ->orWhereHas(
                    'submitter',
                    function ($userQuery) use ($search) {

                        $userQuery
                            ->where(
                                'name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'email',
                                'like',
                                "%{$search}%"
                            );
                    }
                )

                ->orWhereHas(
                    'requirement',
                    function ($requirementQuery) use ($search) {

                        $requirementQuery->where(
                            'name',
                            'like',
                            "%{$search}%"
                        );
                    }
                );
            });
        }

        $submissions = $query
            ->latest()
            ->paginate(10);

        return RequirementSubmissionResource::collection(
            $submissions
        );
    }

    public function verify(
        Request $request,
        RequirementSubmission $submission
    ) {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' =>
                    'Only admins can verify submissions.'
            ], 403);
        }

        if ($submission->status === 'Verified') {
            return response()->json([
                'message' =>
                    'Submission is already verified.'
            ], 422);
        }

        $submission->update([
            'status' => 'Verified',
            'verified_at' => now(),
        ]);

        $submission->load('requirement.task');

        $this->checkTaskCompletion(
            $submission->requirement->task
        );

        $submission->load([
            'requirement.task',
            'submitter:id,name,email'
        ]);

        return response()->json([
            'message' =>
                'Submission verified successfully.',
            'submission' =>
                new RequirementSubmissionResource($submission)
        ]);
    }

    public function reject(
        Request $request,
        RequirementSubmission $submission
    ) {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' =>
                    'Only admins can reject submissions.'
            ], 403);
        }

        $submission->update([
            'status' => 'Rejected',
            'verified_at' => null,
        ]);

        $submission->load([
            'requirement.task',
            'submitter:id,name,email'
        ]);

        return response()->json([
            'message' =>
                'Submission rejected successfully.',
            'submission' =>
                new RequirementSubmissionResource($submission)
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | View Submission File
    |--------------------------------------------------------------------------
    */

    public function file(
        Request $request,
        RequirementSubmission $submission
    ) {
        $user = $request->user();

        /*
        | Admins can view any submission file.
        | Normal users can only view their own file.
        */

        if (
            $user->role !== 'admin' &&
            (int) $submission->submitted_by !== (int) $user->id
        ) {
            return response()->json([
                'message' =>
                    'You are not authorized to view this file.'
            ], 403);
        }

        if (!$submission->file_path) {
            return response()->json([
                'message' =>
                    'No file was submitted.'
            ], 404);
        }

        if (
            !Storage::disk('public')->exists(
                $submission->file_path
            )
        ) {
            return response()->json([
                'message' =>
                    'File not found on the server.'
            ], 404);
        }

        return Storage::disk('public')->response(
            $submission->file_path
        );
    }

    private function checkTaskCompletion($task): void
    {
        $requiredRequirements = $task
            ->requirements()
            ->where('is_required', true)
            ->get();

        if ($requiredRequirements->isEmpty()) {
            return;
        }

        foreach ($requiredRequirements as $requirement) {

            $verified = $requirement
                ->submissions()
                ->where('status', 'Verified')
                ->exists();

            if (!$verified) {
                return;
            }
        }

        $task->update([
            'status' => 'Completed'
        ]);
    }
}