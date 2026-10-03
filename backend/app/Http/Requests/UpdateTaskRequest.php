<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'assigned_to' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('users', 'id')->where(
                    fn ($query) => $query->where('role', 'user')
                ),
            ],
            'deadline' => ['sometimes', 'required', 'date'],
            'status' => [
                'sometimes',
                Rule::in([
                    'Pending',
                    'In Progress',
                    'Completed',
                    'Overdue'
                ]),
            ],
        ];
    }
}