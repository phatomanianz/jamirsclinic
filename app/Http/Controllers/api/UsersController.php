<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\User;
use App\Personnel;
use App\Rules\MatchCurrentPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    public function index()
    {
        $data = request()->validate([
            'role' => ['bail', 'string', Rule::in(['admin', 'doctor', 'receptionist'])],
            'per_page' => ['bail', 'numeric'],
            'order_by' => ['bail', 'string', Rule::in(['id', 'name', 'email', 'address', 'phone'])],
            'order_direction' => ['bail', 'string', Rule::in(['asc', 'desc'])],
            'search' => ['string']
        ]);

        $role = $data['role'] ?? null;
        $per_page = isset($data['per_page']) ? (int) $data['per_page'] : 10;
        $order_by = $data['order_by'] ?? null;
        $order_direction = $data['order_direction'] ?? 'desc';
        $search = $data['search'] ?? null;

        $users = Personnel::join('accounts', 'personnels.account_id', '=', 'accounts.id')
            ->select('personnels.id', 'personnels.image', 'personnels.name', 'personnels.address', 'personnels.phone', 'accounts.email')
            ->whereNull('accounts.deleted_at')
            ->when($role, function ($query, $role) {
                return $query->where('accounts.role', $role);
            }, function ($query) {
                return $query->whereNotIn('accounts.role', ['patient']);
            })
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('personnels.id', 'like', '%' . $search . '%')
                        ->orWhere('personnels.name', 'like', '%' . $search . '%')
                        ->orWhere('personnels.address', 'like', '%' . $search . '%')
                        ->orWhere('personnels.phone', 'like', '%' . $search . '%')
                        ->orWhere('accounts.email', 'like', '%' . $search . '%');
                });
            })
            ->when($order_by, function ($query, $order_by) use ($order_direction) {
                if ($order_by === 'email') {
                    return $query->orderBy('accounts.' . $order_by, $order_direction);
                } else {
                    return $query->orderBy('personnels.' . $order_by, $order_direction);
                }
            }, function ($query) {
                return $query->orderBy('personnels.id', 'desc');
            })
            ->paginate($per_page);

        foreach ($users->items() as $index => $user) {
            $users->items()[$index]->image = asset('/storage/' . $user->image);
        }

        return response()->json([
            'users' => $users
        ]);
    }

    public function show(Personnel $personnel)
    {
        $personnel->image = asset('/storage/' . $personnel->image);

        return response()->json([
            'user' => [
                'id' => $personnel->id,
                'role' => $personnel->user->role,
                'email' => $personnel->user->email,
                'image' => $personnel->image,
                'name' => $personnel->name,
                'phone' => $personnel->phone,
                'address' => $personnel->address
            ]
        ]);
    }

    public function update(Personnel $personnel)
    {
        $validator = Validator::make(request()->all(), [
            'email' => ['bail', 'required', 'string', 'email', 'max:255'],
            'password' => ['bail', 'nullable', 'string', 'min:8', 'confirmed', 'max:255'],
            'role' => [
                'bail', 'required', 'string', Rule::in(['admin', 'doctor', 'receptionist'])
            ],
            'name' => ['bail', 'required', 'string', 'max:255'],
            'address' => ['bail', 'required', 'string', 'max:255'],
            'phone' => ['bail', 'nullable', 'string', 'max:255'],
            'image' => ['image']
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()
            ], 422);
        }

        $data = $validator->valid();

        // Check if email is already used by another user.
        if (User::where('email', $data['email'])->where('id', '!=', $personnel->user->id)->exists()) {
            return response()->json([
                'message' => ['email' => ['The email has already been taken.']]
            ], 422);
        }

        $personnel->user()->update(
            isset($data['password']) ?  [
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role']
            ] : [
                'email' => $data['email'],
                'role' => $data['role']
            ]
        );

        if (isset($data['image'])) {
            $imageDefaultPath = 'users/default/user.png';
            $imagePath = $data['image']->store('users', 'public');

            if ($personnel->image !== $imageDefaultPath) {
                Storage::delete('public/' . $personnel->image);
            }

            $personnel->update(
                [
                    'name' => $data['name'],
                    'address' => $data['address'],
                    'phone' => $data['phone'] ?? null,
                    'image' => $imagePath
                ]
            );
        } else {
            $personnel->update(
                [
                    'name' => $data['name'],
                    'address' => $data['address'],
                    'phone' => $data['phone'] ?? null,
                ]
            );
        }

        $personnel->load('user');
        $personnel->image = asset('/storage/' .  $personnel->image);

        return response()->json([
            'user' => [
                'id' => $personnel->id,
                'role' => $personnel->user->role,
                'email' => $personnel->user->email,
                'image' => $personnel->image,
                'name' => $personnel->name,
                'phone' => $personnel->phone,
                'address' => $personnel->address
            ]
        ]);
    }

    public function destroy(Personnel $personnel)
    {
        $personnel->user->delete();

        return response()->json([
            'success' => true
        ]);
    }

    public function login()
    {
        $validator = Validator::make(request()->all(), [
            'email' => 'bail|required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()
            ], 401);
        }

        if (Auth::attempt(['email' => request('email'), 'password' => request('password')])) {
            $user = Auth::user();
            $token = $user->createToken('appToken')->accessToken;

            return response(['user' => $user])
                ->cookie('token', $token, 262800, null, null, false, true); // 6 Months Expiration
        } else {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }
    }

    public function register()
    {
        $validator = Validator::make(request()->all(), [
            'email' => ['bail', 'required', 'string', 'email', 'max:255', 'unique:accounts'],
            'password' => ['bail', 'required', 'string', 'min:8', 'confirmed'],
            'role' => [
                'bail', 'required', 'string', Rule::in(['admin', 'doctor', 'receptionist'])
            ],
            'name' => ['bail', 'required', 'string', 'max:255'],
            'address' => ['bail', 'required', 'string', 'max:255'],
            'phone' => ['bail', 'nullable', 'string', 'max:255'],
            'image' => ['image']
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()
            ], 422);
        }

        $data = $validator->valid();
        $imagePath =
            isset($data['image']) ? $data['image']->store('users', 'public') : 'users/default/user.png';

        $user = User::create([
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role']
        ]);

        $user->personnel()->create([
            'name' => $data['name'],
            'address' => $data['address'],
            'phone' => $data['phone'],
            'image' => $imagePath
        ]);
        $user->personnel->image = asset('/storage/' . $user->personnel->image);

        return response()->json([
            'user' => [
                'id' => $user->personnel->id,
                'role' => $user->role,
                'email' => $user->email,
                'image' => $user->personnel->image,
                'name' => $user->personnel->name,
                'address' => $user->personnel->address,
                'phone' => $user->personnel->phone,
            ]
        ]);
    }

    public function logout()
    {
        if (Auth::user()) {
            $user = Auth::user()->token();
            $user->revoke();

            return response()->json([
                'message' => 'Logout successfully'
            ]);
        } else {
            return response()->json([
                'message' => 'Unable to logout'
            ]);
        }
    }

    public function validateToken()
    {
        $user = auth()->user()->load('personnel');
        if ($user->role === 'patient') {
            $user->patient->image = asset('/storage/' . $user->patient->image);

            return response()->json([
                'user' => [
                    'id' => $user->patient->id,
                    'role' => $user->role,
                    'email' => $user->email,
                    'image' => $user->patient->image,
                    'name' => $user->patient->name,
                    'birthdate' => $user->patient->birthdate->format('m-d-Y'),
                    'sex' => $user->patient->sex,
                    'address' => $user->patient->address,
                    'phone' => $user->patient->phone,
                    'note' => $user->patient->note
                ]
            ]);
        } else {
            $user->personnel->image = asset('/storage/' . $user->personnel->image);

            return response()->json([
                'user' => [
                    'id' => $user->personnel->id,
                    'role' => $user->role,
                    'email' => $user->email,
                    'image' => $user->personnel->image,
                    'name' => $user->personnel->name,
                    'address' => $user->personnel->address,
                    'phone' => $user->personnel->phone,
                ]
            ]);
        }
    }

    public function updateProfile()
    {
        $user = null;

        if (auth()->user()->role === 'patient') {
            $user = $this->updateAuthenticatedPatient();
        } else {
            $user = $this->updateAuthenticatedPersonnel();
        }

        return response()->json([
            'user' => $user
        ]);
    }

    private function updateAuthenticatedPersonnel()
    {
        $authUser = auth()->user();

        $data = request()->validate([
            'email' => ['bail', 'required', 'string', 'email', 'max:255'],
            'current_password' => ['bail', 'nullable', 'string', new MatchCurrentPassword],
            'password' => ['bail', 'nullable', 'string', 'min:8', 'confirmed', 'max:255'],
            'name' => ['bail', 'required', 'string', 'max:255'],
            'address' => ['bail', 'required', 'string', 'max:255'],
            'phone' => ['bail', 'nullable', 'string', 'max:255'],
            'image' => ['image']
        ]);

        // Check if email is already used by another user.
        if (User::where('email', $authUser->email)
            ->where('id', '!=', $authUser->id)
            ->exists()
        ) {
            return response()->json([
                'message' => ['email' => ['The email has already been taken.']]
            ], 422);
        }

        $authUser->update(
            isset($data['password']) ?  [
                'email' => $data['email'],
                'password' => Hash::make($data['password'])
            ] : [
                'email' => $data['email']
            ]
        );

        if (isset($data['image'])) {
            $imageDefaultPath = 'users/default/user.png';
            $imagePath = $data['image']->store('users', 'public');

            if ($authUser->personnel->image !== $imageDefaultPath) {
                Storage::delete('public/' . $authUser->personnel->image);
            }

            $authUser->personnel()->update(
                [
                    'name' => $data['name'],
                    'address' => $data['address'],
                    'phone' => $data['phone'] ?? null,
                    'image' => $imagePath
                ]
            );
        } else {
            $authUser->personnel()->update(
                [
                    'name' => $data['name'],
                    'address' => $data['address'],
                    'phone' => $data['phone'] ?? null,
                ]
            );
        }

        $authUser->personnel->image = asset('/storage/' . $authUser->personnel->image);

        return [
            'id' => $authUser->personnel->id,
            'role' => $authUser->personnel->user->role,
            'email' => $authUser->personnel->user->email,
            'image' => $authUser->personnel->image,
            'name' => $authUser->personnel->name,
            'phone' => $authUser->personnel->phone,
            'address' => $authUser->personnel->address
        ];
    }

    private function updateAuthenticatedPatient()
    {
        $authUser = auth()->user();

        $data = request()->validate([
            'email' => ['bail', 'nullable', 'string', 'email', 'max:255'],
            'current_password' => ['bail', 'nullable', 'string', new MatchCurrentPassword],
            'password' => ['bail', 'nullable', 'string', 'min:8', 'confirmed', 'max:255'],
            'name' => ['bail', 'required', 'string', 'max:255'],
            'address' => ['bail', 'required', 'string', 'max:255'],
            'phone' => ['bail', 'required', 'string', 'max:255'],
            'birthdate' => ['bail', 'required', 'date', 'date_format:Y-m-d'],
            'sex' => ['bail', 'required', 'string', Rule::in(['male', 'female'])],
            'image' => ['image'],
            'note' => ['bail', 'nullable', 'string']
        ]);

        if (isset($data['email'])) {
            // Check if email is already used by another user.
            if (User::where('email', $data['email'])
                ->where('id', '!=', $authUser->id)
                ->exists()
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'The given data was invalid.',
                    'errors' => ['email' => ['The email has already been taken.']]
                ], 422);
            }
        }

        $authUser->update(
            isset($data['password']) ? [
                'email' => $data['email'],
                'password' => Hash::make($data['password'])
            ] : [
                'email' => $data['email']
            ]
        );

        $imageDefaultPath = 'patients/default/patient.png';
        $imagePath = isset($data['image']) ?
            $data['image']->store('patients', 'public') : $imageDefaultPath;

        if ($authUser->patient->image !== $imageDefaultPath) {
            Storage::delete('/public/' . $authUser->patient->image);
        }

        $authUser->patient()->update([
            'name' => $data['name'],
            'address' => $data['address'],
            'phone' => $data['phone'],
            'birthdate' => $data['birthdate'],
            'sex' => $data['sex'],
            'image' => $imagePath,
            'note' => $data['note']
        ]);

        $authUser->patient->image = asset('/storage/' . $authUser->patient->image);

        return [
            'id' => $authUser->patient->id,
            'role' => $authUser->role,
            'name' => $authUser->patient->name,
            'sex' => $authUser->patient->sex,
            'birthdate' => $authUser->patient->birthdate,
            'phone' => $authUser->patient->phone,
            'address' => $authUser->patient->address,
            'image' => $authUser->patient->image,
            'note' => $authUser->patient->note,
            'email' => $authUser->patient->user->email
        ];
    }
}
