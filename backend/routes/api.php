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

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);

    Route::get(
        '/tasks/{task}/requirements',
        [RequirementController::class, 'index']
    );

    Route::get(
        '/requirements/{requirement}',
        [RequirementController::class, 'show']
    );

    Route::get(
        '/requirements/{requirement}/submission',
        [RequirementSubmissionController::class, 'show']
    );

    Route::post(
        '/requirements/{requirement}/submission',
        [RequirementSubmissionController::class, 'store']
    );

    Route::middleware('admin')->group(function () {

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

        Route::get(
            '/submissions',
            [RequirementSubmissionController::class, 'index']
        );

        Route::put(
            '/submissions/{submission}/verify',
            [RequirementSubmissionController::class, 'verify']
        );

        Route::put(
            '/submissions/{submission}/reject',
            [RequirementSubmissionController::class, 'reject']
        );
    });
});