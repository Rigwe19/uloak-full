<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ActivityLog::with('user');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('description', 'like', '%' . $request->action . '%');
        }

        if ($from = $request->input('from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->input('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $logs = $query->latest('created_at')
            ->paginate(50)
            ->through(function (ActivityLog $log) {
                $actor = $log->user
                    ? [
                        'type' => 'user',
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ]
                    : [
                        'type' => 'guest',
                        'name' => $log->properties['guest_name'] ?? ($log->properties['name'] ?? 'Guest'),
                        'email' => $log->properties['guest_email'] ?? ($log->properties['email'] ?? null),
                    ];

                return [
                    'id' => $log->id,
                    'actor' => $actor,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at,
                    'properties' => $log->properties,
                ];
            });

        return Inertia::render('admin/activity-logs', [
            'title' => 'Activity Logs - Uloak',
            'logs' => $logs,
            'filters' => $request->only(['search', 'user_id', 'action', 'from', 'to']),
        ]);
    }
}