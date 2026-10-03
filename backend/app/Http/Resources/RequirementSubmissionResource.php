<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequirementSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'requirement_id' => $this->requirement_id,
            'submitted_by' => $this->submitted_by,
            'submission_text' => $this->submission_text,
            'file_path' => $this->file_path,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at,
            'verified_at' => $this->verified_at,
            'requirement' => $this->whenLoaded('requirement'),
            'submitter' => $this->whenLoaded('submitter'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}