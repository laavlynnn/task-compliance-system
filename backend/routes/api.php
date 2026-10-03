<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\RequirementController;
use App\Http\Controllers\Api\RequirementSubmissionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);


    /*
    |--------------------------------------------------------------------------
    | Profile
    |--------------------------------------------------------------------------
    */

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);


    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', [DashboardController::class, 'index']);


    /*
    |--------------------------------------------------------------------------
    | Tasks
    |--------------------------------------------------------------------------
    */

    // View tasks
    Route::get('/tasks', [TaskController::class, 'index']);

    // View a single task
    Route::get('/tasks/{task}', [TaskController::class, 'show']);


    /*
    |--------------------------------------------------------------------------
    | Requirements
    |--------------------------------------------------------------------------
    */

    // View requirements of a task
    Route::get(
        '/tasks/{task}/requirements',
        [RequirementController::class, 'index']
    );

    // View a single requirement
    Route::get(
        '/requirements/{requirement}',
        [RequirementController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | Requirement Submissions
    |--------------------------------------------------------------------------
    */

    // View current user's submission
    Route::get(
        '/requirements/{requirement}/submission',
        [RequirementSubmissionController::class, 'show']
    );

    // Submit or resubmit a requirement
    Route::post(
        '/requirements/{requirement}/submission',
        [RequirementSubmissionController::class, 'store']
    );

    // View submitted file
    Route::get(
        '/submissions/{submission}/file',
        [RequirementSubmissionController::class, 'file']
    );


    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('admin')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Users
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/users',
            [UserController::class, 'index']
        );

        Route::get(
            '/users/{user}',
            [UserController::class, 'show']
        );

        Route::put(
            '/users/{user}',
            [UserController::class, 'update']
        );

        Route::delete(
            '/users/{user}',
            [UserController::class, 'destroy']
        );


        /*
        |--------------------------------------------------------------------------
        | Tasks - Admin
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/tasks',
            [TaskController::class, 'store']
        );

        Route::put(
            '/tasks/{task}',
            [TaskController::class, 'update']
        );

        Route::delete(
            '/tasks/{task}',
            [TaskController::class, 'destroy']
        );


        /*
        |--------------------------------------------------------------------------
        | Requirements - Admin
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/tasks/{task}/requirements',
            [RequirementController::class, 'store']
        );

        Route::put(
            '/requirements/{requirement}',
            [RequirementController::class, 'update']
        );

        Route::delete(
            '/requirements/{requirement}',
            [RequirementController::class, 'destroy']
        );


        /*
        |--------------------------------------------------------------------------
        | Submission Management - Admin
        |--------------------------------------------------------------------------
        */

        // View all submissions
        Route::get(
            '/submissions',
            [RequirementSubmissionController::class, 'index']
        );

        // Verify submission
        Route::put(
            '/submissions/{submission}/verify',
            [RequirementSubmissionController::class, 'verify']
        );

        // Reject submission
        Route::put(
            '/submissions/{submission}/reject',
            [RequirementSubmissionController::class, 'reject']
        );
    });
});