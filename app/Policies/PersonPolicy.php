<?php

namespace App\Policies;

use App\Models\Person;
use App\Models\User;

class PersonPolicy
{
    public function view(?User $user, Person $person): bool
    {
        $permission = $person->permissions()
            ->where('ability', 'view')
            ->where(function ($q) {
                $q->where('grantee_type', 'public')
                    ->orWhere('grantee_type', 'family');
            })
            ->where('allowed', true)
            ->exists();

        if ($permission) {
            return true;
        }

        if ($user === null) {
            return false;
        }

        if ($person->user_id === $user->id) {
            return true;
        }

        return $person->permissions()
            ->where('ability', 'view')
            ->where('grantee_type', 'user')
            ->where('grantee_id', $user->id)
            ->where('allowed', true)
            ->exists();
    }

    public function edit(User $user, Person $person): bool
    {
        if ($person->user_id === $user->id) {
            return true;
        }

        return $person->permissions()
            ->where('ability', 'edit')
            ->where('grantee_type', 'user')
            ->where('grantee_id', $user->id)
            ->where('allowed', true)
            ->exists();
    }

    public function upload(User $user, Person $person): bool
    {
        return $this->edit($user, $person);
    }

    public function managePermissions(User $user, Person $person): bool
    {
        if ($person->user_id === $user->id) {
            return true;
        }

        return $person->permissions()
            ->where('ability', 'edit')
            ->where('grantee_type', 'user')
            ->where('grantee_id', $user->id)
            ->where('allowed', true)
            ->exists();
    }

    public function delete(User $user, Person $person): bool
    {
        return $person->user_id === $user->id;
    }

    public function viewActivity(User $user, Person $person): bool
    {
        return $this->edit($user, $person);
    }

    public function export(User $user, Person $person): bool
    {
        return $this->edit($user, $person);
    }
}
