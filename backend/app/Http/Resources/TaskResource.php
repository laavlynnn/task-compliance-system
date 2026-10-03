<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'assigned_to' => $this->assigned_to,
            'created_by' => $this->created_by,
            'deadline' => $this->deadline,
            'status' => $this->status,
            'assigned_user' => $this->whenLoaded('assignedUser'),
            'creator' => $this->whenLoaded('creator'),
            'requirements' => $this->whenLoaded('requirements'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}