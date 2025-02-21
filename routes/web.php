<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Allowance;
use App\Http\Controllers\AllowanceController; 

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


Route::get('/connect-wallet', function () {
    return Inertia::render('ConnectWallet');
})->name('connect-wallet');

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
    
])->group(function () {
    Route::get('/dashboard', function () {
        $allowances = Allowance::all();
        return Inertia::render('Dashboard', [
            'allowances' => $allowances,
        ]);
    })->name('dashboard');
});

Route::get('/api/allowances', [AllowanceController::class, 'index']);
Route::post('/api/allowances', [AllowanceController::class, 'store']);
Route::get('/api/allowances/{allowance}', [AllowanceController::class, 'show']);
Route::put('/api/allowances/{allowance}', [AllowanceController::class, 'update']);
Route::delete('/allowances/{allowance}', [AllowanceController::class, 'destroy']);

Route::post('/set-ethereum-connected', [App\Http\Controllers\WalletController::class, 'setConnected']);
Route::post('/unset-ethereum-connected', [App\Http\Controllers\WalletController::class, 'unsetConnected']);